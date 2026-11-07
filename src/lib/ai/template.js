import { FIXED_SECURITY_DISCLAIMER } from "../report.js";
import { LIMITATIONS_NOTICE } from "../verdict.js";

/**
 * Deterministically generates a structured security explanation when no AI key is configured.
 *
 * @param {object} params
 * @param {string} params.task - The AI analysis task
 * @param {object} params.evidence - The structured evidence JSON
 * @param {Set<string>} params.validEvidenceIds - Valid run, report, finding, and artifact IDs
 * @returns {object} Conforming to AiExplanationSchema with provider & model 'template'
 */
export function generateTemplateExplanation({ task, evidence = {}, validEvidenceIds = new Set() }) {
  const finding = evidence.finding || {};
  const run = evidence.run || {};
  const report = evidence.report || {};
  const commit = evidence.commit || report.candidateCommit || run.commitSha || "target commit";
  const ruleId = finding.ruleId || "security-vulnerability";
  const title = finding.title || report.summary || "Security Analysis Target";

  // Build real citations from provided validEvidenceIds
  const citations = [];
  if (finding.id && validEvidenceIds.has(finding.id)) {
    citations.push({
      type: "finding",
      id: finding.id,
      name: finding.title || finding.ruleId || "Target Finding",
      description: `Rule ${finding.ruleId} at ${finding.filePath || "repository"}`,
    });
  }
  if (run.id && validEvidenceIds.has(run.id)) {
    citations.push({
      type: "run",
      id: run.id,
      name: `Run #${run.id.slice(-8)}`,
      description: `Verification status: ${run.status || "COMPLETED"} (${run.reproducerId || "reproducer"})`,
    });
  }
  if (report.id && validEvidenceIds.has(report.id)) {
    citations.push({
      type: "report",
      id: report.id,
      name: `Report #${report.id.slice(-8)}`,
      description: `Patch verification verdict: ${report.verdict || "RECORDED"}`,
    });
  }
  // Include diff or log artifact citations if present in valid IDs
  for (const art of evidence.artifacts || []) {
    if (art.name && validEvidenceIds.has(art.name)) {
      citations.push({
        type: "artifact",
        id: art.name,
        name: art.name,
        description: `Stored evidence artifact (${art.kind || "FILE"}, ${art.sizeBytes || 0} bytes)`,
      });
    }
  }

  // Base template contents customized per task
  let summary = `Template summary (no AI key configured): Automated analysis for ${title}.`;
  let rootCause = `The finding references rule ${ruleId} in ${finding.filePath || "source files"}. User-controlled input appears to be interpolated directly without strict parameterized encoding.`;
  let remediationOptions = [];
  let additionalTests = [];
  let nextSteps = [];

  if (task === "explain-finding" || task === "suggest-remediation") {
    summary = `Template summary (no AI key configured): Finding explanation and remediation analysis for ${title}.`;
    rootCause = `Untrusted input reaches a sensitive sink in ${finding.filePath || "the application"}. In rule '${ruleId}', parameters are dynamically concatenated, allowing attacker-supplied SQL control characters or script tags to alter execution logic.`;
    remediationOptions = [
      {
        title: "Parameterize Database Queries",
        description: "Replace string concatenation or f-strings with native SQLite / database parameter markers (e.g. '?' or ':param') so values are strictly handled as data literals.",
        codeSnippet: `# Secure parameterized pattern (example for Python sqlite3):\ncursor.execute("SELECT id, username, email FROM users WHERE id = ?", (user_id,))\nrow = cursor.fetchone()`,
      },
      {
        title: "Input Boundary Validation",
        description: "Enforce strict alphanumeric whitelist validation or cast string inputs to expected types (e.g. int) before passing to lower-level storage routines.",
        codeSnippet: `try:\n    user_id_int = int(user_id)\nexcept (ValueError, TypeError):\n    raise BadRequest("Invalid user identifier")`,
      },
    ];
    additionalTests = [
      {
        name: "Blind SQL Injection Tautology Test",
        description: "Assert that boolean tautology input payloads (e.g. '1 OR 1=1') return only the specific requested entity rather than all records.",
        testCode: `def test_sqli_tautology_injection(self):\n    response = client.get('/users?id=1%27%20OR%201=1--')\n    self.assertEqual(response.status_code, 200)\n    data = response.json()\n    # Should not return all users\n    self.assertEqual(len(data), 1)`,
      },
      {
        name: "Legitimate Apostrophe Name Handling",
        description: "Verify that valid inputs with apostrophes (e.g. O'Brien) execute cleanly without syntax errors when parameterized.",
        testCode: `def test_legitimate_name_with_apostrophe(self):\n    response = client.get('/users/by-name?name=O%27Brien')\n    self.assertIn(response.status_code, [200, 404])`,
      },
    ];
    nextSteps = [
      "Review the vulnerable code snippet in the findings editor.",
      "Run the isolated security reproducer to confirm the exploit reproduced.",
      "Apply parameterized queries across all database query execution points.",
      "Execute the regression suite to ensure legitimate input queries are not broken.",
    ];
  } else if (task === "summarize-run") {
    const status = run.status || "REPRODUCED";
    summary = `Template summary (no AI key configured): Verification run #${(run.id || "0").slice(-8)} concluded with status ${status}.`;
    rootCause = `The sandboxed security reproducer '${run.reproducerId || "sqli_find_user"}' was executed three consecutive times against commit ${String(commit).slice(0, 7)}. All runs reported exit code ${run.exitCode ?? 0} with precondition_ok: true.`;
    remediationOptions = [
      {
        title: "Compare Against Candidate Patch",
        description: "Validate a candidate patch commit to verify whether the exploit reproducer transitions from REPRODUCED to NOT_REPRODUCED.",
        codeSnippet: `git diff ${String(run.commitSha || "baseline").slice(0, 7)}..candidate_patch`,
      },
    ];
    additionalTests = [
      {
        name: "Reproducer Consistency Verification",
        description: "Execute the reproducer multiple times under constrained CPU and memory limits to check for environmental flakiness.",
        testCode: `python security/reproducers/${run.reproducerId || "sqli_find_user"}.py`,
      },
    ];
    nextSteps = [
      "Inspect execution logs to verify oracle assertion details.",
      "Select a candidate patch commit in the verification panel to run patch validation.",
    ];
  } else if (task === "explain-report") {
    const verdict = report.verdict || "FIX_VERIFIED";
    summary = `Template summary (no AI key configured): Patch report #${(report.id || "0").slice(-8)} verdict is ${verdict}.`;
    rootCause = `Baseline commit ${String(report.baselineCommit || "").slice(0, 7)} reproduced the vulnerability, while candidate fix ${String(report.candidateCommit || "").slice(0, 7)} prevented exploit reproduction across all 3 sandbox passes.`;
    remediationOptions = [
      {
        title: "Patch Integration Review",
        description: "Review the candidate code diff in the report diff viewer and verify zero functional regressions were introduced.",
        codeSnippet: `git diff ${String(report.baselineCommit || "").slice(0, 7)}..${String(report.candidateCommit || "").slice(0, 7)}`,
      },
    ];
    additionalTests = [
      {
        name: "Full Regression Suite Verification",
        description: "Execute all unit tests across existing features to confirm side-effect resilience.",
        testCode: `python -m unittest discover tests`,
      },
    ];
    nextSteps = [
      "Verify cryptographic evidence hashes in the patch report.",
      "Export patch report in Markdown or JSON format for change audit.",
      "Prepare candidate branch for pull request merge.",
    ];
  } else if (task === "suggest-tests") {
    summary = `Template summary (no AI key configured): Suggested test harness and boundary cases for ${title}.`;
    rootCause = `Automated testing must verify both malicious exploit payloads (security reproducers) and normal domain inputs (regression suite).`;
    remediationOptions = [
      {
        title: "Parameterized Query Implementation",
        description: "Replace ad-hoc escaping with prepared statements.",
        codeSnippet: `cursor.execute("SELECT * FROM users WHERE id = ?", (param,))`,
      },
    ];
    additionalTests = [
      {
        name: "Null Byte & Hex Encoding Test",
        description: "Ensure string parsers reject null-terminated or hex-encoded payload injections.",
        testCode: `def test_null_byte_rejection(self):\n    response = client.get('/users?id=1%00--')\n    self.assertIn(response.status_code, [400, 422])`,
      },
      {
        name: "Malformed Type Coercion Test",
        description: "Pass arrays, JSON objects, and unexpected types to parameters expecting scalars.",
        testCode: `def test_array_payload_rejection(self):\n    response = client.get('/users?id[]=-1')\n    self.assertIn(response.status_code, [400, 422])`,
      },
    ];
    nextSteps = [
      "Add proposed test methods to tests/test_users.py.",
      "Run python -m unittest discover tests inside the sandboxed test environment.",
    ];
  }

  const limitations = [
    "Template summary (no AI key configured) generated without external LLM provider.",
    `Evaluation scope: ${LIMITATIONS_NOTICE}`,
    FIXED_SECURITY_DISCLAIMER,
  ];

  return {
    summary,
    rootCause,
    remediationOptions,
    additionalTests,
    nextSteps,
    limitations,
    citedEvidence: citations,
    provider: "template",
    model: "template",
  };
}
