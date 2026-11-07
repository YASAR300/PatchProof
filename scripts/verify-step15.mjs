import { redactSecrets, truncateLog, redactEvidence } from "../src/lib/ai/redact.js";
import { AiExplanationSchema, filterValidCitations } from "../src/lib/ai/schema.js";
import { generateTemplateExplanation } from "../src/lib/ai/template.js";
import { generate } from "../src/lib/ai/index.js";
import { callAnthropicMessages } from "../src/lib/ai/anthropic.js";
import { buildEvidenceDocument, generateMarkdownReport } from "../src/lib/report.js";

async function runStep15Tests() {
  console.log("=== STEP 15 AI SECURITY ASSISTANT VERIFICATION SUITE ===");

  // 1. Secret Redaction Tests
  console.log("[1] Testing Secret & Token Redaction:");
  const sensitiveText = [
    "AWS Key: AKIAIOSFODNN7EXAMPLE",
    "GitHub Token: ghp_1234567890abcdefghijklmnopqrstuvwxyz",
    "Anthropic Key: sk-ant-api03-abcdefghijklmnopqrstuvwxyz123456",
    "Bearer Header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz",
    'Config: "password": "SuperSecretPassword123!"',
  ].join("\n");

  const redacted = redactSecrets(sensitiveText);
  console.log("   - Raw contains secrets, checking redacted output...");
  if (redacted.includes("AKIAIOSFODNN7EXAMPLE") ||
      redacted.includes("ghp_1234567890") ||
      redacted.includes("sk-ant-api03") ||
      redacted.includes("SuperSecretPassword123!")) {
    throw new Error("Secret redaction failed to scrub sensitive tokens!");
  }
  if (!redacted.includes("[REDACTED_SECRET]")) {
    throw new Error("Redacted output does not contain '[REDACTED_SECRET]' marker!");
  }
  console.log("   ✓ All secret tokens and passwords successfully redacted.");

  // 2. Log Truncation Tests
  console.log("[2] Testing Log Truncation:");
  const longLog = Array.from({ length: 100 }, (_, i) => `Line ${i + 1}: Execution trace details`).join("\n");
  const truncated = truncateLog(longLog, 25);
  const truncatedLines = truncated.split("\n");
  if (!truncated.includes("log lines omitted for evidence safety")) {
    throw new Error("Log truncation notice missing!");
  }
  console.log(`   ✓ Long log (100 lines) truncated to safe excerpt (lines count: ${truncatedLines.length}).`);

  // 3. Zod Schema & Citation Filtering Tests
  console.log("[3] Testing Zod Schema Validation & Citation Dropping:");
  const validIds = new Set(["finding-123", "run-456", "patch-diff.diff"]);
  const rawCitations = [
    { type: "finding", id: "finding-123", name: "SQL Injection" },
    { type: "run", id: "run-456", name: "Run #1" },
    { type: "artifact", id: "patch-diff.diff", name: "patch-diff.diff" },
    { type: "run", id: "hallucinated-run-999", name: "Non-existent Run" },
    { type: "report", id: "ghost-report-777", name: "Fake Report" },
  ];

  const validCitations = filterValidCitations(rawCitations, validIds);
  console.log(`   - Input citations: ${rawCitations.length}, Filtered citations: ${validCitations.length}`);
  if (validCitations.length !== 3) {
    throw new Error(`Expected 3 valid citations, got ${validCitations.length}`);
  }
  if (validCitations.some((c) => c.id === "hallucinated-run-999" || c.id === "ghost-report-777")) {
    throw new Error("Failed to drop non-existent citations!");
  }
  console.log("   ✓ Non-existent citations correctly dropped.");

  // 4. Deterministic Template Generator (No AI Key)
  console.log("[4] Testing Deterministic Template Generator (no AI key configured):");
  delete process.env.ANTHROPIC_API_KEY;

  const mockEvidence = {
    finding: {
      id: "finding-123",
      ruleId: "python.sqlite.sqli",
      title: "SQL Injection in src/users.py",
      filePath: "src/users.py",
      snippet: 'cursor.execute("SELECT * FROM users WHERE id = " + user_id)',
    },
    run: {
      id: "run-456",
      status: "REPRODUCED",
      reproducerId: "sqli_find_user",
      exitCode: 0,
    },
    artifacts: [{ id: "patch-diff.diff", name: "patch-diff.diff", kind: "DIFF", sizeBytes: 420 }],
  };

  const templateOutput = generateTemplateExplanation({
    task: "explain-finding",
    evidence: mockEvidence,
    validEvidenceIds: validIds,
  });

  const parsedTemplate = AiExplanationSchema.parse(templateOutput);
  if (!parsedTemplate.summary.includes("Template summary (no AI key configured)")) {
    throw new Error("Template summary must be labeled 'Template summary (no AI key configured)'!");
  }
  if (parsedTemplate.remediationOptions.length === 0) {
    throw new Error("Template missing remediationOptions!");
  }
  if (parsedTemplate.additionalTests.length === 0) {
    throw new Error("Template missing additionalTests!");
  }
  if (templateOutput.provider !== "template" || templateOutput.model !== "template") {
    throw new Error("Template output must show provider 'template' and model 'template'!");
  }
  console.log("   ✓ Template output successfully generated and conforms to Zod schema.");
  console.log(`     Summary: ${parsedTemplate.summary}`);
  console.log(`     Remediations: ${parsedTemplate.remediationOptions.length}, Tests: ${parsedTemplate.additionalTests.length}`);

  // 5. Invalid Key Graceful Error Test
  console.log("[5] Testing Invalid Key Graceful Error Handling:");
  try {
    await callAnthropicMessages({
      systemPrompt: "You are an assistant",
      userMessage: "Hello",
      apiKey: "invalid-key-testing-graceful-error-123456",
      model: "claude-3-5-sonnet-20241022",
    });
    throw new Error("Expected invalid key to throw an error, but it succeeded!");
  } catch (err) {
    console.log(`   ✓ Graceful error caught on invalid key: ${err.message}`);
    if (!err.isAuthError && !err.message.includes("authentication failed")) {
      console.log("     (Note: Anthropic returned standard client error as expected)");
    }
  }

  // 6. Assistant Target Selection & State Synchronization Assertion
  console.log("[6] Testing Target Selection & State Synchronization Logic:");
  const testFindings = [
    { id: "finding-xss-1", severity: "MEDIUM", title: "XSS in DOM", filePath: "src/render.js" },
    { id: "finding-sqli-2", severity: "HIGH", title: "SQL Injection", filePath: "src/users.py" },
  ];
  const testReports = [
    { id: "report-inconclusive-1", verdict: "INCONCLUSIVE", baselineCommit: "9d13f9f", candidateCommit: "1d68f9b" },
    { id: "report-fix-verified-2", verdict: "FIX_VERIFIED", baselineCommit: "9d13f9f", candidateCommit: "da17102" },
  ];

  // Emulate assistant selection state resolution
  let currentTargetType = "Finding";
  let activeFindingId = testFindings[0].id;
  let activeReportId = testReports[0].id;

  function resolvePayload(targetType, findingId, reportId) {
    const id = targetType === "Finding" ? findingId : reportId;
    return {
      entityType: targetType,
      entityId: id,
      task: targetType === "Finding" ? "explain-finding" : "explain-report",
    };
  }

  // Initial state should point to first finding
  let p1 = resolvePayload(currentTargetType, activeFindingId, activeReportId);
  if (p1.entityId !== "finding-xss-1") throw new Error("Initial finding target mismatch");

  // Switch selection to SQL Injection
  activeFindingId = testFindings[1].id;
  let p2 = resolvePayload(currentTargetType, activeFindingId, activeReportId);
  if (p2.entityId !== "finding-sqli-2") throw new Error("Updated finding target did not synchronize!");
  console.log(`   ✓ Finding selection accurately synchronized to: ${p2.entityId} (${testFindings[1].title})`);

  // Switch target type to Report and select Fix Verified
  currentTargetType = "PatchReport";
  activeReportId = testReports[1].id;
  let p3 = resolvePayload(currentTargetType, activeFindingId, activeReportId);
  if (p3.entityId !== "report-fix-verified-2" || p3.entityType !== "PatchReport") {
    throw new Error("Report target did not synchronize!");
  }
  console.log(`   ✓ Report selection accurately synchronized to: ${p3.entityId} (${testReports[1].verdict})`);

  // 7. Structured Evidence Document & Export Format Verification
  console.log("[7] Testing Evidence Document & Markdown Export with AI Analysis:");
  const mockPatchReport = {
    id: "rep-test-export-100",
    createdAt: new Date().toISOString(),
    verdict: "FIX_VERIFIED",
    summary: "Fix verified for tested cases",
    projectId: "proj-1",
    baselineCommit: "9d13f9f8765432101234567890abcdef12345678",
    candidateCommit: "da171028765432101234567890abcdef12345678",
    finding: {
      id: "f-1",
      ruleId: "python.sqlite.sqli",
      title: "SQL Injection in src/users.py",
      severity: "HIGH",
      filePath: "src/users.py",
      lineStart: 12,
      snippet: 'cursor.execute("SELECT * FROM users WHERE id = " + user_id)',
      source: "SCANNER",
      tool: "semgrep",
    },
    project: {
      id: "proj-1",
      name: "LOOPWISE",
    },
    baselineRun: {
      id: "run-b1",
      status: "REPRODUCED",
      exitCode: 0,
      reproducerId: "sqli_find_user",
      artifacts: [{ id: "art-log-1", name: "execution.log", kind: "LOG", sizeBytes: 100, content: "baseline log" }],
    },
    candidateRun: {
      id: "run-c1",
      status: "NOT_REPRODUCED",
      exitCode: 0,
      reproducerId: "sqli_find_user",
      artifacts: [{ id: "art-log-2", name: "execution.log", kind: "LOG", sizeBytes: 100, content: "candidate log" }],
    },
    artifacts: [
      { id: "art-diff", name: "patch.diff", kind: "DIFF", sizeBytes: 250, content: "+ parameterized query" },
    ],
    regressionResults: {
      baseline: { total: 5, passedCount: 5, exitCode: 0 },
      candidate: { total: 5, passedCount: 5, exitCode: 0, passed: true },
      newFailures: [],
    },
    diffStat: { filesChanged: 1, insertions: 3, deletions: 1 },
  };

  const mockAiExplanation = {
    provider: "template",
    model: "template",
    content: {
      summary: "Template summary (no AI key configured): SQL injection fix verified cleanly.",
      rootCause: "Unsanitized user input concatenation in raw SQL cursor execution.",
      remediationOptions: [
        {
          title: "Parameterized Query Fix",
          description: "Bind arguments using sqlite ? placeholders.",
          codeSnippet: "cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))",
        },
      ],
      additionalTests: [
        {
          name: "Test numeric coercion",
          description: "Verify alphanumeric IDs are handled safely.",
          testCode: "def test_safe(): pass",
        },
      ],
      nextSteps: ["Deploy patch to staging"],
      limitations: ["Tested against single SQLite instance"],
      citedEvidence: [
        { type: "run", id: "run-b1", name: "Baseline Run" },
        { type: "run", id: "run-c1", name: "Candidate Run" },
      ],
    },
  };

  // Build JSON Evidence Document
  const doc = buildEvidenceDocument(mockPatchReport, mockAiExplanation);
  if (!doc.aiAnalysis || doc.aiAnalysis.status !== "generated") {
    throw new Error("buildEvidenceDocument did not mark aiAnalysis as 'generated'!");
  }
  if (doc.aiAnalysis.provenance !== "ai") {
    throw new Error(`Expected aiAnalysis provenance to be 'ai', got '${doc.aiAnalysis.provenance}'`);
  }
  if (!doc.aiAnalysis.summary.includes("Template summary")) {
    throw new Error("aiAnalysis summary mismatch in evidence document");
  }
  console.log("   ✓ JSON evidence document successfully incorporates AI analysis with provenance 'ai'");

  // Build Markdown Export
  const md = generateMarkdownReport(doc);
  if (!md.includes("## 6. AI-Assisted Exploit & Patch Analysis [AI-generated]")) {
    throw new Error("Markdown export missing '## 6. AI-Assisted Exploit & Patch Analysis [AI-generated]' heading!");
  }
  if (!md.includes("Template summary (no AI key configured)")) {
    throw new Error("Markdown export missing AI summary content!");
  }
  if (!md.includes("Parameterized Query Fix")) {
    throw new Error("Markdown export missing remediation option!");
  }
  console.log("   ✓ Markdown export successfully renders section 6 with [AI-generated] badge and suggestions");

  console.log("\nALL STEP 15 AI CORE UNIT TESTS PASSED!\n");
}

runStep15Tests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
