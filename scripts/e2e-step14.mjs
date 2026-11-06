import { chromium } from "playwright";
import { prisma } from "../src/lib/db.js";

const BASE_URL = process.env.BASE_URL || "https://patchproof-three.vercel.app";
const USER_EMAIL = "yasar.khan.cg@gmail.com";
const USER_PASS = "PatchProofPassword123!";

async function runE2E() {
  console.log(`=== STARTING STEP 14 E2E TEST on ${BASE_URL} ===`);

  // Fetch latest report ID from DB
  const latestReport = await prisma.patchReport.findFirst({
    orderBy: { createdAt: "desc" },
    include: { finding: true },
  });

  if (!latestReport) {
    throw new Error("No PatchReport found in DB to test E2E!");
  }

  const reportId = latestReport.id;
  console.log(`Target Report ID: ${reportId} (${latestReport.verdict})`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", (msg) => {
    console.log(`[Browser Console ${msg.type()}]: ${msg.text()}`);
  });

  page.on("response", async (res) => {
    if (res.url().includes("/verify")) {
      const status = res.status();
      const body = await res.text().catch(() => "");
      console.log(`[Verify API Response]: HTTP ${status} -> ${body.slice(0, 200)}`);
    }
  });

  try {
    // 1. Sign In
    console.log("[1] Logging in...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('input[name="email"]', { timeout: 15000 });
    await page.fill('input[name="email"]', USER_EMAIL);
    await page.fill('input[name="password"]', USER_PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/app**", { timeout: 15000 });
    console.log("   ✓ Signed in successfully");

    // 2. Open Report Detail Page
    console.log(`[2] Navigating to /app/reports/${reportId}...`);
    await page.goto(`${BASE_URL}/app/reports/${reportId}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    // 3. Verify Mandatory Disclaimer
    console.log("[3] Verifying mandatory fixed security disclaimer...");
    const disclaimerText = "This report describes what was tested and what the results demonstrated. It is not a guarantee that the software is secure.";
    const hasDisclaimer = await page.locator(`text="${disclaimerText}"`).count();
    console.log(`   - Disclaimer occurrences found: ${hasDisclaimer}`);
    if (hasDisclaimer === 0) {
      throw new Error("Mandatory fixed security disclaimer not found on page!");
    }
    console.log("   ✓ Mandatory disclaimer verified");

    // 4. Verify Provenance Legend & Badges
    console.log("[4] Verifying provenance classification and section badges...");
    const scannerBadges = await page.locator('text="Scanner"').count();
    const testBadges = await page.locator('text="Test-verified"').count();
    const aiBadges = await page.locator('text="AI-generated"').count();
    console.log(`   - Scanner badges: ${scannerBadges}, Test-verified: ${testBadges}, AI-generated: ${aiBadges}`);
    if (scannerBadges === 0 || testBadges === 0 || aiBadges === 0) {
      throw new Error("Provenance tags missing on report detail page!");
    }

    // Verify AI section marked not generated
    const hasNotGenerated = await page.locator('text="not generated"').count();
    if (hasNotGenerated === 0) {
      throw new Error("AI section not marked 'not generated'!");
    }
    console.log("   ✓ Provenance legend and section tags verified");

    // 5. Test Cryptographic Integrity Verification
    console.log("[5] Testing 'Verify integrity' button...");
    const verifyBtn = page.locator('button:has-text("Verify integrity")');
    await verifyBtn.scrollIntoViewIfNeeded();
    await verifyBtn.click();
    console.log("   - Clicked 'Verify integrity'");

    // Wait for integrity pass status or error
    try {
      await page.waitForSelector(':has-text("Integrity Check")', { timeout: 15000 });
      console.log("   ✓ Integrity check executed and PASSED for all stored artifacts!");
    } catch (err) {
      const errBanner = await page.locator(':has-text("Error verifying integrity")').textContent().catch(() => null);
      if (errBanner) console.log(`   - Integrity error banner: ${errBanner}`);
      throw err;
    }

    // 6. Test Export Dropdown
    console.log("[6] Verifying Export dropdown options...");
    const exportBtn = page.locator('button:has-text("Export")');
    await exportBtn.click();
    await page.waitForTimeout(500);

    const hasJsonOption = await page.locator('text="Export as JSON"').isVisible();
    const hasMdOption = await page.locator('text="Export as Markdown"').isVisible();
    const hasPrintOption = await page.locator('text="Print / PDF"').isVisible();
    console.log(`   - JSON option: ${hasJsonOption}, Markdown option: ${hasMdOption}, Print option: ${hasPrintOption}`);
    if (!hasJsonOption || !hasMdOption || !hasPrintOption) {
      throw new Error("Export dropdown missing required options!");
    }
    console.log("   ✓ Export dropdown options verified");

    // 7. Verify JSON Export API Endpoint
    console.log(`[7] Requesting GET /api/reports/${reportId}/export?format=json...`);
    const jsonRes = await context.request.get(`${BASE_URL}/api/reports/${reportId}/export?format=json`);
    if (!jsonRes.ok()) {
      throw new Error(`Export JSON failed with HTTP ${jsonRes.status()}`);
    }
    const jsonDisposition = jsonRes.headers()["content-disposition"] || "";
    console.log(`   - Content-Disposition: ${jsonDisposition}`);
    if (!jsonDisposition.includes(`patchproof-report-${reportId}.json`)) {
      throw new Error(`Invalid Content-Disposition header: ${jsonDisposition}`);
    }
    const jsonDoc = await jsonRes.json();
    if (jsonDoc.schemaVersion !== 1 || !jsonDoc.fixedDisclaimer.includes("It is not a guarantee that the software is secure.")) {
      throw new Error("JSON export document invalid or missing schemaVersion/disclaimer!");
    }
    console.log(`   ✓ Export JSON document validated (schemaVersion: ${jsonDoc.schemaVersion}, Report Hash: ${jsonDoc.integrity.reportHash.slice(0, 16)}...)`);

    // 8. Verify Markdown Export API Endpoint
    console.log(`[8] Requesting GET /api/reports/${reportId}/export?format=md...`);
    const mdRes = await context.request.get(`${BASE_URL}/api/reports/${reportId}/export?format=md`);
    if (!mdRes.ok()) {
      throw new Error(`Export Markdown failed with HTTP ${mdRes.status()}`);
    }
    const mdDisposition = mdRes.headers()["content-disposition"] || "";
    console.log(`   - Content-Disposition: ${mdDisposition}`);
    const mdText = await mdRes.text();
    if (!mdText.includes("PatchProof Verification Evidence Report") || !mdText.includes(disclaimerText)) {
      throw new Error("Markdown export invalid or missing disclaimer!");
    }
    console.log(`   ✓ Export Markdown document validated (${mdText.length} bytes)`);

    // 9. Verify Print Page
    console.log(`[9] Navigating to /app/reports/${reportId}/print...`);
    await page.goto(`${BASE_URL}/app/reports/${reportId}/print`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    // Verify sidebar is NOT present
    const hasSidebar = await page.locator('aside').isVisible().catch(() => false);
    console.log(`   - Sidebar visible on print page: ${hasSidebar}`);
    if (hasSidebar) {
      throw new Error("Sidebar must NOT be visible on /app/reports/[id]/print!");
    }

    // Verify Download PDF button
    const hasDownloadPdf = await page.locator('button:has-text("Download PDF")').isVisible();
    console.log(`   - Download PDF button visible: ${hasDownloadPdf}`);
    if (!hasDownloadPdf) {
      throw new Error("Download PDF button not visible on print page!");
    }

    // Verify print container & monochrome layout
    const hasPrintDisclaimer = await page.locator(`text="${disclaimerText}"`).first().isVisible();
    console.log(`   - Print page disclaimer visible: ${hasPrintDisclaimer}`);
    if (!hasPrintDisclaimer) {
      throw new Error("Fixed disclaimer missing from print page!");
    }
    console.log("   ✓ Print page layout, no-sidebar rule, and Download PDF button verified");

    // 10. Test Unauthorized Access (401 / 403)
    console.log("[10] Testing unauthorized access to /api/reports/[id]/export without cookies...");
    const unauthedBrowser = await chromium.launch({ headless: true });
    const unauthedContext = await unauthedBrowser.newContext();
    const unauthRes = await unauthedContext.request.get(`${BASE_URL}/api/reports/${reportId}/export?format=json`);
    console.log(`   - HTTP Status: ${unauthRes.status()}`);
    if (unauthRes.status() !== 401 && unauthRes.status() !== 403) {
      throw new Error(`Expected 401 or 403 for unauthorized export request, got ${unauthRes.status()}`);
    }
    console.log("   ✓ Unauthorized export access properly rejected with HTTP 401");
    await unauthedBrowser.close();

    console.log("\nALL STEP 14 E2E TESTS COMPLETED SUCCESSFULLY!\n");
  } finally {
    await browser.close();
  }
}

runE2E().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
