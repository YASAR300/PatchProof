import fs from "node:fs";
import path from "node:path";
import { parseRequirementsTxt } from "./requirements-parser.js";
import { parsePackageLock } from "./package-lock-parser.js";
import { parsePnpmLock } from "./pnpm-lock-parser.js";

const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "__pycache__",
  ".venv",
  "venv",
  "env",
  ".next",
  "dist",
  "build",
]);

/**
 * Recursively scans a directory for supported dependency manifest files:
 * - requirements.txt
 * - package-lock.json
 * - pnpm-lock.yaml
 *
 * @param {string} rootDir - Absolute path to checked-out repository
 * @returns {Array<{ relativePath: string, fullPath: string, type: 'requirements'|'package-lock'|'pnpm-lock' }>}
 */
export function discoverManifestFiles(rootDir) {
  const manifests = [];

  function walk(currentDir) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const ent of entries) {
      if (ent.isDirectory()) {
        if (!IGNORED_DIRS.has(ent.name)) {
          walk(path.join(currentDir, ent.name));
        }
      } else if (ent.isFile()) {
        const fullPath = path.join(currentDir, ent.name);
        const relPath = path.relative(rootDir, fullPath).replace(/\\/g, "/");

        if (ent.name === "requirements.txt" || ent.name.endsWith(".requirements.txt")) {
          manifests.push({ relativePath: relPath, fullPath, type: "requirements" });
        } else if (ent.name === "package-lock.json") {
          manifests.push({ relativePath: relPath, fullPath, type: "package-lock" });
        } else if (ent.name === "pnpm-lock.yaml") {
          manifests.push({ relativePath: relPath, fullPath, type: "pnpm-lock" });
        }
      }
    }
  }

  walk(rootDir);
  return manifests;
}

/**
 * Parses all discovered manifests in the repository.
 *
 * @param {string} repoDir
 * @returns {{ dependencies: Array<object>, unresolved: Array<object>, manifestsScanned: Array<string> }}
 */
export function scanRepositoryDependencies(repoDir) {
  const manifestFiles = discoverManifestFiles(repoDir);
  const allDependencies = [];
  const allUnresolved = [];
  const manifestsScanned = [];

  for (const manifest of manifestFiles) {
    manifestsScanned.push(manifest.relativePath);
    let content = "";
    try {
      content = fs.readFileSync(manifest.fullPath, "utf8");
    } catch (err) {
      allUnresolved.push({
        lockfile: manifest.relativePath,
        reason: `Could not read file: ${err.message}`,
      });
      continue;
    }

    if (manifest.type === "requirements") {
      const res = parseRequirementsTxt(content, manifest.relativePath);
      allDependencies.push(...res.dependencies);
      allUnresolved.push(...res.unresolved);
    } else if (manifest.type === "package-lock") {
      const res = parsePackageLock(content, manifest.relativePath);
      allDependencies.push(...res.dependencies);
    } else if (manifest.type === "pnpm-lock") {
      const res = parsePnpmLock(content, manifest.relativePath);
      allDependencies.push(...res.dependencies);
    }
  }

  // Deduplicate dependencies per (ecosystem, name, installedVersion, lockfile)
  const uniqueMap = new Map();
  for (const dep of allDependencies) {
    const key = `${dep.ecosystem}:${dep.name.toLowerCase()}@${dep.installedVersion}:${dep.lockfile}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, dep);
    }
  }

  return {
    dependencies: Array.from(uniqueMap.values()),
    unresolved: allUnresolved,
    manifestsScanned,
  };
}

