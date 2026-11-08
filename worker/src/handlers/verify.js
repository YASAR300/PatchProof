import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";
import { prisma } from "../db.js";
import { runInSandbox } from "../sandbox.js";
import { getDockerVersion } from "../docker-info.js";
import { classifyRuns, parseOracleOutput } from "../../../src/lib/classify.js";
import { resolveReproducer } from "../../../src/lib/reproducers.js";
import { redactSecrets } from "../../../src/lib/redact.js";

const execFileAsync = promisify(execFile);

/**
 * Resolves repository path and ensures it exists (building if demo repo).
 * @param {object} project
 * @param {(msg: string) => Promise<void>} appendLog
 * @returns {Promise<string>}
 */
export async function resolveRepoPath(project, appendLog = async () => {}) {
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
    return demoRepoPath;
  }

  throw new Error("Verification runner currently supports demo-target repositories with sandbox execution.");
}

/**
 * Resolves a git ref/tag to a 40-character SHA.
 * @param {string} repoPath
 * @param {string} commitRef
 * @param {(msg: string) => Promise<void>} appendLog
 * @returns {Promise<string>}
 */
export async function resolveCommitSha(repoPath, commitRef, appendLog = async () => {}) {
  let resolvedSha = commitRef;

  // Map tag names from demo-manifest.json if available
  const manifestPath = path.resolve(process.cwd(), "demo-manifest.json");
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      const tagObj = manifest.tags?.find(
        (t) => t.name === commitRef || t.sha === commitRef
      );
      if (tagObj) {
        resolvedSha = tagObj.sha;
        await appendLog(`Mapped tag '${tagObj.name}' to commit SHA ${resolvedSha.slice(0, 7)}`);
      }
    } catch (err) {
      console.warn("[verify] Failed to read demo-manifest.json:", err.message);
    }
  }

  // Resolve ref to 40-char commit SHA via git rev-parse
  try {
    const { stdout: shaOut } = await execFileAsync("git", ["-C", repoPath, "rev-parse", resolvedSha]);
    resolvedSha = shaOut.trim();
  } catch {
    // Keep resolvedSha as-is
  }

  return resolvedSha;
}

/**
 * Runs 3 deterministic sandbox executions of a reproducer against a given commit ref,
 * stores VerificationRun and EvidenceArtifact records.
 *
 * @param {object} params
 * @param {object} params.finding
 * @param {object} params.project
 * @param {string} params.commitRef
 * @param {object} params.job
 * @param {(line: string) => Promise<void>} params.appendLog
 * @param {boolean} [params.updateFindingState=false]
 * @param {string} [params.repoPath]
 * @returns {Promise<{
 *   run: object,
 *   classification: object,
 *   commitSha: string,
 *   archiveBuffer: Buffer,
 *   reproducerId: string,
 *   repoPath: string
 * }>}
 */
export async function executeVerificationForCommit({
  finding,
  project,
  commitRef,
  job,
  appendLog,
  updateFindingState = false,
  repoPath,
}) {
  const startedAt = new Date();

  // Compatibility Check
  const compatibility = resolveReproducer(finding, project);
  if (!compatibility.compatible) {
    const msg = compatibility.message || "No compatible reproducer is available, so this finding remains unverified.";
    await appendLog(`Incompatibility notice: ${msg}`);

    if (updateFindingState) {
      await prisma.finding.update({
        where: { id: finding.id },
        data: { verificationState: "UNVERIFIED" },
      });
    }

    return {
      run: null,
      classification: { status: "UNVERIFIED", summary: msg },
      commitSha: commitRef,
      archiveBuffer: null,
      reproducerId: null,
      repoPath: null,
    };
  }

  const { reproducerId, reproducerPath, command } = compatibility;
  const activeRepoPath = repoPath || (await resolveRepoPath(project, appendLog));
  const actualCommitSha = await resolveCommitSha(activeRepoPath, commitRef, appendLog);

  await appendLog(`Exporting source archive at commit ${actualCommitSha.slice(0, 7)}...`);
  const archiveBuffer = execFileSync("git", ["-C", activeRepoPath, "archive", "--format=tar", actualCommitSha], {
    maxBuffer: 50 * 1024 * 1024,
  });

  // Calculate testVersion = sha256 of reproducer file
  let reproducerContent = "";
  try {
    reproducerContent = execFileSync("git", ["-C", activeRepoPath, "show", `${actualCommitSha}:${reproducerPath}`], {
      encoding: "utf8",
    });
  } catch {
    const localFilePath = path.join(activeRepoPath, reproducerPath);
    if (fs.existsSync(localFilePath)) {
      reproducerContent = fs.readFileSync(localFilePath, "utf8");
    }
  }

  const testVersion = crypto
    .createHash("sha256")
    .update(reproducerContent || reproducerPath)
    .digest("hex");

  await appendLog(`Running reproducer '${reproducerId}' 3 times against commit ${actualCommitSha.slice(0, 7)}...`);
  const runs = [];
  let combinedStdout = "";
  let combinedStderr = "";

  for (let runIndex = 1; runIndex <= 3; runIndex++) {
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
      `[${actualCommitSha.slice(0, 7)} Run ${runIndex}/3] exit=${runResult.exitCode}, reproduced=${parsed.assertion?.reproduced ?? "N/A"}, precondition_ok=${parsed.assertion?.precondition_ok ?? "N/A"} (${runResult.durationMs}ms)`
    );
  }

  // Classify results
  const classification = classifyRuns(runs);
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

  // Persist VerificationRun in database
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
      jobId: job?.id || null,
    },
  });

  // Store EvidenceArtifacts (LOG and TEST_RESULT)
  const rawLogContent =
    `PATCHPROOF VERIFICATION RUN EVIDENCE\n` +
    `Finding: ${finding.title}\n` +
    `Commit: ${actualCommitSha}\n` +
    `Reproducer: ${reproducerId} (${reproducerPath})\n` +
    `Verdict: ${classification.status}\n` +
    `Started: ${startedAt.toISOString()}\n\n` +
    `=== COMBINED EXECUTION LOGS ===\n` +
    combinedStdout +
    "\n" +
    (combinedStderr ? `=== STANDARD ERROR LOGS ===\n` + combinedStderr : "");

  const fullLogContent = redactSecrets(rawLogContent);

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

  if (updateFindingState) {
    await prisma.finding.update({
      where: { id: finding.id },
      data: { verificationState: classification.status },
    });
  }

  return {
    run: verificationRun,
    classification,
    commitSha: actualCommitSha,
    archiveBuffer,
    reproducerId,
    repoPath: activeRepoPath,
  };
}

/**
 * Handles 'verify' job type.
 * @param {object} job
 * @param {object} context
 * @param {(line: string) => Promise<void>} context.appendLog
 * @returns {Promise<object>}
 */
export async function handleVerify(job, { appendLog }) {
  const payload = job.payload || {};
  const findingId = payload.findingId || job.findingId;
  const requestedRef = payload.commitSha || payload.targetRef;

  if (!findingId) {
    throw new Error("Verification job missing required findingId.");
  }

  const finding = await prisma.finding.findUnique({
    where: { id: findingId },
    include: { project: true },
  });

  if (!finding || !finding.project) {
    throw new Error(`Finding or project not found for id ${findingId}.`);
  }

  const project = finding.project;
  await appendLog(`Initiating verification for finding: "${finding.title}" (Rule: ${finding.ruleId})`);

  // Audit event: VERIFICATION_STARTED
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
          requestedRef,
        },
      },
    });
  } catch (err) {
    console.warn("[verify] Failed to create VERIFICATION_STARTED audit event:", err.message);
  }

  const result = await executeVerificationForCommit({
    finding,
    project,
    commitRef: requestedRef || finding.commitSha || project.defaultBranch,
    job,
    appendLog,
    updateFindingState: true,
  });

  if (!result.run) {
    return {
      status: result.classification.status,
      verified: false,
      reason: result.classification.summary,
    };
  }

  // Audit event: VERIFICATION_COMPLETED
  try {
    await prisma.auditEvent.create({
      data: {
        actorId: job.createdById || null,
        projectId: project.id,
        action: "VERIFICATION_COMPLETED",
        entityType: "VerificationRun",
        entityId: result.run.id,
        metadata: {
          jobId: job.id,
          findingId: finding.id,
          runId: result.run.id,
          status: result.classification.status,
          commitSha: result.commitSha,
          durationMs: result.run.durationMs,
        },
      },
    });
  } catch (err) {
    console.warn("[verify] Failed to create VERIFICATION_COMPLETED audit event:", err.message);
  }

  await appendLog(`Verification finished with verdict: ${result.classification.status} — ${result.classification.summary}`);

  return {
    runId: result.run.id,
    status: result.classification.status,
    summary: result.classification.summary,
    commitSha: result.commitSha,
    durationMs: result.run.durationMs,
  };
}
