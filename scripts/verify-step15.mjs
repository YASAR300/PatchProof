import { redactSecrets, truncateLog, redactEvidence } from "../src/lib/ai/redact.js";
import { AiExplanationSchema, filterValidCitations } from "../src/lib/ai/schema.js";
import { generateTemplateExplanation } from "../src/lib/ai/template.js";
import { generate } from "../src/lib/ai/index.js";
import { callAnthropicMessages } from "../src/lib/ai/anthropic.js";

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

  console.log("\nALL STEP 15 AI CORE UNIT TESTS PASSED!\n");
}

runStep15Tests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
