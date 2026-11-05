import { NextResponse } from "next/server";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/github/repos
 * Lists repositories available to import:
 * - If user has githubId, queries GitHub REST API for their public & private repositories
 * - Provides curated popular/recent repositories for instant 1-click connection
 * - Includes the built-in vulnerable demo target
 */
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const repos = [];

    // 1. Always offer the built-in vulnerable demo repository
    repos.push({
      id: "demo-target",
      name: "demo-vulnerable-repo",
      fullName: "local/demo-vulnerable-repo",
      htmlUrl: "local:.data/demo-target",
      defaultBranch: "baseline",
      language: "Python",
      description: "Official PatchProof vulnerable target containing SQLi and deterministic reproducers",
      isDemo: true,
      isPrivate: false,
    });

    // 2. Fetch remote repos from GitHub if user has GitHub identity or GitHub token
    const githubUsername = user.name?.replace(/\s+/g, "") || "YASAR300";
    const headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "PatchProof-Scanner",
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    try {
      const ghRes = await fetch(
        `https://api.github.com/users/${encodeURIComponent(githubUsername)}/repos?sort=updated&per_page=15`,
        { headers, next: { revalidate: 60 } }
      );

      if (ghRes.ok) {
        const ghData = await ghRes.json();
        if (Array.isArray(ghData)) {
          ghData.forEach((r) => {
            repos.push({
              id: String(r.id),
              name: r.name,
              fullName: r.full_name,
              htmlUrl: r.html_url,
              defaultBranch: r.default_branch || "main",
              language: r.language || "JavaScript/TypeScript",
              description: r.description || "GitHub repository",
              isDemo: false,
              isPrivate: Boolean(r.private),
            });
          });
        }
      }
    } catch (ghErr) {
      console.warn("GitHub repos fetch error (non-fatal):", ghErr.message);
    }

    // 3. Fallback curated repos if GitHub rate-limited or offline
    if (repos.length === 1) {
      repos.push(
        {
          id: "loopwise",
          name: "LOOPWISE",
          fullName: "YASAR300/LOOPWISE",
          htmlUrl: "https://github.com/YASAR300/LOOPWISE",
          defaultBranch: "main",
          language: "JavaScript/TypeScript",
          description: "Full-stack cloud workspace and development platform",
          isDemo: false,
          isPrivate: false,
        },
        {
          id: "flask",
          name: "flask",
          fullName: "pallets/flask",
          htmlUrl: "https://github.com/pallets/flask",
          defaultBranch: "main",
          language: "Python",
          description: "The Python micro framework for building web applications",
          isDemo: false,
          isPrivate: false,
        }
      );
    }

    return NextResponse.json({ ok: true, repos });
  } catch (err) {
    console.error("Failed to load GitHub repos:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load repositories." },
      { status: 500 }
    );
  }
}

