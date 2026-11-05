import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile, execFileSync, spawn } from "node:child_process";
import { promisify } from "node:util";
import { prisma } from "../db.js";
import { scanRepositoryDependencies } from "../deps/index.js";
import {
  queryOsvBatch,
  fetchVulnDetails,
  extractSeverity,
  extractAffectedRange,
  findLowestFixedVersion,
} from "../deps/osv-client.js";

const execFileAsync = promisify(execFile);

/**
 * Extracts a tar buffer into a target directory.
 * @param {Buffer} tarBuffer
 * @param {string} destDir
 */
function extractTarBuffer(tarBuffer, destDir) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(destDir, { recursive: true });
    const child = spawn("tar", ["-xf", "-", "-C", destDir], {
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });

    child.stdin.write(tarBuffer);
    child.stdin.end();

    let errOut = "";
    child.stderr.on("data", (d) => {
      errOut += d.toString();
    });

    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Failed to extract tar archive: ${errOut}`));
    });

    child.on("error", (err) => reject(err));
  });
}

/**
 * Handles 'dependency-scan' job type.
 * Inspects repository dependency manifests, queries OSV.dev batch API,
 * records Dependency rows, and writes audit events.
 *
 * @param {object} job
 * @param {object} context
 * @param {(line: string) => Promise<void>} context.appendLog
 * @returns {Promise<object>}
 */
export async function handleDependencyScan(job, { appendLog }) {
  const startedAt = new Date();
  const payload = job.payload || {};
  const projectId = job.projectId || payload.projectId;
  const requestedRef = payload.commitSha || payload.targetRef;

  if (!projectId) {
    throw new Error("Dependency scan job missing required projectId.");
  }

  // 1. Fetch project from database
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error(`Project ${projectId} not found.`);
  }

  await appendLog(`Starting dependency scan for ${project.name} (${project.repoOwner}/${project.repoName})...`);

  // Record audit event: DEPENDENCY_SCAN_STARTED
  try {
    await prisma.auditEvent.create({
      data: {
        actorId: job.createdById || null,
        projectId: project.id,
        action: "DEPENDENCY_SCAN_STARTED",
        entityType: "Project",
        entityId: project.id,
        metadata: {
          jobId: job.id,
          targetRef: requestedRef || project.defaultBranch,
        },
      },
    });
  } catch (err) {
    console.warn(`[dependency-scan] Failed to create start audit event:`, err.message);
  }

  let targetDir = null;
  let isTempDir = false;
  const tmpRoot = os.tmpdir();
  const checkoutTempDir = path.join(tmpRoot, `patchproof-deps-${job.id}`);

  try {
    // 2. Checkout or export source code
    const targetRef = requestedRef || project.defaultBranch || "HEAD";

    if (project.isDemo || project.repoUrl.startsWith("local:")) {
      const demoRepoPath = path.resolve(process.env.DEMO_REPO_PATH || "./.data/demo-target");
      if (!fs.existsSync(demoRepoPath)) {
        throw new Error(`Demo target repository not found at '${demoRepoPath}'.`);
      }

      await appendLog(`Source: Demo repository at ${demoRepoPath} (ref: ${targetRef})`);
      const archiveBuffer = execFileSync("git", ["-C", demoRepoPath, "archive", "--format=tar", targetRef], {
        maxBuffer: 50 * 1024 * 1024,
      });

      targetDir = checkoutTempDir;
      isTempDir = true;
      await extractTarBuffer(archiveBuffer, targetDir);
      await appendLog(`Exported repository archive to temporary workspace.`);
    } else {
      const repoUrl = project.repoUrl;
      targetDir = checkoutTempDir;
      isTempDir = true;

      await appendLog(`Cloning repository ${repoUrl} (branch: ${targetRef}) with depth 1...`);
      const cloneArgs = ["clone", "--depth", "1", "--no-recurse-submodules"];
      if (project.defaultBranch) {
        cloneArgs.push("--branch", project.defaultBranch.trim());
      }
      cloneArgs.push(repoUrl, targetDir);

      try {
        await execFileAsync("git", cloneArgs, {
          env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
        });
      } catch (cloneErr) {
        if (project.defaultBranch) {
          await appendLog(`Branch clone failed, retrying with default remote HEAD branch...`);
          await execFileAsync("git", ["clone", "--depth", "1", "--no-recurse-submodules", repoUrl, targetDir], {
            env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
          });
        } else {
          throw cloneErr;
        }
      }
      await appendLog(`Shallow clone completed successfully.`);
    }

    // 3. Scan manifests
    await appendLog(`Discovering and parsing dependency manifests...`);
    const { dependencies, unresolved, manifestsScanned } = scanRepositoryDependencies(targetDir);

    await appendLog(`Discovered ${manifestsScanned.length} manifest file(s): ${manifestsScanned.join(", ")}`);
    await appendLog(`Extracted ${dependencies.length} unique package dependencies.`);

    if (unresolved.length > 0) {
      await appendLog(`Reported ${unresolved.length} unresolved specifier(s) (only pinned == lines parsed in requirements.txt).`);
      for (const unres of unresolved.slice(0, 5)) {
        await appendLog(`  Unresolved: ${unres.name || unres.line} (${unres.reason}) in ${unres.lockfile}`);
      }
      if (unresolved.length > 5) {
        await appendLog(`  ...and ${unresolved.length - 5} more unresolved specifiers.`);
      }
    }

    // Update project's detected manifests if new manifests discovered
    if (manifestsScanned.length > 0) {
      try {
        await prisma.project.update({
          where: { id: project.id },
          data: { detectedManifests: manifestsScanned },
        });
      } catch (err) {
        console.warn(`[dependency-scan] Failed to update project manifests:`, err.message);
      }
    }

    // 4. Query OSV.dev batch API
    await appendLog(`Querying OSV.dev batch vulnerability API (cached for 24 hours)...`);
    let osvResults = new Map();
    let osvOffline = false;

    try {
      osvResults = await queryOsvBatch(dependencies, { prisma, timeoutMs: 12000 });
      await appendLog(`OSV query complete: processed ${dependencies.length} package queries.`);
    } catch (osvErr) {
      osvOffline = true;
      await appendLog(`WARNING: OSV.dev API is currently unreachable (${osvErr.message}). Recording dependencies with zero known advisories.`);
    }

    // 5. Build Dependency rows
    const dependencyRows = [];
    let packagesWithAdvisories = 0;
    let totalAdvisories = 0;
    let directCount = 0;
    let transitiveCount = 0;

    const seenPkgWithVuln = new Set();

    for (const dep of dependencies) {
      if (dep.isDirect) directCount++;
      else transitiveCount++;

      const queryKey = `${dep.ecosystem}:${dep.name}@${dep.installedVersion}`;
      const matchedVulns = osvResults.get(queryKey) || [];

      if (matchedVulns.length > 0) {
        seenPkgWithVuln.add(dep.name.toLowerCase());
        packagesWithAdvisories++;

        // Fetch details for each vulnerability
        for (const vulnSummary of matchedVulns) {
          totalAdvisories++;
          let detail = vulnSummary;

          if (!detail.summary && !detail.details && detail.id) {
            try {
              detail = (await fetchVulnDetails(detail.id, { prisma, timeoutMs: 8000 })) || vulnSummary;
            } catch {
              detail = vulnSummary;
            }
          }

          // Extract affected block for this package
          const affectedBlock = Array.isArray(detail.affected)
            ? detail.affected.find(
                (a) => a.package?.name?.toLowerCase() === dep.name.toLowerCase()
              ) || detail.affected[0]
            : null;

          const severity = extractSeverity(detail);
          const affectedRange = extractAffectedRange(affectedBlock);
          const fixedVersion = findLowestFixedVersion(affectedBlock, dep.installedVersion);

          dependencyRows.push({
            projectId: project.id,
            ecosystem: dep.ecosystem,
            name: dep.name,
            installedVersion: dep.installedVersion,
            isDirect: dep.isDirect,
            dependencyPath: dep.dependencyPath,
            lockfile: dep.lockfile,
            advisoryId: detail.id,
            advisoryUrl: `https://osv.dev/vulnerability/${encodeURIComponent(detail.id)}`,
            advisorySummary: detail.summary || detail.details?.split("\n")[0] || "Security Advisory",
            severity,
            affectedRange,
            fixedVersion,
            scannedAt: startedAt,
          });
        }
      } else {
        // No advisories for this package - store row so summary and inventory know about it
        dependencyRows.push({
          projectId: project.id,
          ecosystem: dep.ecosystem,
          name: dep.name,
          installedVersion: dep.installedVersion,
          isDirect: dep.isDirect,
          dependencyPath: dep.dependencyPath,
          lockfile: dep.lockfile,
          advisoryId: null,
          advisoryUrl: null,
          advisorySummary: null,
          severity: null,
          affectedRange: null,
          fixedVersion: null,
          scannedAt: startedAt,
        });
      }
    }

    // 6. Delete old dependency rows for this project on rescan and insert new rows
    await appendLog(`Updating database: replacing existing dependency records for project...`);
    await prisma.$transaction([
      prisma.dependency.deleteMany({
        where: { projectId: project.id },
      }),
      prisma.dependency.createMany({
        data: dependencyRows,
      }),
    ]);

    await appendLog(`Persisted ${dependencyRows.length} dependency records (${totalAdvisories} advisories across ${seenPkgWithVuln.size} vulnerable packages).`);

    const summary = {
      packagesScanned: dependencies.length,
      packagesWithAdvisories: seenPkgWithVuln.size,
      totalAdvisories,
      directCount,
      transitiveCount,
      unresolvedCount: unresolved.length,
      osvOffline,
      manifestsScanned,
      durationMs: Date.now() - startedAt.getTime(),
    };

    // 7. Record audit event: DEPENDENCY_SCAN_COMPLETED
    try {
      await prisma.auditEvent.create({
        data: {
          actorId: job.createdById || null,
          projectId: project.id,
          action: "DEPENDENCY_SCAN_COMPLETED",
          entityType: "Project",
          entityId: project.id,
          metadata: summary,
        },
      });
    } catch (err) {
      console.warn(`[dependency-scan] Failed to create completion audit event:`, err.message);
    }

    await appendLog(`Dependency scan finished in ${(summary.durationMs / 1000).toFixed(2)}s.`);
    return summary;
  } finally {
    // 8. Clean up temp checkout directory
    if (isTempDir && targetDir && fs.existsSync(targetDir)) {
      try {
        fs.rmSync(targetDir, { recursive: true, force: true });
      } catch (rmErr) {
        console.warn(`[dependency-scan] Failed to clean up temp dir ${targetDir}:`, rmErr.message);
      }
    }
  }
}

