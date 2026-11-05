/**
 * Version comparison and compatibility risk utilities.
 */

/**
 * Normalizes version strings by stripping 'v', spaces, and pre-release/build suffixes.
 * @param {string} v
 * @returns {number[]} Array of numeric version components
 */
function toVersionNumbers(v) {
  if (!v || typeof v !== "string") return [0, 0, 0];
  const cleaned = v.replace(/^v/i, "").trim().split(/[-+]/)[0];
  const parts = cleaned.split(".").map((p) => {
    const num = parseInt(p, 10);
    return isNaN(num) ? 0 : num;
  });
  while (parts.length < 3) parts.push(0);
  return parts;
}

/**
 * Compares two version strings.
 * Returns negative if v1 < v2, 0 if v1 === v2, positive if v1 > v2.
 *
 * @param {string} v1
 * @param {string} v2
 * @returns {number}
 */
export function compareVersions(v1, v2) {
  const p1 = toVersionNumbers(v1);
  const p2 = toVersionNumbers(v2);

  const len = Math.max(p1.length, p2.length);
  for (let i = 0; i < len; i++) {
    const a = p1[i] ?? 0;
    const b = p2[i] ?? 0;
    if (a !== b) return a - b;
  }
  return 0;
}

/**
 * Determines whether the fixed version represents a major version bump from the installed version.
 * e.g. 1.0.2 -> 2.0.0 (true), 4.17.15 -> 4.17.21 (false), 0.2.0 -> 0.3.0 (true in 0.x)
 *
 * @param {string} installedVersion
 * @param {string} fixedVersion
 * @returns {boolean}
 */
export function isMajorBump(installedVersion, fixedVersion) {
  if (!installedVersion || !fixedVersion) return false;

  const [maj1, min1] = toVersionNumbers(installedVersion);
  const [maj2, min2] = toVersionNumbers(fixedVersion);

  if (maj2 > maj1) {
    return true;
  }

  // In 0.x versions (e.g. 0.2.0 -> 0.3.0), minor bumps are breaking major changes
  if (maj1 === 0 && maj2 === 0 && min2 > min1) {
    return true;
  }

  return false;
}

