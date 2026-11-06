/**
 * Finding to Reproducer Compatibility Resolver.
 */

/**
 * Resolves a compatible reproducer harness for a given finding and project.
 *
 * Rule:
 * - Verification only runs when project.executionEnabled is true and a compatible reproducer is registered.
 * - Demo mapping: SQL injection finding in src/users.py maps to reproducer sqli_find_user from demo-manifest.json.
 * - Otherwise the finding stays UNVERIFIED with exact message:
 *   'No compatible reproducer is available, so this finding remains unverified.'
 *
 * @param {object} finding
 * @param {object} project
 * @returns {{ compatible: boolean, reproducerId?: string, reproducerPath?: string, command?: string, message?: string }}
 */
export function resolveReproducer(finding, project) {
  if (!project || !project.executionEnabled) {
    return {
      compatible: false,
      message: "No compatible reproducer is available, so this finding remains unverified.",
    };
  }

  // Demo target or supported target mapping
  const isDemoProject = Boolean(
    project.isDemo ||
    (typeof project.repoUrl === "string" && project.repoUrl.startsWith("local:")) ||
    project.repoName === "demo-target" ||
    project.repoName === "LOOPWISE" ||
    project.name === "LOOPWISE"
  );

  if (isDemoProject) {
    const filePath = (finding.filePath || "").replace(/\\/g, "/");
    const ruleId = (finding.ruleId || "").toLowerCase();

    // Check if finding is SQL injection in src/users.py
    const isSqlInUsers =
      filePath.endsWith("src/users.py") &&
      (ruleId.includes("sql") || ruleId.includes("sqli"));

    if (isSqlInUsers) {
      return {
        compatible: true,
        reproducerId: "sqli_find_user",
        reproducerPath: "security/reproducers/sqli_find_user.py",
        command: "python security/reproducers/sqli_find_user.py",
      };
    }
  }

  // No compatible reproducer found
  return {
    compatible: false,
    message: "No compatible reproducer is available, so this finding remains unverified.",
  };
}

