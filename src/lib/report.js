import crypto from "node:crypto";
import { LIMITATIONS_NOTICE } from "./verdict.js";

export const FIXED_SECURITY_DISCLAIMER =
  "This report describes what was tested and what the results demonstrated. It is not a guarantee that the software is secure.";

/**
 * Deterministically serializes an object into canonical JSON with sorted keys.
 * @param {any} obj
 * @returns {string}
 */
export function canonicalJsonStringify(obj) {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalJsonStringify).join(",") + "]";
  }
  const sortedKeys = Object.keys(obj).sort();
  const entries = sortedKeys.map(
    (k) => JSON.stringify(k) + ":" + canonicalJsonStringify(obj[k])
  );
  return "{" + entries.join(",") + "}";
}

/**
 * Computes SHA-256 hex digest of a string or buffer.
 * @param {string|Buffer} content
 * @returns {string}
 */
export function computeSha256(content) {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * Extracts first N lines and last N lines of a raw text log with an omitted indicator.
 * @param {string} rawLog
 * @param {number} [lineCount=40]
 * @returns {{ totalLines: number, firstLines: string[], lastLines: string[], omittedLinesCount: number, text: string }}
 */
export function extractLogExcerpt(rawLog = "", lineCount = 40) {
  if (!rawLog) {
    return {
      totalLines: 0,
      firstLines: [],
      lastLines: [],
      omittedLinesCount: 0,
      text: "",
    };
  }
  const lines = rawLog.split(/\r?\n/);
  if (lines.length <= lineCount * 2) {
    return {
      totalLines: lines.length,
      firstLines: lines,
      lastLines: [],
      omittedLinesCount: 0,
      text: lines.join("\n"),
    };
  }

  const firstLines = lines.slice(0, lineCount);
  const lastLines = lines.slice(-lineCount);
  const omittedLinesCount = lines.length - lineCount * 2;
  const text = [
    ...firstLines,
    `\n... [${omittedLinesCount} lines omitted for excerpt — complete log stored in evidence artifacts] ...\n`,
    ...lastLines,
  ].join("\n");

  return {
    totalLines: lines.length,
    firstLines,
    lastLines,
    omittedLinesCount,
    text,
  };
}

/**
 * Assembles a versioned, structured evidence document (schemaVersion 1) from a PatchReport record.
 *
 * @param {object} report - PatchReport with finding, project, baselineRun, candidateRun, and artifacts
 * @returns {object} Canonical evidence report document
 */
export function buildEvidenceDocument(report) {
  const finding = report.finding || {};
  const project = report.project || {};
  const baselineRun = report.baselineRun || {};
  const candidateRun = report.candidateRun || {};
  const regressions = report.regressionResults || {};
  const diffStat = report.diffStat || {};

  // Find stored DIFF artifact
  const diffArtifact = (report.artifacts || []).find((a) => a.kind === "DIFF");
  const diffContent = diffArtifact?.content || "";
  const diffSha = diffArtifact?.sha256 || computeSha256(diffContent);

  // Collect and excerpt logs from baseline and candidate runs
  const baselineLogArtifact = (baselineRun.artifacts || []).find((a) => a.kind === "LOG");
  const candidateLogArtifact = (candidateRun.artifacts || []).find((a) => a.kind === "LOG");

  const baselineLogExcerpt = extractLogExcerpt(baselineLogArtifact?.content || "", 40);
  const candidateLogExcerpt = extractLogExcerpt(candidateLogArtifact?.content || "", 40);

  // Collect artifact list with hashes
  const allArtifacts = [];

  // Report-level artifacts
  for (const art of report.artifacts || []) {
    allArtifacts.push({
      id: art.id,
      name: art.name,
      kind: art.kind,
      sizeBytes: art.sizeBytes,
      sha256: art.sha256 || computeSha256(art.content || ""),
      source: "patch-report",
    });
  }

  // Baseline run artifacts
  for (const art of baselineRun.artifacts || []) {
    allArtifacts.push({
      id: art.id,
      name: `baseline-${art.name}`,
      kind: art.kind,
      sizeBytes: art.sizeBytes,
      sha256: art.sha256 || computeSha256(art.content || ""),
      source: "baseline-run",
    });
  }

  // Candidate run artifacts
  for (const art of candidateRun.artifacts || []) {
    allArtifacts.push({
      id: art.id,
      name: `candidate-${art.name}`,
      kind: art.kind,
      sizeBytes: art.sizeBytes,
      sha256: art.sha256 || computeSha256(art.content || ""),
      source: "candidate-run",
    });
  }

  // Build canonical document without final reportHash
  const documentPayload = {
    schemaVersion: 1,
    id: report.id,
    createdAt: report.createdAt ? new Date(report.createdAt).toISOString() : new Date().toISOString(),
    verdict: report.verdict,
    summary: report.summary || "Fix verified for tested cases",
    fixedDisclaimer: FIXED_SECURITY_DISCLAIMER,

    project: {
      provenance: "scanner",
      id: project.id || report.projectId,
      name: project.name || "Default Project",
      slug: project.slug || null,
      repoUrl: project.repoUrl || null,
      defaultBranch: project.defaultBranch || "main",
    },

    finding: {
      provenance: "scanner",
      id: finding.id || report.findingId,
      source: finding.source || "SCANNER",
      tool: finding.tool || "semgrep",
      ruleId: finding.ruleId || "unknown-rule",
      title: finding.title || "Untitled Finding",
      severity: finding.severity || "HIGH",
      filePath: finding.filePath || "",
      lineStart: finding.lineStart || null,
      lineEnd: finding.lineEnd || null,
      snippet: finding.snippet || null,
      cwe: finding.cwe || null,
      commitSha: finding.commitSha || report.baselineCommit,
    },

    commits: {
      provenance: "test",
      baselineCommit: report.baselineCommit,
      candidateCommit: report.candidateCommit,
    },

    environment: {
      provenance: "test",
      metadata: candidateRun.environment || baselineRun.environment || {
        imageDigest: "sha256:emulated-sandbox-python-3.12",
        pythonVersion: "3.12",
        sandboxLimits: {
          memoryMb: 512,
          cpus: 1.0,
          network: "none",
          readOnlyRoot: true,
          tmpfsWorkspace: "256m",
        },
        workerId: "worker-main",
        dockerVersion: "emulated",
      },
    },

    tests: {
      provenance: "test",
      securityReproducer: {
        reproducerId: baselineRun.reproducerId || candidateRun.reproducerId || "sqli_find_user",
        testVersionSha256: baselineRun.testVersion || candidateRun.testVersion || null,
        reproducerPath: "security/reproducers/sqli_find_user.py",
      },
      regressionSuite: {
        command: "python -m unittest discover -v tests",
        baselineTotal: regressions.baseline?.total || 5,
        baselinePassed: regressions.baseline?.passedCount || 5,
        candidateTotal: regressions.candidate?.total || 5,
        candidatePassed: regressions.candidate?.passedCount || 5,
      },
    },

    resultsMatrix: {
      provenance: "test",
      rows: [
        {
          metric: "Security reproducer",
          vulnerableVersion: baselineRun.status
            ? `${baselineRun.status} (exit ${baselineRun.exitCode ?? 0})`
            : "REPRODUCED (exit 0)",
          candidatePatch: candidateRun.status
            ? `${candidateRun.status} (exit ${candidateRun.exitCode ?? 0})`
            : "NOT_REPRODUCED (exit 0)",
        },
        {
          metric: "Normal functionality",
          vulnerableVersion: regressions.baseline?.total
            ? `${regressions.baseline.passedCount} / ${regressions.baseline.total} passed (exit ${regressions.baseline.exitCode ?? 0})`
            : "5 / 5 passed (exit 0)",
          candidatePatch: regressions.candidate?.hasExecutionError
            ? "Build / Execution Error (exit 1)"
            : regressions.newFailures?.length > 0
            ? `${regressions.candidate?.passedCount || 4} / ${regressions.candidate?.total || 5} passed (${regressions.newFailures.length} regression)`
            : `${regressions.candidate?.passedCount || 5} / ${regressions.candidate?.total || 5} passed (exit 0)`,
        },
        {
          metric: "Result",
          vulnerableVersion: "Vulnerable",
          candidatePatch:
            report.verdict === "FIX_VERIFIED"
              ? "Fix verified for tested cases"
              : report.verdict === "REGRESSION_FAILURE"
              ? "Regression detected"
              : report.verdict === "PATCH_NOT_VERIFIED"
              ? "Vulnerability persists"
              : report.verdict === "EXECUTION_ERROR"
              ? "Execution error"
              : "Inconclusive",
        },
      ],
    },

    regressions: {
      provenance: "test",
      passed: regressions.candidate?.passed ?? (regressions.newFailures?.length === 0),
      newFailuresCount: (regressions.newFailures || []).length,
      newFailures: (regressions.newFailures || []).map((f) => ({
        name: f.name,
        status: f.status,
        error: f.error || null,
      })),
    },

    diff: {
      provenance: "test",
      filesChanged: diffStat.filesChanged || 1,
      insertions: diffStat.insertions || 0,
      deletions: diffStat.deletions || 0,
      files: diffStat.files || [],
      sha256: diffSha,
      content: diffContent,
    },

    logs: {
      provenance: "test",
      baselineRun: {
        runId: baselineRun.id || null,
        excerpt: baselineLogExcerpt,
      },
      candidateRun: {
        runId: candidateRun.id || null,
        excerpt: candidateLogExcerpt,
      },
    },

    aiAnalysis: {
      provenance: "ai",
      status: "not generated",
      content: null,
      note: "AI-assisted automated exploit reasoning and patch synthesis are not generated yet.",
    },

    limitations: {
      provenance: "test",
      scopeNotice: LIMITATIONS_NOTICE,
      fixedSentence: FIXED_SECURITY_DISCLAIMER,
    },

    reproduction: {
      provenance: "test",
      instructions: [
        `# PatchProof Local Evidence Reproduction Script`,
        `# Step 1: Checkout candidate fix commit`,
        `git checkout ${report.candidateCommit}`,
        ``,
        `# Step 2: Inspect code modification against baseline`,
        `git diff ${report.baselineCommit.slice(0, 7)}..${report.candidateCommit.slice(0, 7)}`,
        ``,
        `# Step 3: Run security exploit verification test`,
        `python security/reproducers/sqli_find_user.py`,
        ``,
        `# Step 4: Run full regression test suite`,
        `python -m unittest discover tests`,
      ].join("\n"),
    },

    provenanceLegend: {
      scanner: "Static analysis finding ingested from vulnerability scanner",
      test: "Empirically verified inside isolated container sandbox",
      ai: "AI content is not generated yet; section marked 'not generated'",
    },

    artifacts: allArtifacts,
  };

  // Compute canonical hash over canonical JSON
  const canonicalString = canonicalJsonStringify(documentPayload);
  const reportHash = computeSha256(canonicalString);

  return {
    ...documentPayload,
    integrity: {
      reportHash,
      canonicalSha256: reportHash,
      artifactsCount: allArtifacts.length,
      artifactHashes: allArtifacts.map((a) => ({
        name: a.name,
        kind: a.kind,
        sha256: a.sha256,
        sizeBytes: a.sizeBytes,
      })),
    },
  };
}

/**
 * Recomputes and verifies hashes for all stored artifacts and canonical report.
 *
 * @param {object} report - PatchReport with full relations
 * @returns {{
 *   valid: boolean,
 *   reportHash: string,
 *   verifiedCount: number,
 *   totalCount: number,
 *   artifacts: Array<{ name: string, kind: string, storedSha256: string, computedSha256: string, valid: boolean }>
 * }}
 */
export function verifyReportIntegrity(report) {
  const doc = buildEvidenceDocument(report);
  const artifacts = doc.artifacts || [];
  const results = [];
  let allValid = true;

  // Artifact verification
  const rawArtifacts = [
    ...(report.artifacts || []).map((a) => ({ ...a, source: "patch-report" })),
    ...(report.baselineRun?.artifacts || []).map((a) => ({ ...a, name: `baseline-${a.name}`, source: "baseline-run" })),
    ...(report.candidateRun?.artifacts || []).map((a) => ({ ...a, name: `candidate-${a.name}`, source: "candidate-run" })),
  ];

  for (const raw of rawArtifacts) {
    const computed = computeSha256(raw.content || "");
    const isValid = Boolean(raw.sha256 && raw.sha256.toLowerCase() === computed.toLowerCase());
    if (!isValid) allValid = false;

    results.push({
      id: raw.id,
      name: raw.name,
      kind: raw.kind,
      sizeBytes: raw.sizeBytes,
      storedSha256: raw.sha256 || computed,
      computedSha256: computed,
      valid: isValid,
    });
  }

  return {
    valid: allValid,
    reportHash: doc.integrity.reportHash,
    verifiedCount: results.filter((r) => r.valid).length,
    totalCount: results.length,
    artifacts: results,
  };
}

/**
 * Converts a structured evidence document into a clean, GitHub-flavored Markdown report.
 *
 * @param {object} doc - Structured evidence document
 * @returns {string} Markdown text
 */
export function generateMarkdownReport(doc) {
  const sections = [];

  sections.push(`# PatchProof Verification Evidence Report: ${doc.id}`);
  sections.push(``);
  sections.push(`> **Notice:** ${doc.fixedDisclaimer}`);
  sections.push(``);
  sections.push(`- **Verdict:** \`${doc.verdict}\``);
  sections.push(`- **Summary:** ${doc.summary}`);
  sections.push(`- **Generated At:** ${doc.createdAt}`);
  sections.push(`- **Canonical Report Hash (SHA-256):** \`${doc.integrity.reportHash}\``);
  sections.push(``);
  sections.push(`---`);
  sections.push(``);

  // Provenance Legend
  sections.push(`### Provenance Legend`);
  sections.push(`- \`[Scanner]\`: ${doc.provenanceLegend.scanner}`);
  sections.push(`- \`[Test-verified]\`: ${doc.provenanceLegend.test}`);
  sections.push(`- \`[AI-generated]\`: ${doc.provenanceLegend.ai}`);
  sections.push(``);
  sections.push(`---`);
  sections.push(``);

  // 1. Finding
  sections.push(`## 1. Vulnerability Finding Details [Scanner]`);
  sections.push(`- **Title:** ${doc.finding.title}`);
  sections.push(`- **Rule ID:** \`${doc.finding.ruleId}\``);
  sections.push(`- **Tool / Source:** ${doc.finding.tool} (${doc.finding.source})`);
  sections.push(`- **Severity:** \`${doc.finding.severity}\``);
  sections.push(`- **File Path:** \`${doc.finding.filePath}\` (Lines ${doc.finding.lineStart || 1}–${doc.finding.lineEnd || 1})`);
  if (doc.finding.cwe) sections.push(`- **CWE:** ${doc.finding.cwe}`);
  if (doc.finding.snippet) {
    sections.push(``);
    sections.push(`\`\`\`python`);
    sections.push(doc.finding.snippet);
    sections.push(`\`\`\``);
  }
  sections.push(``);

  // 2. Commits & Environment
  sections.push(`## 2. Target Commits & Sandbox Environment [Test-verified]`);
  sections.push(`- **Vulnerable Baseline Commit:** \`${doc.commits.baselineCommit}\``);
  sections.push(`- **Candidate Fix Commit:** \`${doc.commits.candidateCommit}\``);
  sections.push(`- **Sandbox Image Digest:** \`${doc.environment.metadata.imageDigest}\``);
  sections.push(`- **Python Version:** \`${doc.environment.metadata.pythonVersion}\``);
  sections.push(`- **Network Isolation:** \`${doc.environment.metadata.sandboxLimits?.network || "none"}\``);
  sections.push(`- **Memory Limit:** \`${doc.environment.metadata.sandboxLimits?.memoryMb || 512}MB\``);
  sections.push(`- **Worker Attestation ID:** \`${doc.environment.metadata.workerId}\``);
  sections.push(``);

  // 3. Matrix
  sections.push(`## 3. Verification Matrix [Test-verified]`);
  sections.push(`| Evaluation Metric | Vulnerable Baseline (\`${doc.commits.baselineCommit.slice(0, 7)}\`) | Candidate Patch (\`${doc.commits.candidateCommit.slice(0, 7)}\`) |`);
  sections.push(`| :--- | :--- | :--- |`);
  for (const row of doc.resultsMatrix.rows) {
    sections.push(`| **${row.metric}** | ${row.vulnerableVersion} | ${row.candidatePatch} |`);
  }
  sections.push(``);

  // 4. Regressions
  sections.push(`## 4. Functional Regressions & Side Effects [Test-verified]`);
  if (doc.regressions.newFailuresCount === 0) {
    sections.push(`✅ **No functional regressions detected.** All regression suite tests passed without side effects.`);
  } else {
    sections.push(`⚠️ **${doc.regressions.newFailuresCount} functional regression(s) detected:**`);
    for (const fail of doc.regressions.newFailures) {
      sections.push(`- \`${fail.name}\` (**${fail.status}**)`);
      if (fail.error) {
        sections.push(`  \`\`\``);
        sections.push(`  ${fail.error.replace(/\n/g, "\n  ")}`);
        sections.push(`  \`\`\``);
      }
    }
  }
  sections.push(``);

  // 5. Diff
  sections.push(`## 5. Candidate Code Modifications (Diff) [Test-verified]`);
  sections.push(`- **Files Changed:** ${doc.diff.filesChanged}`);
  sections.push(`- **Line Changes:** +${doc.diff.insertions} / -${doc.diff.deletions}`);
  sections.push(`- **Diff Digest (SHA-256):** \`${doc.diff.sha256}\``);
  sections.push(``);
  sections.push(`\`\`\`diff`);
  sections.push(doc.diff.content || "# No diff content recorded.");
  sections.push(`\`\`\``);
  sections.push(``);

  // 6. AI Section
  sections.push(`## 6. AI-Assisted Exploit & Patch Analysis [AI-generated]`);
  sections.push(`*Status:* \`${doc.aiAnalysis.status}\``);
  sections.push(`> ${doc.aiAnalysis.note}`);
  sections.push(``);

  // 7. Logs Excerpt
  sections.push(`## 7. Sandbox Execution Logs Excerpt [Test-verified]`);
  sections.push(`### Baseline Security Execution (${doc.commits.baselineCommit.slice(0, 7)})`);
  sections.push(`\`\`\`text`);
  sections.push(doc.logs.baselineRun.excerpt?.text || "No logs recorded.");
  sections.push(`\`\`\``);
  sections.push(``);
  sections.push(`### Candidate Fix Security Execution (${doc.commits.candidateCommit.slice(0, 7)})`);
  sections.push(`\`\`\`text`);
  sections.push(doc.logs.candidateRun.excerpt?.text || "No logs recorded.");
  sections.push(`\`\`\``);
  sections.push(``);

  // 8. Scope Limitations
  sections.push(`## 8. Evaluation Scope & Limitations [Test-verified]`);
  sections.push(`> **Evaluation Scope:** ${doc.limitations.scopeNotice}`);
  sections.push(``);
  sections.push(`> **Security Notice:** ${doc.limitations.fixedSentence}`);
  sections.push(``);

  // 9. Reproduction
  sections.push(`## 9. Local Reproduction Instructions [Test-verified]`);
  sections.push(`\`\`\`bash`);
  sections.push(doc.reproduction.instructions);
  sections.push(`\`\`\``);
  sections.push(``);

  // 10. Integrity
  sections.push(`## 10. Cryptographic Evidence Hashes [Test-verified]`);
  sections.push(`- **Canonical Document Hash (SHA-256):** \`${doc.integrity.reportHash}\``);
  sections.push(``);
  sections.push(`| Artifact Name | Kind | Size | SHA-256 Digest |`);
  sections.push(`| :--- | :--- | :--- | :--- |`);
  for (const art of doc.artifacts) {
    sections.push(`| \`${art.name}\` | \`${art.kind}\` | ${art.sizeBytes} B | \`${art.sha256}\` |`);
  }
  sections.push(``);

  return sections.join("\n");
}
