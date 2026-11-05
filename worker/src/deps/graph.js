/**
 * Dependency graph builder and shortest path calculator from project root.
 */

/**
 * Builds a directed adjacency list and computes the shortest dependency path
 * from "root" to every reachable package using Breadth-First Search (BFS).
 *
 * @param {string[]} directDependencies - Array of direct package names
 * @param {Map<string, string[]>|Record<string, string[]>} dependencyEdges - Map of package -> [child dependencies]
 * @returns {Map<string, string[]>} Map of packageName -> shortest path array (e.g. ['root', 'express', 'qs'])
 */
export function computeShortestPaths(directDependencies = [], dependencyEdges = {}) {
  const adj = new Map();

  // Root edges
  adj.set("root", Array.from(new Set(directDependencies)));

  // Populate edges
  const entries = dependencyEdges instanceof Map
    ? dependencyEdges.entries()
    : Object.entries(dependencyEdges);

  for (const [pkg, children] of entries) {
    if (!adj.has(pkg)) {
      adj.set(pkg, []);
    }
    if (Array.isArray(children)) {
      for (const child of children) {
        adj.get(pkg).push(child);
      }
    }
  }

  // BFS from "root"
  const shortestPaths = new Map();
  shortestPaths.set("root", ["root"]);

  const queue = ["root"];

  while (queue.length > 0) {
    const current = queue.shift();
    const currentPath = shortestPaths.get(current);
    const neighbors = adj.get(current) || [];

    for (const neighbor of neighbors) {
      if (!shortestPaths.has(neighbor)) {
        const nextPath = [...currentPath, neighbor];
        shortestPaths.set(neighbor, nextPath);
        queue.push(neighbor);
      }
    }
  }

  return shortestPaths;
}

/**
 * Formats a path array into a readable string like "root > express > qs"
 * @param {string[]} path
 * @returns {string}
 */
export function formatDependencyPath(path) {
  if (!Array.isArray(path) || path.length === 0) return "root";
  return path.join(" > ");
}

