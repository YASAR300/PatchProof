/**
 * requirements.txt parser.
 * Extracts pinned == packages as direct dependencies and records unsupported specifiers as unresolved.
 */

/**
 * Parses requirements.txt content.
 *
 * @param {string} content - Raw content of requirements.txt
 * @param {string} [lockfilePath="requirements.txt"] - File path relative to repository
 * @returns {{ dependencies: Array<object>, unresolved: Array<object> }}
 */
export function parseRequirementsTxt(content, lockfilePath = "requirements.txt") {
  if (!content || typeof content !== "string") {
    return { dependencies: [], unresolved: [] };
  }

  const lines = content.split(/\r?\n/);
  const dependencies = [];
  const unresolved = [];
  const seenPackages = new Set();

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    let line = rawLine.trim();

    // Skip empty lines and full comment lines
    if (!line || line.startsWith("#")) {
      continue;
    }

    // Skip pip flags like -r other.txt, -f, -i, --index-url
    if (line.startsWith("-") || line.startsWith("--")) {
      continue;
    }

    // Strip inline comments: e.g. "requests==2.20.0 # security update"
    const commentIdx = line.indexOf("#");
    if (commentIdx !== -1) {
      line = line.slice(0, commentIdx).trim();
    }
    if (!line) continue;

    // Strip environment markers: e.g. "pywin32==300; sys_platform == 'win32'"
    const markerIdx = line.indexOf(";");
    if (markerIdx !== -1) {
      line = line.slice(0, markerIdx).trim();
    }
    if (!line) continue;

    // Check for exact pinned equality: "=="
    // Note: Python requirements can have extras like "requests[security]==2.20.0"
    const pinnedMatch = line.match(/^([a-zA-Z0-9_\-\.]+)(?:\[[^\]]+\])?\s*==\s*([a-zA-Z0-9_\-\.\+]+)$/);

    if (pinnedMatch) {
      const name = pinnedMatch[1].trim();
      const version = pinnedMatch[2].trim();

      if (!seenPackages.has(name.toLowerCase())) {
        seenPackages.add(name.toLowerCase());
        dependencies.push({
          name,
          installedVersion: version,
          ecosystem: "PyPI",
          isDirect: true,
          dependencyPath: ["root", name],
          lockfile: lockfilePath,
        });
      }
    } else {
      // Unsupported specifier (>=, <=, ~=, >, <, !=, @, URL)
      // Extract possible package name if present
      const nameMatch = line.match(/^([a-zA-Z0-9_\-\.]+)/);
      const name = nameMatch ? nameMatch[1] : line;

      unresolved.push({
        line: rawLine,
        lineNumber: idx + 1,
        name,
        lockfile: lockfilePath,
        reason: "unsupported specifier (only == pinned versions supported)",
      });
    }
  }

  return { dependencies, unresolved };
}

