import { prisma } from "../src/lib/db.js";
import {
  buildEvidenceDocument,
  verifyReportIntegrity,
  generateMarkdownReport,
  FIXED_SECURITY_DISCLAIMER,
  extractLogExcerpt,
  canonicalJsonStringify,
  computeSha256,
} from "../src/lib/report.js";

async function runVerification() {
  console.log("=== STEP 14 VERIFICATION ENGINE TEST ===");

  // 1. Fetch latest PatchReport from DB
  const report = await prisma.patchReport.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      finding: true,
      project: true,
      baselineRun: {
        include: { artifacts: true },
      },
      candidateRun: {
        include: { artifacts: true },
      },
      artifacts: true,
      decisions: true,
    },
  });

  if (!report) {
    throw new Error("No PatchReport found in database to test!");
  }

  console.log(`[1] Found PatchReport: ${report.id} (${report.verdict})`);

  // 2. Build Evidence Document
  const doc = buildEvidenceDocument(report);
  console.log(`[2] Built Evidence Document: schemaVersion=${doc.schemaVersion}`);

  // Assertions on schemaVersion and fixed disclaimer
  if (doc.schemaVersion !== 1) {
    throw new Error(`Expected schemaVersion 1, got ${doc.schemaVersion}`);
  }
  if (doc.fixedDisclaimer !== FIXED_SECURITY_DISCLAIMER) {
    throw new Error(`Fixed disclaimer mismatch!`);
  }
  if (!doc.fixedDisclaimer.includes("This report describes what was tested and what the results demonstrated. It is not a guarantee that the software is secure.")) {
    throw new Error("Mandatory disclaimer text missing from doc.fixedDisclaimer");
  }

  // Assertions on provenance tags
  console.log(`[3] Checking provenance tags:`);
  console.log(`   - project: ${doc.project.provenance}`);
  console.log(`   - finding: ${doc.finding.provenance}`);
  console.log(`   - commits: ${doc.commits.provenance}`);
  console.log(`   - environment: ${doc.environment.provenance}`);
  console.log(`   - tests: ${doc.tests.provenance}`);
  console.log(`   - resultsMatrix: ${doc.resultsMatrix.provenance}`);
  console.log(`   - regressions: ${doc.regressions.provenance}`);
  console.log(`   - diff: ${doc.diff.provenance}`);
  console.log(`   - logs: ${doc.logs.provenance}`);
  console.log(`   - aiAnalysis: ${doc.aiAnalysis.provenance} (status: ${doc.aiAnalysis.status})`);
  console.log(`   - limitations: ${doc.limitations.provenance}`);
  console.log(`   - reproduction: ${doc.reproduction.provenance}`);

  if (doc.finding.provenance !== "scanner") throw new Error("finding provenance must be scanner");
  if (doc.diff.provenance !== "test") throw new Error("diff provenance must be test");
  if (doc.aiAnalysis.provenance !== "ai" || doc.aiAnalysis.status !== "not generated") {
    throw new Error("aiAnalysis must be marked provenance 'ai' and status 'not generated'");
  }

  // Check log excerpts
  console.log(`[4] Checking log excerpts:`);
  console.log(`   - baselineRun total lines: ${doc.logs.baselineRun.excerpt?.totalLines}`);
  console.log(`   - candidateRun total lines: ${doc.logs.candidateRun.excerpt?.totalLines}`);
  if (typeof doc.logs.baselineRun.excerpt?.text !== "string") {
    throw new Error("baselineRun log excerpt missing text");
  }

  // Test excerpt helper explicitly with > 80 lines
  const dummyLongLog = Array.from({ length: 120 }, (_, i) => `Line ${i + 1}: log entry`).join("\n");
  const dummyExcerpt = extractLogExcerpt(dummyLongLog, 40);
  if (dummyExcerpt.firstLines.length !== 40 || dummyExcerpt.lastLines.length !== 40) {
    throw new Error(`Excerpt lines count incorrect: first=${dummyExcerpt.firstLines.length}, last=${dummyExcerpt.lastLines.length}`);
  }
  if (!dummyExcerpt.text.includes("40 lines omitted")) {
    throw new Error("Omitted lines notice missing in excerpt");
  }
  console.log("   - Log excerpt function handles long logs (>80 lines) correctly.");

  // 3. Cryptographic Hashes & Integrity Check
  console.log(`[5] Verifying canonical report hash and stored artifact integrity:`);
  console.log(`   - Canonical Report Hash (SHA-256): ${doc.integrity.reportHash}`);
  console.log(`   - Total artifacts in report: ${doc.integrity.artifactsCount}`);

  const integrity = verifyReportIntegrity(report);
  console.log(`   - Integrity valid: ${integrity.valid}`);
  console.log(`   - Artifacts verified: ${integrity.verifiedCount} / ${integrity.totalCount}`);

  for (const art of integrity.artifacts) {
    console.log(`     * ${art.name} (${art.kind}): ${art.valid ? "PASS" : "FAIL"} (${art.storedSha256.slice(0, 12)}...)`);
    if (!art.valid) {
      throw new Error(`Artifact hash verification failed for: ${art.name}`);
    }
  }

  if (!integrity.valid) {
    throw new Error("verifyReportIntegrity returned valid=false!");
  }

  // 4. Test Markdown Generation
  console.log(`[6] Testing Markdown generation:`);
  const markdown = generateMarkdownReport(doc);
  if (!markdown.includes(FIXED_SECURITY_DISCLAIMER)) {
    throw new Error("Markdown export missing fixed disclaimer");
  }
  if (!markdown.includes("Verification Matrix [Test-verified]")) {
    throw new Error("Markdown export missing Verification Matrix header");
  }
  if (!markdown.includes("AI-Assisted Exploit & Patch Analysis [AI-generated]")) {
    throw new Error("Markdown export missing AI Analysis section");
  }
  if (!markdown.includes("Cryptographic Evidence Hashes [Test-verified]")) {
    throw new Error("Markdown export missing Cryptographic Hashes section");
  }
  console.log(`   - Markdown report generated cleanly (${markdown.length} characters)`);

  console.log("\nALL STEP 14 VERIFICATION ENGINE TESTS PASSED!\n");
  process.exit(0);
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
