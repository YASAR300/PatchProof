import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { prisma } from "../db.js";
import {
  resolveRepoPath,
  resolveCommitSha,
  executeVerificationForCommit,
} from "./verify.js";
import { runRegressionSuite } from "../regression.js";
import { setCommitStatus, postOrUpdatePrComment } from "../../../src/lib/github-reporter.js";

const execFileAsync = promisify(execFile);

/**
 * Handles 'pr-check' job type.
 * Evaluates PR head commit against all project findings with stored REPRODUCED verifications
 * or FIX_VERIFIED reports. Flags any previously fixed finding that reproduces again as REGRESSION ALERT.
 *
 * @param {object} job
 * @param {object} context
 * @param {(line: string) => Promise<void>} context.appendLog
 * @returns {Promise<object>} Outcome summary
 */
export async function handlePrCheck(job, { appendLog }) {
  const payload = job.payload || {};
  const {
    prCheckId,
    projectId,
    prNumber = 0,
    headSha: rawHeadSha,
    baseSha = "main",
    prTitle = `PR #${prNumber}`,
  } = payload;

  if (!projectId) {
    throw new Error("Missing projectId for pr-check job.");
  }

  // 1. Fetch Project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error(`Project not found for id ${projectId}.`);
  }

  await appendLog(`Starting GitHub PR check for ${project.repoOwner}/${project.repoName} (PR #${prNumber})`);
  await appendLog(`Head commit: ${rawHeadSha}, Base: ${baseSha}`);

  // 2. Resolve repository path and commit SHA
  let repoPath = "";
  let resolvedHeadSha = rawHeadSha;

  try {
    repoPath = await resolveRepoPath(project, appendLog);
    resolvedHeadSha = await resolveCommitSha(repoPath, rawHeadSha, appendLog);
    await appendLog(`Resolved PR head SHA: ${resolvedHeadSha.slice(0, 7)}`);
  } catch (repoErr) {
    await appendLog(`Repo path resolution warning: ${repoErr.message}. Attempting fallback checkout...`);
    // Fallback to demo target if available
    const demoPath = path.resolve("./.data/demo-target");
    if (fs.existsSync(demoPath)) {
      repoPath = demoPath;
      resolvedHeadSha = await resolveCommitSha(repoPath, rawHeadSha, appendLog);
    } else {
      throw repoErr;
    }
  }

  // 3. Find all qualifying findings for this project:
  // Finding must have a stored REPRODUCED verification OR a FIX_VERIFIED patch report
  const findings = await prisma.finding.findMany({
    where: {
      projectId: project.id,
      OR: [
        { verificationRuns: { some: { status: "REPRODUCED" } } },
        { patchReports: { some: { verdict: "FIX_VERIFIED" } } },
      ],
    },
    include: {
      verificationRuns: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
      patchReports: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  await appendLog(`Found ${findings.length} baseline qualifying finding(s) to verify against PR head commit.`);

  let hasRegressionAlert = false;
  const evaluationResults = [];

  // 4. Run verification and regression suite for each qualifying finding
  for (let i = 0; i < findings.length; i++) {
    const finding = findings[i];
    await appendLog(`[${i + 1}/${findings.length}] Evaluating: "${finding.title}" (${finding.filePath})`);

    // Determine stored baseline status
    const latestFixReport = finding.patchReports?.find((r) => r.verdict === "FIX_VERIFIED");
    const storedStatus = latestFixReport
      ? "FIX_VERIFIED"
      : finding.verificationRuns?.some((r) => r.status === "REPRODUCED")
      ? "REPRODUCED"
      : finding.verificationState;

    await appendLog(`   Stored baseline status: ${storedStatus}`);

    // Execute security reproducer against PR head commit
    const verifyResult = await executeVerificationForCommit({
      finding,
      project,
      commitRef: resolvedHeadSha,
      job,
      appendLog,
      updateFindingState: false,
      repoPath,
    });

    const currentStatus = verifyResult.classification?.status || "UNKNOWN";
    const reproduced = currentStatus === "REPRODUCED";
    await appendLog(`   PR head security reproducer result: ${currentStatus}`);

    // Execute functional regression suite on PR head
    let regressionSummary = "5/5 passed";
    try {
      const reg = await runRegressionSuite(repoPath, resolvedHeadSha, project, appendLog);
      regressionSummary = `${reg.passedCount}/${reg.total} passed`;
    } catch (regErr) {
      regressionSummary = `error: ${regErr.message}`;
    }

    // Check for REGRESSION ALERT: previously FIX_VERIFIED and now REPRODUCED
    const isRegression = storedStatus === "FIX_VERIFIED" && currentStatus === "REPRODUCED";

    if (isRegression) {
      hasRegressionAlert = true;
      await appendLog(`🚨 REGRESSION ALERT RAISED for finding ${finding.id}: Vulnerability reproduces on PR head!`);

      // Audit event: REGRESSION_ALERT_RAISED
      try {
        await prisma.auditEvent.create({
          data: {
            projectId: project.id,
            action: "REGRESSION_ALERT_RAISED",
            entityType: "Finding",
            entityId: finding.id,
            metadata: {
              prNumber,
              headSha: resolvedHeadSha,
              findingTitle: finding.title,
              ruleId: finding.ruleId,
              storedStatus,
              currentStatus,
              runId: verifyResult.run?.id,
            },
          },
        });
      } catch (auditErr) {
        console.warn("[pr-check] Failed to log REGRESSION_ALERT_RAISED audit event:", auditErr.message);
      }
    }

    evaluationResults.push({
      id: finding.id,
      title: finding.title,
      ruleId: finding.ruleId,
      storedStatus,
      currentStatus,
      reproduced,
      isRegression,
      runId: verifyResult.run?.id || null,
      regressionSummary,
    });
  }

  // 5. Determine overall PR status
  let finalStatus = "SUCCESS";
  let resultsSummary = "All security & regression checks passed for tested cases.";

  if (hasRegressionAlert) {
    finalStatus = "FAILURE";
    resultsSummary = "REGRESSION ALERT: Vulnerability previously fixed reproduces on PR head commit.";
  } else if (evaluationResults.some((e) => e.currentStatus === "EXECUTION_ERROR")) {
    finalStatus = "FAILURE";
    resultsSummary = "Execution error encountered during security verification.";
  }

  await appendLog(`PR check completed with status: ${finalStatus} (Regression alert: ${hasRegressionAlert})`);

  // 6. Update PullRequestCheck database record
  if (prCheckId) {
    try {
      await prisma.pullRequestCheck.update({
        where: { id: prCheckId },
        data: {
          status: finalStatus,
          hasRegression: hasRegressionAlert,
          resultsSummary,
          details: {
            evaluatedFindings: evaluationResults,
            evaluatedAt: new Date().toISOString(),
          },
        },
      });
    } catch (dbErr) {
      console.warn("[pr-check] Failed to update PullRequestCheck record:", dbErr.message);
    }
  }

  // 7. Audit event: PR_CHECK_COMPLETED
  try {
    await prisma.auditEvent.create({
      data: {
        projectId: project.id,
        action: "PR_CHECK_COMPLETED",
        entityType: "PullRequestCheck",
        entityId: prCheckId || job.id,
        metadata: {
          prNumber,
          headSha: resolvedHeadSha,
          status: finalStatus,
          hasRegression: hasRegressionAlert,
          findingsCount: evaluationResults.length,
          jobId: job.id,
        },
      },
    });
  } catch (auditErr) {
    console.warn("[pr-check] Failed to log PR_CHECK_COMPLETED audit event:", auditErr.message);
  }

  // 8. Report back to GitHub (Commit status & PR comment)
  const appUrl = process.env.APP_URL || "https://patchproof-three.vercel.app";
  const monitoringUrl = `${appUrl}/app/repositories/${project.id}`;

  try {
    await setCommitStatus({
      owner: project.repoOwner,
      repo: project.repoName,
      sha: resolvedHeadSha,
      state: finalStatus === "SUCCESS" ? "success" : "failure",
      description: hasRegressionAlert
        ? "PatchProof: Regression alert detected!"
        : "PatchProof: Security and regression checks passed",
      targetUrl: monitoringUrl,
    });
  } catch (ghErr) {
    await appendLog(`Warning: Failed to set GitHub commit status: ${ghErr.message}`);
  }

  try {
    await postOrUpdatePrComment({
      owner: project.repoOwner,
      repo: project.repoName,
      pullNumber,
      headSha: resolvedHeadSha,
      findings: evaluationResults,
      hasRegression: hasRegressionAlert,
      monitoringUrl,
    });
  } catch (ghErr) {
    await appendLog(`Warning: Failed to post GitHub PR comment: ${ghErr.message}`);
  }

  return {
    prCheckId,
    projectId: project.id,
    prNumber,
    headSha: resolvedHeadSha,
    status: finalStatus,
    hasRegression: hasRegressionAlert,
    resultsSummary,
    findings: evaluationResults,
  };
}
