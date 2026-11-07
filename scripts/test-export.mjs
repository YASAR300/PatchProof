import { PrismaClient } from "@prisma/client";
import { buildEvidenceDocument, generateMarkdownReport } from "../src/lib/report.js";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

async function main() {
  const reportId = "cmw549dpr001vfd6cg4ycn2bo";
  const report = await prisma.patchReport.findUnique({
    where: { id: reportId },
    include: {
      project: true,
      finding: true,
      baselineRun: { include: { artifacts: true } },
      candidateRun: { include: { artifacts: true } },
      artifacts: true,
      decisions: true,
    },
  });

  if (!report) {
    console.error("Report not found:", reportId);
    process.exit(1);
  }

  const aiExplanation = await prisma.aiExplanation.findFirst({
    where: { entityType: "PatchReport", entityId: reportId },
    orderBy: { createdAt: "desc" },
  });

  console.log("Found report:", report.id, "Verdict:", report.verdict);
  console.log("Found AI Explanation:", aiExplanation ? `yes (${aiExplanation.provider})` : "none");

  const doc = buildEvidenceDocument(report, aiExplanation);
  const jsonExport = JSON.stringify(doc, null, 2);
  const mdExport = generateMarkdownReport(doc);

  const outDir = path.resolve("./scratch-exports");
  fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, `patchproof-report-${reportId}.json`);
  const mdPath = path.join(outDir, `patchproof-report-${reportId}.md`);

  fs.writeFileSync(jsonPath, jsonExport, "utf8");
  fs.writeFileSync(mdPath, mdExport, "utf8");

  console.log("Saved JSON to:", jsonPath, "Size:", jsonExport.length, "bytes");
  console.log("Saved MD to:", mdPath, "Size:", mdExport.length, "bytes");

  // Verify contents
  const parsedJson = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  console.log("Parsed JSON integrity hash:", parsedJson.integrity?.reportHash);
  console.log("Parsed JSON AI status:", parsedJson.aiAnalysis?.status);

  const readMd = fs.readFileSync(mdPath, "utf8");
  console.log("MD contains Section 6:", readMd.includes("## 6. AI-Assisted Exploit & Patch Analysis"));
  console.log("MD contains Mandatory disclaimer:", readMd.includes(doc.fixedDisclaimer));
}

main().catch(console.error).finally(() => prisma.$disconnect());
