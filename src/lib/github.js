/**
 * GitHub REST API Client & URL Parser for PatchProof
 * Includes strict URL validation, in-memory 60s caching,
 * rate limit handling, and Git Trees manifest detection.
 */

// In-memory cache: key -> { data, expiresAt }
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Strictly parses and validates a GitHub repository URL.
 * Only accepts https://github.com/owner/repo.
 * Rejects credentials, any non-github.com hosts, and invalid paths.
 */
export function parseGitHubUrl(input) {
  if (!input || typeof input !== "string") {
    throw new Error("Repository URL is required.");
  }

  const trimmed = input.trim();

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("Invalid URL format. Please provide a valid https://github.com/owner/repo URL.");
  }

  // Strictly enforce HTTPS
  if (parsed.protocol !== "https:") {
    throw new Error("Repository URL must use https:// protocol.");
  }

  // Reject embedded credentials (e.g. https://user:pass@github.com/...)
  if (parsed.username || parsed.password) {
    throw new Error("URLs with embedded credentials are not allowed for security reasons.");
  }

  // Strictly enforce github.com host only
  const host = parsed.hostname.toLowerCase();
  if (host !== "github.com") {
    throw new Error(`Only GitHub repositories are supported. Host "${host}" is not permitted.`);
  }

  // Normalize path: strip trailing slash and optional .git suffix
  let pathname = parsed.pathname.trim();
  if (pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }
  if (pathname.endsWith(".git")) {
    pathname = pathname.slice(0, -4);
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 2) {
    throw new Error("Repository URL must be of the form https://github.com/owner/repo");
  }

  const [owner, repo] = segments;

  // Validate owner and repo characters (GitHub rules: alphanumeric, hyphens, underscores, dots)
  const validOwnerPattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?$/;
  const validRepoPattern = /^[a-zA-Z0-9_.-]+$/;

  if (!validOwnerPattern.test(owner) || !validRepoPattern.test(repo)) {
    throw new Error("Repository URL contains invalid characters in owner or repository name.");
  }

  return {
    owner,
    repo,
    cleanUrl: `https://github.com/${owner}/${repo}`,
  };
}

/**
 * Internal helper to fetch from GitHub REST API with 60s in-memory caching.
 */
async function fetchGitHubApi(endpoint) {
  const url = endpoint.startsWith("https://")
    ? endpoint
    : `https://api.github.com${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  // Check in-memory cache
  const cached = cache.get(url);
  const now = Date.now();
  if (cached && now < cached.expiresAt) {
    return cached.data;
  }

  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "PatchProof-Security-Harness/1.0",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      headers,
      next: { revalidate: 60 },
    });
  } catch (err) {
    throw new Error(`Failed to connect to GitHub API: ${err.message}`);
  }

  if (response.status === 404) {
    throw new Error(
      "Repository not found on GitHub or is private. Please verify the URL and ensure the repository is public."
    );
  }

  if (response.status === 403) {
    const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
    if (rateLimitRemaining === "0") {
      throw new Error(
        "GitHub API rate limit exceeded. Please configure GITHUB_TOKEN or try again in a few minutes."
      );
    }
    throw new Error(
      "Access to this GitHub repository was forbidden. It may be private or restricted by organization policies."
    );
  }

  if (!response.ok) {
    let errorDetail = "";
    try {
      const errBody = await response.json();
      errorDetail = errBody.message ? `: ${errBody.message}` : "";
    } catch {
      // ignore json parse error on non-ok
    }
    throw new Error(`GitHub API request failed with status ${response.status}${errorDetail}`);
  }

  const data = await response.json();

  // Save in cache for 60 seconds
  cache.set(url, {
    data,
    expiresAt: now + CACHE_TTL_MS,
  });

  return data;
}

/**
 * Fetches repository metadata from GitHub.
 */
export async function getGitHubRepo(owner, repo) {
  const data = await fetchGitHubApi(`/repos/${owner}/${repo}`);
  return {
    id: data.id,
    name: data.name,
    fullName: data.full_name,
    owner: data.owner?.login || owner,
    defaultBranch: data.default_branch || "main",
    primaryLanguage: data.language || null,
    isPrivate: Boolean(data.private),
    description: data.description || "",
    htmlUrl: data.html_url,
    stars: data.stargazers_count || 0,
    forks: data.forks_count || 0,
    pushedAt: data.pushed_at,
  };
}

/**
 * Fetches the latest commit SHA of a given branch.
 */
export async function getLatestCommitSha(owner, repo, branch) {
  const data = await fetchGitHubApi(`/repos/${owner}/${repo}/commits/${branch}`);
  return {
    sha: data.sha,
    shortSha: data.sha ? data.sha.slice(0, 7) : "",
    message: data.commit?.message || "",
    authorName: data.commit?.author?.name || data.author?.login || "Unknown",
    date: data.commit?.author?.date || data.commit?.committer?.date || new Date().toISOString(),
  };
}

/**
 * Target manifest files to detect at root or one level down:
 * requirements.txt, package-lock.json, pnpm-lock.yaml, package.json, pyproject.toml
 */
const TARGET_MANIFESTS = new Set([
  "requirements.txt",
  "package-lock.json",
  "pnpm-lock.yaml",
  "package.json",
  "pyproject.toml",
]);

/**
 * Detects which target manifests exist at the repository root or one level down
 * using the Git trees API recursive tree for the given commit SHA.
 */
export async function detectManifests(owner, repo, commitSha) {
  try {
    const treeData = await fetchGitHubApi(`/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`);
    const tree = treeData.tree || [];

    const found = [];
    for (const item of tree) {
      if (item.type !== "blob") continue;

      const path = item.path;
      const parts = path.split("/");

      // Only check root (length 1) or one level down (length 2)
      if (parts.length <= 2) {
        const filename = parts[parts.length - 1];
        if (TARGET_MANIFESTS.has(filename)) {
          found.push(path);
        }
      }
    }

    return found.sort();
  } catch (err) {
    console.warn(`Could not inspect Git tree for manifests (${owner}/${repo}):`, err.message);
    return [];
  }
}

/**
 * Maps GitHub language to PatchProof supported languages:
 * "Python" or "JavaScript/TypeScript"
 */
export function suggestLanguage(githubLanguage, manifests = []) {
  if (githubLanguage) {
    const lang = githubLanguage.toLowerCase();
    if (lang === "python") return "Python";
    if (lang === "javascript" || lang === "typescript") return "JavaScript/TypeScript";
  }

  // Fallback to detected manifests
  for (const m of manifests) {
    const filename = m.split("/").pop();
    if (filename === "requirements.txt" || filename === "pyproject.toml") {
      return "Python";
    }
    if (
      filename === "package.json" ||
      filename === "package-lock.json" ||
      filename === "pnpm-lock.yaml"
    ) {
      return "JavaScript/TypeScript";
    }
  }

  // Default to JavaScript/TypeScript if undetermined
  return "JavaScript/TypeScript";
}

/**
 * Fetches the latest 15 commits for a repository on the specified branch.
 */
export async function getRecentCommits(owner, repo, branch, limit = 15) {
  try {
    const commits = await fetchGitHubApi(
      `/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=${limit}`
    );

    if (!Array.isArray(commits)) return [];

    return commits.slice(0, limit).map((c) => ({
      sha: c.sha,
      shortSha: c.sha ? c.sha.slice(0, 7) : "",
      message: c.commit?.message?.split("\n")[0] || "No commit message",
      fullMessage: c.commit?.message || "",
      author: c.commit?.author?.name || c.author?.login || "Unknown",
      authorAvatar: c.author?.avatar_url || null,
      date: c.commit?.author?.date || c.commit?.committer?.date || "",
      htmlUrl: c.html_url,
    }));
  } catch (err) {
    console.warn(`Failed to fetch recent commits for ${owner}/${repo}:`, err.message);
    return [];
  }
}

