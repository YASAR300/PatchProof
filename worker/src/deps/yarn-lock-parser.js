/**
 * yarn.lock (v1) parser.
 * Extracts resolved dependencies (name, installedVersion, ecosystem: npm, isDirect: true/false).
 */

/**
 * Parses yarn.lock content.
 *
 * @param {string} content - Raw content of yarn.lock
 * @param {string} [lockfilePath="yarn.lock"] - File path relative to repository
 * @returns {{ dependencies: Array<object>, unresolved: Array<object> }}
 */
export function parseYarnLock(content, lockfilePath = "yarn.lock") {
  if (!content || typeof content !== "string") {
    return { dependencies: [], unresolved: [] };
  }

  const lines = content.split(/\r?\n/);
  const dependencies = [];
  const unresolved = [];
  const seenPackages = new Map();

  let currentHeaders = [];
  let currentVersion = null;

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    if (!rawLine.startsWith(" ") && !rawLine.startsWith("\t") && trimmed.endsWith(":")) {
      if (currentHeaders.length > 0 && currentVersion) {
        for (const h of currentHeaders) {
          const match = h.replace(/^["']|["']$/g, "").match(/^(@?[^@]+)@/);
          if (match) {
            const name = match[1];
            if (!seenPackages.has(`${name}@${currentVersion}`)) {
              seenPackages.set(`${name}@${currentVersion}`, true);
              dependencies.push({
                name,
                installedVersion: currentVersion,
                ecosystem: "npm",
                isDirect: true,
                dependencyPath: ["root", name],
                lockfile: lockfilePath,
              });
            }
          }
        }
      }

      const headerSlice = trimmed.slice(0, -1);
      currentHeaders = headerSlice.split(",").map((s) => s.trim());
      currentVersion = null;
      continue;
    }

    const verMatch = trimmed.match(/^version\s+["']?([^"'\s]+)["']?$/);
    if (verMatch) {
      currentVersion = verMatch[1];
    }
  }

  if (currentHeaders.length > 0 && currentVersion) {
    for (const h of currentHeaders) {
      const match = h.replace(/^["']|["']$/g, "").match(/^(@?[^@]+)@/);
      if (match) {
        const name = match[1];
        if (!seenPackages.has(`${name}@${currentVersion}`)) {
          seenPackages.set(`${name}@${currentVersion}`, true);
          dependencies.push({
            name,
            installedVersion: currentVersion,
            ecosystem: "npm",
            isDirect: true,
            dependencyPath: ["root", name],
            lockfile: lockfilePath,
          });
        }
      }
    }
  }

  return { dependencies, unresolved };
}
