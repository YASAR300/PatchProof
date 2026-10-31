import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFile, execFileSync, spawn } from "node:child_process";
import { promisify } from "node:util";
import { prisma } from "../db.js";
import {
  executeSemgrepScan,
  normalizeSeverity,
  extractContextLines,
} from "../scanner/semgrep-runner.js";

const execFileAsync = promisify(execFile);

/**
 * Extracts a tar buffer into a target directory using system tar.
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
 * Validates cloned directory size and file count.
 * Max size: 200 MB, max files: 10,000.
 * @param {string} dir
 */
function checkLimits(dir) {
  let totalBytes = 0;
  let fileCount = 0;
  const maxBytes = 200 * 1024 * 1024; // 200 MB
  const maxFiles = 10000;

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.name === ".git") continue;
      const full = path.join(current, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.isFile()) {
        fileCount++;
        const stat = fs.statSync(full);
        totalBytes += stat.size;
        if (totalBytes > maxBytes) {
          throw new Error("Repository size exceeds the 200 MB safety limit.");
        }
        if (fileCount > maxFiles) {
          throw new Error("Repository file count exceeds the 10,000 files limit.");
        }
      }
    }
  }

  walk(dir);
  return { totalBytes, fileCount };
}

/**
 * Handles 'scan' job type.
 * Scans a target repository using Semgrep inside a sandbox container or local fallback.
 *
 * @param {object} job
 * @param {object} context
 * @param {(line: string) => Promise<void>} context.appendLog
 * @returns {Promise<object>} Structured result
 */
export async function handleScan(job, { appendLog }) {
  const startedAt = new Date();
  const payload = job.payload || {};
  const projectId = job.projectId || payload.projectId;
  const requestedRef = payload.commitSha || payload.targetRef;

  if (!projectId) {
    throw new Error("Job missing required projectId parameter.");
  }

  // 1. Fetch project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error(`Project '${projectId}' not found in database.`);
  }

  await appendLog(`Starting security scan for project '${project.name}' (${project.id})`);

  let targetDir = "";
  let archiveBuffer = null;
  let actualCommitSha = "";
  let targetRef = requestedRef || project.defaultBranch || "main";
  let isTempDir = false;

  const tmpRoot = path.join(os.tmpdir(), "patchproof-scans");
  fs.mkdirSync(tmpRoot, { recursive: true });
  const scanTempDir = path.join(tmpRoot, `scan-${job.id}`);

  try {
    // 2. Prepare repository source
    if (project.isDemo || project.repoUrl.startsWith("local:")) {
      // Demo project: export from local demo repo (.data/demo-target)
      const demoRepoPath = path.resolve(process.env.DEMO_REPO_PATH || "./.data/demo-target");
      if (!fs.existsSync(demoRepoPath)) {
        throw new Error(`Demo target repository not found at '${demoRepoPath}'. Run npm run demo:build first.`);
      }

      await appendLog(`Source: Demo repository at ${demoRepoPath}`);
      await appendLog(`Target ref/tag: ${targetRef}`);

      // Resolve ref to commit SHA
      try {
        const { stdout: shaOut } = await execFileAsync("git", ["-C", demoRepoPath, "rev-parse", targetRef]);
        actualCommitSha = shaOut.trim();
      } catch {
        actualCommitSha = targetRef;
      }

      await appendLog(`Resolved commit SHA: ${actualCommitSha}`);

      // Export tar buffer using git archive
      archiveBuffer = execFileSync("git", ["-C", demoRepoPath, "archive", "--format=tar", targetRef], {
        maxBuffer: 50 * 1024 * 1024,
      });

      // Extract into temp folder for snippet and context line extraction
      targetDir = scanTempDir;
      isTempDir = true;
      await extractTarBuffer(archiveBuffer, targetDir);
      await appendLog(`Exported ${archiveBuffer.length} bytes of archive source to temporary workspace.`);
    } else {
      // GitHub project: validate URL and shallow clone
      const repoUrl = project.repoUrl;
      const parsedUrl = new URL(repoUrl);
      if (parsedUrl.protocol !== "https:" || parsedUrl.hostname !== "github.com") {
        throw new Error(`Only public github.com repositories are supported. Received '${repoUrl}'.`);
      }

      await appendLog(`Source: Remote GitHub repository (${repoUrl})`);
      targetDir = scanTempDir;
      isTempDir = true;

      await appendLog(`Cloning shallow branch (${project.defaultBranch || "HEAD"}) with depth=1...`);

      const cloneArgs = [
        "clone",
        "--depth", "1",
        "--no-recurse-submodules",
      ];
      if (project.defaultBranch && project.defaultBranch.trim()) {
        cloneArgs.push("--branch", project.defaultBranch.trim());
      }
      cloneArgs.push(repoUrl, targetDir);

      try {
        await execFileAsync("git", cloneArgs, {
          env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
        });
      } catch (cloneErr) {
        // If specific branch clone fails, retry with default remote branch
        if (project.defaultBranch) {
          await appendLog(`Branch '${project.defaultBranch}' clone failed, retrying with default remote HEAD branch...`);
          await execFileAsync("git", ["clone", "--depth", "1", "--no-recurse-submodules", repoUrl, targetDir], {
            env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
          });
        } else {
          throw cloneErr;
        }
      }

      // Check limits
      const { totalBytes, fileCount } = checkLimits(targetDir);
      await appendLog(`Repository inspected: ${fileCount} files, ${(totalBytes / (1024 * 1024)).toFixed(2)} MB.`);

      const { stdout: shaOut } = await execFileAsync("git", ["-C", targetDir, "rev-parse", "HEAD"]);
      actualCommitSha = shaOut.trim();

      // Export tar archive
      archiveBuffer = execFileSync("git", ["-C", targetDir, "archive", "--format=tar", "HEAD"], {
        maxBuffer: 200 * 1024 * 1024,
      });
    }

    // 3. Create RepositoryScan record
    const scan = await prisma.repositoryScan.create({
      data: {
        projectId: project.id,
        commitSha: actualCommitSha,
        branch: targetRef,
        tool: "semgrep",
        status: "RUNNING",
        startedAt,
        findingCount: 0,
        jobId: job.id,
      },
    });

    // Write audit event SCAN_STARTED
    try {
      await prisma.auditEvent.create({
        data: {
          actorId: job.createdById || null,
          projectId: project.id,
          action: "SCAN_STARTED",
          entityType: "RepositoryScan",
          entityId: scan.id,
          metadata: {
            projectId: project.id,
            commitSha: actualCommitSha,
            targetRef,
            tool: "semgrep",
          },
        },
      });
    } catch {
      // ignore audit log non-fatal error
    }

    // 4. Run Semgrep analysis
    const rawMatches = await executeSemgrepScan({
      targetDir,
      archiveBuffer,
      appendLog,
    });

    // 5. Parse, compute stable fingerprints, and upsert findings
    await appendLog(`Normalizing and persisting ${rawMatches.length} finding(s)...`);
    const upsertedFindings = [];

    for (const match of rawMatches) {
      const ruleId = match.check_id;
      const relPath = match.path;
      const lineStart = match.start?.line || 1;
      const lineEnd = match.end?.line || lineStart;
      const snippet = match.extra?.lines || "";
      const message = match.extra?.message || ruleId;
      const cwe = match.extra?.metadata?.cwe || null;
      const explanation = match.extra?.metadata?.explanation || "";
      const description = explanation ? `${message}\n\n${explanation}` : message;
      const severity = normalizeSeverity(match.extra?.severity);

      // Extract context lines from source file
      let contextLines = [];
      try {
        const fullFilePath = path.join(targetDir, relPath);
        if (fs.existsSync(fullFilePath)) {
          const fileContent = fs.readFileSync(fullFilePath, "utf8");
          contextLines = extractContextLines(fileContent, lineStart, lineEnd);
        }
      } catch {
        contextLines = [];
      }

      // Stable fingerprint: sha256 of ruleId + filePath + normalized snippet
      const normalizedSnippet = snippet.trim();
      const fingerprintPayload = `${ruleId}:${relPath}:${normalizedSnippet}`;
      const fingerprint = crypto.createHash("sha256").update(fingerprintPayload).digest("hex");

      const finding = await prisma.finding.upsert({
        where: {
          projectId_fingerprint: {
            projectId: project.id,
            fingerprint,
          },
        },
        create: {
          projectId: project.id,
          scanId: scan.id,
          source: "SCANNER",
          tool: "semgrep",
          ruleId,
          title: message,
          description,
          severity,
          filePath: relPath,
          lineStart,
          lineEnd,
          snippet,
          contextLines,
          commitSha: actualCommitSha,
          fingerprint,
          cwe,
          verificationState: "UNVERIFIED",
          triageStatus: "OPEN",
        },
        update: {
          scanId: scan.id,
          title: message,
          description,
          severity,
          lineStart,
          lineEnd,
          snippet,
          contextLines,
          commitSha: actualCommitSha,
          updatedAt: new Date(),
        },
      });

      upsertedFindings.push(finding);
    }

    // 6. Complete RepositoryScan and update Project
    const finishedAt = new Date();
    await prisma.repositoryScan.update({
      where: { id: scan.id },
      data: {
        status: "COMPLETED",
        findingCount: upsertedFindings.length,
        finishedAt,
      },
    });

    await prisma.project.update({
      where: { id: project.id },
      data: {
        lastScannedCommit: actualCommitSha,
        updatedAt: finishedAt,
      },
    });

    // Write audit event SCAN_COMPLETED
    try {
      await prisma.auditEvent.create({
        data: {
          actorId: job.createdById || null,
          projectId: project.id,
          action: "SCAN_COMPLETED",
          entityType: "RepositoryScan",
          entityId: scan.id,
          metadata: {
            scanId: scan.id,
            findingCount: upsertedFindings.length,
            commitSha: actualCommitSha,
            tool: "semgrep",
          },
        },
      });
    } catch {
      // non-fatal
    }

    const durationMs = finishedAt.getTime() - startedAt.getTime();
    await appendLog(`Scan completed in ${durationMs}ms: found and persisted ${upsertedFindings.length} issue(s).`);

    return {
      scanId: scan.id,
      findingCount: upsertedFindings.length,
      commitSha: actualCommitSha,
      targetRef,
      durationMs,
      completedAt: finishedAt.toISOString(),
      findings: upsertedFindings.map((f) => ({
        id: f.id,
        ruleId: f.ruleId,
        filePath: f.filePath,
        lineStart: f.lineStart,
        severity: f.severity,
      })),
    };
  } finally {
    // 7. Cleanup temporary workspace
    if (isTempDir && targetDir && fs.existsSync(targetDir)) {
      try {
        fs.rmSync(targetDir, { recursive: true, force: true });
      } catch {
        // ignore cleanup error
      }
    }
  }
}

