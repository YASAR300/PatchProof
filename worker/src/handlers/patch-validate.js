import fs from "node:fs";
import path from "node:path";
import { prisma } from "../db.js";
import {
  resolveRepoPath,
  resolveCommitSha,
  executeVerificationForCommit,
} from "./verify.js";
import { runRegressionSuite, computeRegressions } from "../regression.js";
import { computeGitDiff } from "../diff.js";
import { decidePatchVerdict } from "../../../src/lib/verdict.js";

/**
 * Handles 'patch-validate' job type.
 * Evaluates candidate fix against vulnerable baseline across security reproduction,
 * regression suites, and git diff.
 *
 * @param {object} job
 * @param {object} context
 * @param {(line: string) => Promise<void>} context.appendLog
 * @returns {Promise<object>} Structured validation outcome
 */
export async function handlePatchValidate(job, { appendLog }) {
  const payload = job.payload || {};
  const findingId = payload.findingId || job.findingId;
  const requestedBaseline = payload.baselineCommit || payload.baselineRef || "baseline";
  const requestedCandidate = payload.candidateCommit || payload.candidateRef || "fix-good";

  if (!findingId) {
    throw new Error("Patch validation job missing required findingId.");
  }

  // 1. Fetch Finding and Project
  const finding = await prisma.finding.findUnique({
    where: { id: findingId },
    include: { project: true },
  });

  if (!finding || !finding.project) {
    throw new Error(`Finding or project not found for id ${findingId}.`);
  }

  const project = finding.project;
  await appendLog(`Starting patch validation for: "${finding.title}"`);
  await appendLog(`Target references: Baseline='${requestedBaseline}', Candidate='${requestedCandidate}'`);

  const repoPath = await resolveRepoPath(project, appendLog);
  const baselineSha = await resolveCommitSha(repoPath, requestedBaseline, appendLog);
  const candidateSha = await resolveCommitSha(repoPath, requestedCandidate, appendLog);

  await appendLog(`Resolved SHAs: Baseline=${baselineSha.slice(0, 7)}, Candidate=${candidateSha.slice(0, 7)}`);

  // Audit event: PATCH_VALIDATION_STARTED
  try {
    await prisma.auditEvent.create({
      data: {
        actorId: job.createdById || null,
        projectId: project.id,
        action: "PATCH_VALIDATION_STARTED",
        entityType: "PatchReport",
        entityId: finding.id,
        metadata: {
          jobId: job.id,
          findingId: finding.id,
          baselineCommit: baselineSha,
          candidateCommit: candidateSha,
        },
      },
    });
  } catch (err) {
    console.warn("[patch-validate] Failed to create PATCH_VALIDATION_STARTED audit event:", err.message);
  }

  // Step 1: Run security reproducer on baseline and candidate (3 runs each)
  await appendLog(`[Step 1/4] Running security reproducer on vulnerable baseline (${baselineSha.slice(0, 7)})...`);
  const baselineSecurityResult = await executeVerificationForCommit({
    finding,
    project,
    commitRef: baselineSha,
    job,
    appendLog,
    updateFindingState: false,
    repoPath,
  });

  await appendLog(
    `Baseline security verdict: ${baselineSecurityResult.classification.status} (exit ${baselineSecurityResult.run?.exitCode ?? "N/A"})`
  );

  await appendLog(`[Step 1/4] Running security reproducer on candidate patch (${candidateSha.slice(0, 7)})...`);
  const candidateSecurityResult = await executeVerificationForCommit({
    finding,
    project,
    commitRef: candidateSha,
    job,
    appendLog,
    updateFindingState: false,
    repoPath,
  });

  await appendLog(
    `Candidate security verdict: ${candidateSecurityResult.classification.status} (exit ${candidateSecurityResult.run?.exitCode ?? "N/A"})`
  );

  // Step 2: Run regression test suite on baseline and candidate
  let regressionCommand = ["python", "-m", "unittest", "discover", "-v", "tests"];
  const manifestPath = path.resolve(process.cwd(), "demo-manifest.json");
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      if (manifest.regressionCommand) {
        const parts = manifest.regressionCommand.trim().split(/\s+/);
        if (parts.length > 0) {
          // ensure verbose -v is present for individual test name parsing
          if (!parts.includes("-v")) {
            const discoverIdx = parts.indexOf("discover");
            if (discoverIdx !== -1) {
              parts.splice(discoverIdx + 1, 0, "-v");
            } else {
              parts.push("-v");
            }
          }
          regressionCommand = parts;
        }
      }
    } catch {
      // keep default command
    }
  }

  await appendLog(`[Step 2/4] Running regression suite on baseline (${regressionCommand.join(" ")})...`);
  const baselineRegression = await runRegressionSuite({
    archiveBuffer: baselineSecurityResult.archiveBuffer,
    command: regressionCommand,
  });
  await appendLog(
    `Baseline regression suite: ${baselineRegression.passed ? "PASSED" : "FAILED"} (${baselineRegression.passedCount}/${baselineRegression.total} tests ok, exit: ${baselineRegression.exitCode})`
  );

  await appendLog(`[Step 2/4] Running regression suite on candidate patch...`);
  const candidateRegression = await runRegressionSuite({
    archiveBuffer: candidateSecurityResult.archiveBuffer,
    command: regressionCommand,
  });
  await appendLog(
    `Candidate regression suite: ${candidateRegression.passed ? "PASSED" : "FAILED"} (${candidateRegression.passedCount}/${candidateRegression.total} tests ok, exit: ${candidateRegression.exitCode})`
  );

  // Parse individual regressions: tests that passed on baseline but failed on candidate
  const newFailures = computeRegressions(baselineRegression, candidateRegression);
  if (newFailures.length > 0) {
    await appendLog(
      `Detected ${newFailures.length} functional regression(s): ${newFailures.map((f) => f.name).join(", ")}`
    );
  } else {
    await appendLog(`No functional regressions detected between baseline and candidate.`);
  }

  // Step 3: Produce git diff and file stat
  await appendLog(`[Step 3/4] Generating code diff (git diff ${baselineSha.slice(0, 7)}..${candidateSha.slice(0, 7)})...`);
  const diffResult = await computeGitDiff(repoPath, baselineSha, candidateSha);
  await appendLog(
    `Diff stats: ${diffResult.diffStat.filesChanged} file(s) changed, +${diffResult.diffStat.insertions} / -${diffResult.diffStat.deletions} lines.`
  );

  // Step 4: Decide verdict with strict precedence
  await appendLog(`[Step 4/4] Evaluating patch validation verdict matrix...`);
  const verdictResult = decidePatchVerdict({
    baselineRun: baselineSecurityResult.run,
    candidateRun: candidateSecurityResult.run,
    baselineRegression,
    candidateRegression,
    newFailures,
  });

  await appendLog(`Final Patch Validation Verdict: ${verdictResult.verdict}`);
  await appendLog(`Verdict Summary: ${verdictResult.summary}`);

  const regressionResultsPayload = {
    baseline: {
      passed: baselineRegression.passed,
      exitCode: baselineRegression.exitCode,
      total: baselineRegression.total,
      passedCount: baselineRegression.passedCount,
      failedCount: baselineRegression.failedCount,
      hasExecutionError: baselineRegression.hasExecutionError,
      tests: baselineRegression.tests,
    },
    candidate: {
      passed: candidateRegression.passed,
      exitCode: candidateRegression.exitCode,
      total: candidateRegression.total,
      passedCount: candidateRegression.passedCount,
      failedCount: candidateRegression.failedCount,
      hasExecutionError: candidateRegression.hasExecutionError,
      tests: candidateRegression.tests,
    },
    newFailures,
  };

  // Step 5: Save PatchReport in database
  const patchReport = await prisma.patchReport.create({
    data: {
      findingId: finding.id,
      projectId: project.id,
      baselineCommit: baselineSha,
      candidateCommit: candidateSha,
      baselineRunId: baselineSecurityResult.run?.id || null,
      candidateRunId: candidateSecurityResult.run?.id || null,
      regressionResults: regressionResultsPayload,
      verdict: verdictResult.verdict,
      summary: verdictResult.summary,
      diffStat: diffResult.diffStat,
      jobId: job.id,
    },
  });

  await appendLog(`Recorded PatchReport ID: ${patchReport.id}`);

  // Store EvidenceArtifact of kind DIFF with sha256
  const diffArtifactName = `patch-${baselineSha.slice(0, 7)}-${candidateSha.slice(0, 7)}.diff`;
  await prisma.evidenceArtifact.create({
    data: {
      patchReportId: patchReport.id,
      kind: "DIFF",
      name: diffArtifactName,
      content: diffResult.fullDiff,
      sizeBytes: diffResult.sizeBytes,
      sha256: diffResult.sha256,
    },
  });

  await appendLog(`Stored EvidenceArtifact kind DIFF (${diffResult.sha256.slice(0, 12)}..., ${diffResult.sizeBytes} bytes)`);

  // Update Finding.triageStatus to FIXED ONLY when verdict is FIX_VERIFIED and current status is OPEN
  if (verdictResult.verdict === "FIX_VERIFIED" && finding.triageStatus === "OPEN") {
    await prisma.finding.update({
      where: { id: finding.id },
      data: { triageStatus: "FIXED" },
    });
    await appendLog(`Finding ${finding.id} triageStatus automatically updated to FIXED.`);
  }

  // Audit event: PATCH_VALIDATION_COMPLETED
  try {
    await prisma.auditEvent.create({
      data: {
        actorId: job.createdById || null,
        projectId: project.id,
        action: "PATCH_VALIDATION_COMPLETED",
        entityType: "PatchReport",
        entityId: patchReport.id,
        metadata: {
          jobId: job.id,
          findingId: finding.id,
          patchReportId: patchReport.id,
          verdict: verdictResult.verdict,
          baselineSha,
          candidateSha,
          filesChanged: diffResult.diffStat.filesChanged,
        },
      },
    });
  } catch (err) {
    console.warn("[patch-validate] Failed to create PATCH_VALIDATION_COMPLETED audit event:", err.message);
  }

  await appendLog(`Patch validation completed successfully. Verdict: ${verdictResult.verdict}`);

  return {
    patchReportId: patchReport.id,
    verdict: verdictResult.verdict,
    summary: verdictResult.summary,
    explanation: verdictResult.explanation,
    baselineSha,
    candidateSha,
    baselineRunId: baselineSecurityResult.run?.id || null,
    candidateRunId: candidateSecurityResult.run?.id || null,
    newFailuresCount: newFailures.length,
  };
}
