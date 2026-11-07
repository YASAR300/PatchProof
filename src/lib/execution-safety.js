/**
 * Execution Safety module for GitHub PR checks.
 *
 * Enforces two required barriers before running tests:
 * 1. Project-level toggle: project.executionEnabled === true
 * 2. Environment allow-list: repository appears in EXECUTION_ALLOWED_REPOS (e.g. "owner/repo,org/project")
 */

/**
 * Returns parsed list of allowed repository slugs in "owner/repo" format.
 * @returns {string[]}
 */
export function getExecutionAllowedRepos() {
  const envVal = process.env.EXECUTION_ALLOWED_REPOS || "";
  return envVal
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Checks if a specific repository (owner/repo) is present in the allow-list.
 * @param {string} repoOwner
 * @param {string} repoName
 * @param {object} [project]
 * @returns {boolean}
 */
export function isRepositoryAllowListed(repoOwner, repoName, project = null) {
  const allowed = getExecutionAllowedRepos();
  if (allowed.length === 0) {
    return false;
  }

  // Check wildcard allow-all (if configured in dev)
  if (allowed.includes("*") || allowed.includes("all")) {
    return true;
  }

  const slug = `${repoOwner || ""}/${repoName || ""}`.trim().toLowerCase();
  if (allowed.includes(slug)) {
    return true;
  }

  // Also check project repoName or slug if provided
  if (project) {
    const projectSlug = String(project.slug || "").toLowerCase();
    const projectRepoName = String(project.repoName || "").toLowerCase();
    if (allowed.includes(projectSlug) || allowed.includes(projectRepoName)) {
      return true;
    }
  }

  return false;
}

/**
 * Determines whether PR check execution is permitted for a given project.
 * Both executionEnabled must be true AND the repository must be in EXECUTION_ALLOWED_REPOS.
 *
 * @param {object} project
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function checkPrExecutionAllowed(project) {
  if (!project) {
    return { allowed: false, reason: "Project not found" };
  }

  if (!project.executionEnabled) {
    return {
      allowed: false,
      reason: "executionEnabled is disabled for this project",
    };
  }

  const isAllowListed = isRepositoryAllowListed(
    project.repoOwner,
    project.repoName,
    project
  );

  if (!isAllowListed) {
    return {
      allowed: false,
      reason: "skipped: execution not allowed",
    };
  }

  return { allowed: true };
}
