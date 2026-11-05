import YAML from "yaml";
import { computeShortestPaths } from "./graph.js";

/**
 * Extracts package name and version from a pnpm package key.
 * Examples:
 *   "/express@4.18.2" -> { name: "express", version: "4.18.2" }
 *   "/@types/node@18.11.9" -> { name: "@types/node", version: "18.11.9" }
 *   "express@4.18.2" -> { name: "express", version: "4.18.2" }
 *   "express@4.18.2(debug@4.3.4)" -> { name: "express", version: "4.18.2" }
 *   "/lodash/4.17.21" -> { name: "lodash", version: "4.17.21" }
 *
 * @param {string} rawKey
 * @returns {{ name: string, version: string }|null}
 */
export function parsePnpmPackageKey(rawKey) {
  if (!rawKey || typeof rawKey !== "string") return null;

  let key = rawKey.trim();
  // Strip leading slash
  if (key.startsWith("/")) {
    key = key.slice(1);
  }

  // Strip peer dependency qualifier at end, e.g. "(react@18.2.0)"
  const peerParenIdx = key.indexOf("(");
  if (peerParenIdx !== -1) {
    key = key.slice(0, peerParenIdx);
  }

  // Handle scoped packages: @scope/name@version
  if (key.startsWith("@")) {
    const slashIdx = key.indexOf("/");
    if (slashIdx === -1) return null;
    const atAfterScopeIdx = key.indexOf("@", slashIdx + 1);
    if (atAfterScopeIdx !== -1) {
      const name = key.slice(0, atAfterScopeIdx);
      const version = key.slice(atAfterScopeIdx + 1);
      return { name, version };
    }
    // Fallback: check slash format e.g. @scope/name/version
    const secondSlashIdx = key.indexOf("/", slashIdx + 1);
    if (secondSlashIdx !== -1) {
      const name = key.slice(0, secondSlashIdx);
      const version = key.slice(secondSlashIdx + 1);
      return { name, version };
    }
  } else {
    // Non-scoped package: name@version or name/version
    const atIdx = key.lastIndexOf("@");
    if (atIdx !== -1 && atIdx > 0) {
      const name = key.slice(0, atIdx);
      const version = key.slice(atIdx + 1);
      return { name, version };
    }
    const slashIdx = key.lastIndexOf("/");
    if (slashIdx !== -1 && slashIdx > 0) {
      const name = key.slice(0, slashIdx);
      const version = key.slice(slashIdx + 1);
      return { name, version };
    }
  }

  return null;
}

/**
 * Parses pnpm-lock.yaml (v6 and v9) content.
 *
 * @param {string} content - Raw YAML string
 * @param {string} [lockfilePath="pnpm-lock.yaml"] - File path relative to repository
 * @returns {{ dependencies: Array<object> }}
 */
export function parsePnpmLock(content, lockfilePath = "pnpm-lock.yaml") {
  if (!content || typeof content !== "string") {
    return { dependencies: [] };
  }

  let doc;
  try {
    doc = YAML.parse(content);
  } catch (err) {
    throw new Error(`Failed to parse ${lockfilePath}: Invalid YAML (${err.message})`);
  }

  if (!doc || typeof doc !== "object") {
    return { dependencies: [] };
  }

  // 1. Extract direct dependencies
  const directDepNames = new Set();

  // In v6 and v9: importers['.'] holds root dependencies
  const rootImporter = doc.importers?.["."] || doc.importers?.["root"];
  if (rootImporter) {
    const rootDirects = {
      ...(rootImporter.dependencies || {}),
      ...(rootImporter.devDependencies || {}),
      ...(rootImporter.optionalDependencies || {}),
    };
    for (const name of Object.keys(rootDirects)) {
      directDepNames.add(name);
    }
  }

  // Top-level dependencies fallback (e.g. earlier versions or flat structure)
  const topDirects = {
    ...(doc.dependencies || {}),
    ...(doc.devDependencies || {}),
    ...(doc.optionalDependencies || {}),
  };
  for (const name of Object.keys(topDirects)) {
    directDepNames.add(name);
  }

  // 2. Iterate packages / snapshots section
  const packagesObj = doc.packages || doc.snapshots || {};
  const packageEntries = new Map(); // pkgName -> { installedVersion, isDirect }
  const dependencyEdges = new Map(); // parentPkgName -> Set of childPkgNames

  for (const [key, pkgEntry] of Object.entries(packagesObj)) {
    const parsedKey = parsePnpmPackageKey(key);
    if (!parsedKey) continue;

    const { name: pkgName, version: pkgVersion } = parsedKey;
    const isDirect = directDepNames.has(pkgName);

    if (!packageEntries.has(pkgName) || isDirect) {
      packageEntries.set(pkgName, {
        name: pkgName,
        installedVersion: pkgVersion,
        isDirect,
      });
    }

    // Capture child dependencies
    const subDeps = {
      ...(pkgEntry?.dependencies || {}),
      ...(pkgEntry?.optionalDependencies || {}),
    };
    if (!dependencyEdges.has(pkgName)) {
      dependencyEdges.set(pkgName, new Set());
    }
    for (const childName of Object.keys(subDeps)) {
      dependencyEdges.get(pkgName).add(childName);
    }
  }

  // Convert Set values to arrays
  const edgesMap = new Map();
  for (const [parent, childrenSet] of dependencyEdges.entries()) {
    edgesMap.set(parent, Array.from(childrenSet));
  }

  // 3. Compute shortest paths using BFS from root
  const shortestPaths = computeShortestPaths(Array.from(directDepNames), edgesMap);

  // 4. Build normalized dependencies
  const dependencies = [];
  for (const [pkgName, meta] of packageEntries.entries()) {
    let shortestPath = shortestPaths.get(pkgName);
    if (!shortestPath) {
      shortestPath = ["root", pkgName];
    }

    dependencies.push({
      name: pkgName,
      installedVersion: meta.installedVersion,
      ecosystem: "npm",
      isDirect: meta.isDirect,
      dependencyPath: shortestPath,
      lockfile: lockfilePath,
    });
  }

  return { dependencies };
}

