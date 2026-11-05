import { computeShortestPaths } from "./graph.js";

/**
 * Parses package-lock.json (lockfileVersion 2 and 3) using the packages tree.
 * Computes direct vs transitive status and the shortest path from root.
 *
 * @param {string|object} content - Raw JSON string or parsed JSON object
 * @param {string} [lockfilePath="package-lock.json"] - File path relative to repository
 * @returns {{ dependencies: Array<object> }}
 */
export function parsePackageLock(content, lockfilePath = "package-lock.json") {
  let parsed;
  if (typeof content === "string") {
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      throw new Error(`Failed to parse ${lockfilePath}: Invalid JSON (${err.message})`);
    }
  } else {
    parsed = content;
  }

  if (!parsed || typeof parsed !== "object") {
    return { dependencies: [] };
  }

  const packagesTree = parsed.packages;
  if (!packagesTree || typeof packagesTree !== "object") {
    // If packages tree is absent (e.g. legacy v1 lockfile), fallback to top-level dependencies if available
    return parseLegacyPackageLock(parsed, lockfilePath);
  }

  // 1. Identify root dependencies (direct dependencies)
  const rootPackage = packagesTree[""] || {};
  const directDepsObj = {
    ...(rootPackage.dependencies || {}),
    ...(rootPackage.devDependencies || {}),
    ...(rootPackage.optionalDependencies || {}),
  };
  const directDepNames = new Set(Object.keys(directDepsObj));

  // 2. Build adjacency list for shortest path computation and collect packages
  const packageEntries = new Map(); // pkgName -> { installedVersion, isDirect, fallbackPath }
  const dependencyEdges = new Map(); // parentPkgName -> Set of childPkgNames

  for (const [key, pkgEntry] of Object.entries(packagesTree)) {
    if (key === "" || !pkgEntry || typeof pkgEntry !== "object") {
      continue;
    }

    // Determine package name
    let pkgName = pkgEntry.name;
    if (!pkgName) {
      const parts = key.split("node_modules/");
      pkgName = parts[parts.length - 1];
    }
    if (!pkgName || !pkgEntry.version) {
      continue;
    }

    const isDirect = directDepNames.has(pkgName) && key === `node_modules/${pkgName}`;

    // Compute key-derived hierarchy path as fallback
    // e.g. "node_modules/express/node_modules/body-parser/node_modules/qs"
    const keySegments = key
      .split("node_modules/")
      .map((s) => s.replace(/\/$/, "").trim())
      .filter(Boolean);
    const fallbackPath = ["root", ...keySegments];

    if (!packageEntries.has(pkgName) || isDirect) {
      packageEntries.set(pkgName, {
        name: pkgName,
        installedVersion: String(pkgEntry.version),
        isDirect,
        fallbackPath,
      });
    }

    // Record dependency edges for graph
    const subDeps = {
      ...(pkgEntry.dependencies || {}),
      ...(pkgEntry.optionalDependencies || {}),
    };
    if (!dependencyEdges.has(pkgName)) {
      dependencyEdges.set(pkgName, new Set());
    }
    for (const childName of Object.keys(subDeps)) {
      dependencyEdges.get(pkgName).add(childName);
    }
  }

  // Convert Set values to arrays for computeShortestPaths
  const edgesMap = new Map();
  for (const [parent, childrenSet] of dependencyEdges.entries()) {
    edgesMap.set(parent, Array.from(childrenSet));
  }

  // 3. Compute shortest path from root for all packages
  const shortestPaths = computeShortestPaths(Array.from(directDepNames), edgesMap);

  // 4. Assemble normalized dependency list
  const dependencies = [];
  for (const [pkgName, meta] of packageEntries.entries()) {
    let shortestPath = shortestPaths.get(pkgName);

    if (!shortestPath) {
      if (meta.isDirect) {
        shortestPath = ["root", pkgName];
      } else {
        shortestPath = meta.fallbackPath || ["root", pkgName];
      }
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

/**
 * Fallback parser for lockfileVersion 1 (legacy)
 */
function parseLegacyPackageLock(parsed, lockfilePath) {
  const dependencies = [];
  const topDeps = parsed.dependencies || {};

  for (const [name, info] of Object.entries(topDeps)) {
    if (info && info.version) {
      dependencies.push({
        name,
        installedVersion: String(info.version),
        ecosystem: "npm",
        isDirect: true,
        dependencyPath: ["root", name],
        lockfile: lockfilePath,
      });
    }
  }

  return { dependencies };
}

