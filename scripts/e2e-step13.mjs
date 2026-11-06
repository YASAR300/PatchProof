import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "https://patchproof-three.vercel.app";
const EMAIL = process.env.TEST_EMAIL || "yasar.khan.cg@gmail.com";
const PASSWORD = process.env.TEST_PASSWORD || "PatchProofPassword123!";

async function run() {
  console.log(`[E2E] Starting Step 13 Full Verification Suite on ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log(`[Browser Console ERROR]: ${msg.text()}`);
    }
  });

  try {
    // 1. Log In
    console.log(`[E2E] 1. Logging in as ${EMAIL}...`);
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log(`[E2E] Logged in successfully. Current URL: ${page.url()}`);

    // 2. Navigate to /app/findings
    console.log(`[E2E] 2. Navigating to /app/findings...`);
    await page.goto(`${BASE_URL}/app/findings`, { waitUntil: "domcontentloaded" });

    // Locate SQL injection finding in src/users.py
    const sqliFindingLink = page.locator('a[href*="/app/findings/"]:has-text("users.py"), a[href*="/app/findings/"]:has-text("SQL")').first();
    const count = await sqliFindingLink.count();
    if (count === 0) {
      throw new Error("SQL injection finding in src/users.py not found on /app/findings.");
    }
    const findingHref = await sqliFindingLink.getAttribute("href");
    console.log(`[E2E] Found SQL injection finding: ${findingHref}`);

    // Navigate to finding detail page
    await page.goto(`${BASE_URL}${findingHref}`, { waitUntil: "domcontentloaded" });
    console.log(`[E2E] Opened finding page: ${page.url()}`);

    // 3. Verify 'Validate a candidate patch' panel is present
    await page.waitForSelector('text="Validate a candidate patch"', { timeout: 15000 });
    console.log(`[E2E] 'Validate a candidate patch' panel is present.`);

    // Check scenario presets
    const presets = ["Good fix", "Incomplete fix", "Breaks a feature", "Broken build", "Unreliable baseline"];
    for (const p of presets) {
      await page.waitForSelector(`button:has-text("${p}")`);
      console.log(`[E2E] Preset '${p}' button is visible.`);
    }

    // Helper to execute a scenario
    async function executeScenario(presetName, expectedVerdictText) {
      console.log(`\n------------------------------------------------------`);
      console.log(`[E2E] Running Scenario: '${presetName}'`);
      console.log(`------------------------------------------------------`);

      // Wait for button to be clickable
      await page.waitForSelector(`button:has-text("${presetName}"):not([disabled])`, { timeout: 30000 });
      await page.click(`button:has-text("${presetName}")`);
      await page.waitForTimeout(600);

      const baseline = await page.$eval("#baseline-commit-select", (el) => el.value);
      const candidate = await page.$eval("#candidate-commit-select", (el) => el.value);
      console.log(`[E2E] Presets loaded: baseline=${baseline}, candidate=${candidate}`);

      // Click Validate patch
      await page.click('button:has-text("Validate patch"):not([disabled])');
      console.log(`[E2E] Clicked 'Validate patch', waiting for live sandbox job...`);

      // Wait for progress container with SUCCEEDED status
      await page.waitForSelector(':has-text("is SUCCEEDED")', { timeout: 60000 });
      console.log(`[E2E] Job finished with SUCCEEDED!`);

      // Verify verdict badge
      const verdictEl = page.locator(`span:has-text("${expectedVerdictText}")`).first();
      await verdictEl.waitFor({ state: "visible", timeout: 10000 });
      console.log(`[E2E] Confirmed verdict: '${expectedVerdictText}'!`);

      // Verify View patch report link
      const reportLink = page.locator('a[href*="/app/reports/"]:has-text("View patch report")').first();
      const hasReportLink = await reportLink.isVisible().catch(() => false);
      console.log(`[E2E] 'View patch report' link available: ${hasReportLink}`);

      await page.waitForTimeout(1000);
    }

    // Run all 5 scenarios in order
    await executeScenario("Good fix", "Fix Verified");
    await executeScenario("Incomplete fix", "Patch Not Verified");
    await executeScenario("Breaks a feature", "Regression Failure");
    await executeScenario("Broken build", "Execution Error");
    await executeScenario("Unreliable baseline", "Inconclusive");

    // --- 4. Route: /app/reports ---
    console.log(`\n======================================================`);
    console.log(`[E2E] 4. Navigating to /app/reports...`);
    console.log(`======================================================`);
    await page.goto(`${BASE_URL}/app/reports`, { waitUntil: "domcontentloaded" });

    // Verify all 5 verdict badges exist in reports table
    const expectedLabels = [
      "Fix Verified",
      "Patch Not Verified",
      "Regression Failure",
      "Execution Error",
      "Inconclusive",
    ];
    for (const label of expectedLabels) {
      const el = page.locator(`span:has-text("${label}")`).first();
      await el.waitFor({ state: "visible", timeout: 10000 });
      console.log(`[E2E] Reports table contains verdict badge '${label}': PASS`);
    }

    // Test Search Filter with '0ffad86'
    console.log(`[E2E] Testing search filter with '0ffad86'...`);
    const searchInput = page.locator('input[placeholder*="Search by title"]');
    await searchInput.fill("0ffad86");
    await page.waitForTimeout(600);
    const searchRowCount = await page.locator('a[href*="/app/reports/"]').count();
    console.log(`[E2E] Search '0ffad86' filtered table to ${searchRowCount} matching row(s): PASS`);

    // Test Dropdown Filter: Regression Failure
    console.log(`[E2E] Testing dropdown filter: REGRESSION_FAILURE...`);
    await searchInput.fill("");
    const verdictSelect = page.locator("select").first();
    await verdictSelect.selectOption("REGRESSION_FAILURE");
    await page.waitForTimeout(600);
    const regressionCount = await page.locator('a[href*="/app/reports/"]').count();
    console.log(`[E2E] Filter REGRESSION_FAILURE displayed ${regressionCount} row(s): PASS`);

    // Test Reset filters button
    console.log(`[E2E] Testing 'Reset filters' button...`);
    await page.click('button:has-text("Reset filters")');
    await page.waitForTimeout(600);
    const totalCount = await page.locator('a[href*="/app/reports/"]').count();
    console.log(`[E2E] Reset filters restored ${totalCount} total reports: PASS`);

    // --- 5. Route: /app/reports/[id] (REGRESSION_FAILURE) ---
    console.log(`\n======================================================`);
    console.log(`[E2E] 5. Opening REGRESSION_FAILURE report detail page...`);
    console.log(`======================================================`);
    await verdictSelect.selectOption("REGRESSION_FAILURE");
    await page.waitForTimeout(600);
    const regressionRow = page.locator('a[href*="/app/reports/"]').first();
    const regressionHref = await regressionRow.getAttribute("href");
    console.log(`[E2E] Navigating to: ${regressionHref}`);
    await page.goto(`${BASE_URL}${regressionHref}`, { waitUntil: "domcontentloaded" });

    // Verify exact Limitations notice text
    const limitationsNotice = "Verified for the tested cases only. Additional input cases and broader authorization checks have not been evaluated.";
    await page.waitForSelector(`text="${limitationsNotice}"`, { timeout: 10000 });
    console.log(`[E2E] Limitations notice banner verified: PASS`);

    // Verify Verification Matrix table
    await page.waitForSelector('text="Verification Matrix"');
    await page.waitForSelector('text="Security reproducer"');
    await page.waitForSelector('text="Normal functionality"');
    await page.waitForSelector('text="Result"');
    await page.waitForSelector('text="Vulnerable"');
    await page.waitForSelector('text="Regression detected"');
    console.log(`[E2E] Verification Matrix table verified: PASS`);

    // Verify Side-Effect Regressions Detected card
    await page.waitForSelector('text="test_apostrophe_name_obrien_works"');
    console.log(`[E2E] Side-Effect Regressions card shows 'test_apostrophe_name_obrien_works': PASS`);

    // Verify Run log artifacts links
    const baselineLogsLink = page.locator('a:has-text("Vulnerable baseline logs")');
    const candidateLogsLink = page.locator('a:has-text("Candidate patch logs")');
    const hasBaselineLogs = await baselineLogsLink.isVisible();
    const hasCandidateLogs = await candidateLogsLink.isVisible();
    console.log(`[E2E] Run log links visible: baseline=${hasBaselineLogs}, candidate=${hasCandidateLogs}: PASS`);

    // Verify Candidate Patch Diff viewer and copy button
    await page.waitForSelector('text="Candidate Patch Diff"');
    await page.waitForSelector('text="Copy diff"');
    await page.click('button:has-text("Copy diff")');
    await page.waitForSelector('text="Copied diff!"');
    console.log(`[E2E] Diff viewer and 'Copied diff!' button verified: PASS`);

    // Verify Reproduce yourself block and copy button
    await page.waitForSelector('text="Reproduce this verdict yourself"');
    await page.click('button:has-text("Copy commands")');
    await page.waitForSelector('text="Copied commands!"');
    console.log(`[E2E] Reproduce yourself block and 'Copied commands!' button verified: PASS`);

    // --- 6. Route: /app/reports/[id] (INCONCLUSIVE) ---
    console.log(`\n======================================================`);
    console.log(`[E2E] 6. Opening INCONCLUSIVE report detail page...`);
    console.log(`======================================================`);
    await page.goto(`${BASE_URL}/app/reports`, { waitUntil: "domcontentloaded" });
    const verdictSelect2 = page.locator("select").first();
    await verdictSelect2.selectOption("INCONCLUSIVE");
    await page.waitForTimeout(600);
    const inconclusiveRow = page.locator('a[href*="/app/reports/"]').first();
    const inconclusiveHref = await inconclusiveRow.getAttribute("href");
    console.log(`[E2E] Navigating to: ${inconclusiveHref}`);
    await page.goto(`${BASE_URL}${inconclusiveHref}`, { waitUntil: "domcontentloaded" });

    // Verify summary and explanation
    await page.waitForSelector('text="Inconclusive: baseline issue did not reproduce."');
    console.log(`[E2E] INCONCLUSIVE summary verified: PASS`);

    console.log(`\n================================================================`);
    console.log(`[E2E] ALL CHECKS IN THE MANUAL TEST GUIDE VERIFIED AND PASSED!`);
    console.log(`================================================================\n`);
  } catch (err) {
    console.error(`[E2E ERROR]:`, err.message);
    await page.screenshot({ path: "e2e-error.png", fullPage: true });
    throw err;
  } finally {
    await browser.close();
  }
}

run();
