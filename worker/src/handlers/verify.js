import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFile, execFileSync, spawn } from "node:child_process";
import { promisify } from "node:util";
import { prisma } from "../db.js";
import { runInSandbox } from "../sandbox.js";
import { getDockerVersion } from "../docker-info.js";
import { classifyRuns, parseOracleOutput } from "../../../src/lib/classify.js";
import { resolveReproducer } from "../../../src/lib/reproducers.js";

const execFileAsync = promisify(execFile);

/**
 * Handles 'verify' job type.
 * Runs 3 deterministic sandbox executions of a registered reproducer,
 * classifies results, records VerificationRun and EvidenceArtifacts,
 * and updates Finding.verificationState.
 *
 * @param {object} job
 * @param {object} context
 * @param {(line: string) => Promise<void>} context.appendLog
 * @returns {Promise<object>} Structured verification result
 */
export async function handleVerify(job, { appendLog }) {
  const startedAt = new Date();
  const payload = job.payload || {};
  const findingId = payload.findingId || job.findingId;
  const requestedRef = payload.commitSha || payload.targetRef;

  if (!findingId) {
    throw new Error("Verification job missing required findingId.");
  }

  // 1. Fetch Finding and Project
  const finding = await prisma.finding.findUnique({
    where: { id: findingId },
    include: { project: true },
  });

  if (!finding) {
    throw new Error(`Finding ${findingId} not found.`);
  }

  const project = finding.project;
  if (!project) {
    throw new Error(`Project for finding ${findingId} not found.`);
  }

  await appendLog(`Initiating verification for finding: "${finding.title}" (Rule: ${finding.ruleId})`);

  // 2. Compatibility Check
  const compatibility = resolveReproducer(finding, project);
  if (!compatibility.compatible) {
    const msg = compatibility.message || "No compatible reproducer is available, so this finding remains unverified.";
    await appendLog(`Incompatibility notice: ${msg}`);

    // Update finding to ensure it remains UNVERIFIED
    await prisma.finding.update({
      where: { id: finding.id },
      data: { verificationState: "UNVERIFIED" },
    });

    return {
      status: "UNVERIFIED",
      verified: false,
      reason: msg,
    };
  }

  const { reproducerId, reproducerPath, command } = compatibility;
  await appendLog(`Compatible reproducer identified: ${reproducerId} (${reproducerPath})`);

  // 3. Resolve exact commit SHA and export source archive
  let actualCommitSha = requestedRef || finding.commitSha || project.defaultBranch;
  let archiveBuffer = null;
  let reproducerContent = "";

  const isDemoProject = Boolean(
    project.isDemo ||
    (typeof project.repoUrl === "string" && project.repoUrl.startsWith("local:")) ||
    project.repoName === "demo-target" ||
    project.repoName === "LOOPWISE" ||
    project.name === "LOOPWISE"
  );

  if (isDemoProject) {
    const demoRepoPath = path.resolve(process.env.DEMO_REPO_PATH || "./.data/demo-target");
    if (!fs.existsSync(demoRepoPath)) {
      await appendLog(`Demo repository not found at '${demoRepoPath}'. Initializing on demand...`);
      const buildScript = path.resolve(process.cwd(), "scripts/build-demo-repo.mjs");
      if (fs.existsSync(buildScript)) {
        try {
          await execFileAsync("node", [buildScript]);
          await appendLog(`Demo target repository built successfully at '${demoRepoPath}'.`);
        } catch (buildErr) {
          throw new Error(`Failed to initialize demo target repository: ${buildErr.message}`);
        }
      } else {
        throw new Error(`Demo target repository not found at '${demoRepoPath}'.`);
      }
    }

    // Map tag names (e.g. baseline, fix-good, broken-build) directly from demo-manifest.json
    const manifestPath = path.resolve(process.cwd(), "demo-manifest.json");
    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        const tagObj = manifest.tags?.find(
          (t) => t.name === actualCommitSha || t.sha === actualCommitSha
        );
        if (tagObj) {
          actualCommitSha = tagObj.sha;
          await appendLog(`Mapped tag '${tagObj.name}' to commit SHA ${actualCommitSha.slice(0, 7)}`);
        }
      } catch (err) {
        console.warn("[verify] Failed to read demo-manifest.json:", err.message);
      }
    }

    // Resolve ref to exact 40-char commit SHA via git rev-parse if not already 40 chars
    try {
      const { stdout: shaOut } = await execFileAsync("git", ["-C", demoRepoPath, "rev-parse", actualCommitSha]);
      actualCommitSha = shaOut.trim();
    } catch {
      // keep actualCommitSha as is if resolution fails
    }

    await appendLog(`Resolved target commit: ${actualCommitSha}`);

    // Export archive buffer
    archiveBuffer = execFileSync("git", ["-C", demoRepoPath, "archive", "--format=tar", actualCommitSha], {
      maxBuffer: 50 * 1024 * 1024,
    });
    await appendLog(`Exported source archive (${archiveBuffer.length} bytes) at commit ${actualCommitSha.slice(0, 7)}.`);

    // Read reproducer content to calculate testVersion hash
    try {
      reproducerContent = execFileSync("git", ["-C", demoRepoPath, "show", `${actualCommitSha}:${reproducerPath}`], {
        encoding: "utf8",
      });
    } catch {
      const localFilePath = path.join(demoRepoPath, reproducerPath);
      if (fs.existsSync(localFilePath)) {
        reproducerContent = fs.readFileSync(localFilePath, "utf8");
      }
    }
  } else {
    throw new Error("Verification runner currently supports demo-target repositories with sandbox execution.");
  }

  // 4. Calculate testVersion = sha256 of reproducer file
  const testVersion = crypto
    .createHash("sha256")
    .update(reproducerContent || reproducerPath)
    .digest("hex");
  await appendLog(`Recorded test version hash: ${testVersion}`);

  // 5. Audit event: VERIFICATION_STARTED
  try {
    await prisma.auditEvent.create({
      data: {
        actorId: job.createdById || null,
        projectId: project.id,
        action: "VERIFICATION_STARTED",
        entityType: "Finding",
        entityId: finding.id,
        metadata: {
          jobId: job.id,
          findingId: finding.id,
          commitSha: actualCommitSha,
          reproducerId,
          testVersion,
        },
      },
    });
  } catch (err) {
    console.warn("[verify] Failed to create VERIFICATION_STARTED audit event:", err.message);
  }

  // 6. Run reproducer 3 times in isolated sandbox
  await appendLog(`Executing reproducer 3 times in isolated container sandbox (network: none, memory: 512MB)...`);
  const runs = [];
  let combinedStdout = "";
  let combinedStderr = "";

  for (let runIndex = 1; runIndex <= 3; runIndex++) {
    await appendLog(`[Run ${runIndex}/3] Starting isolated test execution...`);

    const runResult = await runInSandbox({
      image: "patchproof-sandbox-python",
      archiveBuffer,
      command: command || ["python", reproducerPath],
      timeoutMs: 30000,
      memoryMb: 512,
      cpus: 1.0,
      pidsLimit: 64,
    });

    const parsed = parseOracleOutput(runResult.stdout);

    runs.push({
      runIndex,
      exitCode: runResult.exitCode,
      stdout: runResult.stdout,
      stderr: runResult.stderr,
      durationMs: runResult.durationMs,
      timedOut: runResult.timedOut,
      oomKilled: runResult.oomKilled,
      imageDigest: runResult.imageDigest,
      assertion: parsed.assertion,
      parseError: parsed.parseError,
    });

    combinedStdout += `\n--- RUN ${runIndex} STDOUT (exit: ${runResult.exitCode}, duration: ${runResult.durationMs}ms) ---\n` + runResult.stdout;
    if (runResult.stderr) {
      combinedStderr += `\n--- RUN ${runIndex} STDERR ---\n` + runResult.stderr;
    }

    await appendLog(
      `[Run ${runIndex}/3] Finished: exit=${runResult.exitCode}, reproduced=${parsed.assertion?.reproduced ?? "N/A"}, precondition_ok=${parsed.assertion?.precondition_ok ?? "N/A"} (${runResult.durationMs}ms)`
    );
  }

  // 7. Classify results using pure classification engine
  const classification = classifyRuns(runs);
  await appendLog(`Verification classification verdict: ${classification.status} — ${classification.summary}`);

  // Calculate duration and exit code
  const totalDurationMs = runs.reduce((sum, r) => sum + (r.durationMs || 0), 0);
  const worstExitCode = runs.find((r) => r.exitCode !== 0)?.exitCode ?? 0;
  const dockerVer = await getDockerVersion();

  const environmentMetadata = {
    imageDigest: runs[0]?.imageDigest || "sha256:emulated-sandbox-python-3.12",
    pythonVersion: "3.12",
    sandboxLimits: {
      memoryMb: 512,
      cpus: 1.0,
      network: "none",
      readOnlyRoot: true,
      tmpfsWorkspace: "256m",
    },
    workerId: process.env.WORKER_ID || "worker-main",
    dockerVersion: dockerVer || "emulated",
  };

  const assertionsJson = {
    runs: runs.map((r) => ({
      runIndex: r.runIndex,
      exitCode: r.exitCode,
      durationMs: r.durationMs,
      assertion: r.assertion,
      timedOut: r.timedOut,
      oomKilled: r.oomKilled,
    })),
    classification: {
      status: classification.status,
      reason: classification.reason,
      summary: classification.summary,
      reproduced: classification.reproduced,
      precondition_ok: classification.precondition_ok,
      flaky: classification.flaky,
    },
  };

  // 8. Persist VerificationRun in database
  const verificationRun = await prisma.verificationRun.create({
    data: {
      findingId: finding.id,
      projectId: project.id,
      commitSha: actualCommitSha,
      reproducerId,
      testVersion,
      status: classification.status,
      startedAt,
      finishedAt: new Date(),
      durationMs: totalDurationMs,
      exitCode: worstExitCode,
      assertions: assertionsJson,
      environment: environmentMetadata,
      summary: classification.summary,
      jobId: job.id,
    },
  });

  await appendLog(`Recorded VerificationRun ID: ${verificationRun.id}`);

  // 9. Store EvidenceArtifacts (LOG and TEST_RESULT)
  const fullLogContent = `PATCHPROOF VERIFICATION RUN EVIDENCE\n` +
    `Finding: ${finding.title}\n` +
    `Commit: ${actualCommitSha}\n` +
    `Reproducer: ${reproducerId} (${reproducerPath})\n` +
    `Verdict: ${classification.status}\n` +
    `Started: ${startedAt.toISOString()}\n\n` +
    `=== COMBINED EXECUTION LOGS ===\n` +
    combinedStdout + "\n" +
    (combinedStderr ? `=== STANDARD ERROR LOGS ===\n` + combinedStderr : "");

  const fullLogHash = crypto.createHash("sha256").update(fullLogContent).digest("hex");
  const testResultStr = JSON.stringify(assertionsJson, null, 2);
  const testResultHash = crypto.createHash("sha256").update(testResultStr).digest("hex");

  await prisma.evidenceArtifact.createMany({
    data: [
      {
        runId: verificationRun.id,
        kind: "LOG",
        name: `verification-${verificationRun.id}.log`,
        content: fullLogContent,
        sizeBytes: Buffer.byteLength(fullLogContent, "utf8"),
        sha256: fullLogHash,
      },
      {
        runId: verificationRun.id,
        kind: "TEST_RESULT",
        name: `test-result-${verificationRun.id}.json`,
        content: testResultStr,
        sizeBytes: Buffer.byteLength(testResultStr, "utf8"),
        sha256: testResultHash,
      },
    ],
  });

  await appendLog(`Evidence artifacts stored (LOG: ${fullLogHash.slice(0, 12)}..., TEST_RESULT: ${testResultHash.slice(0, 12)}...)`);

  // 10. Update Finding.verificationState
  await prisma.finding.update({
    where: { id: finding.id },
    data: { verificationState: classification.status },
  });
  await appendLog(`Updated Finding ${finding.id} verificationState to ${classification.status}`);

  // 11. Audit event: VERIFICATION_COMPLETED
  try {
    await prisma.auditEvent.create({
      data: {
        actorId: job.createdById || null,
        projectId: project.id,
        action: "VERIFICATION_COMPLETED",
        entityType: "VerificationRun",
        entityId: verificationRun.id,
        metadata: {
          jobId: job.id,
          findingId: finding.id,
          runId: verificationRun.id,
          status: classification.status,
          commitSha: actualCommitSha,
          durationMs: totalDurationMs,
        },
      },
    });
  } catch (err) {
    console.warn("[verify] Failed to create VERIFICATION_COMPLETED audit event:", err.message);
  }

  await appendLog(`Verification workflow successfully completed in ${(totalDurationMs / 1000).toFixed(2)}s.`);

  return {
    runId: verificationRun.id,
    status: classification.status,
    summary: classification.summary,
    commitSha: actualCommitSha,
    durationMs: totalDurationMs,
  };
}

