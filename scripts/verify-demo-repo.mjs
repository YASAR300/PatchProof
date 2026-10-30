import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const manifestPath = path.resolve(rootDir, "demo-manifest.json");
if (!fs.existsSync(manifestPath)) {
  console.error(`[demo:check] demo-manifest.json not found at ${manifestPath}. Run 'npm run demo:build' first.`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
const DEMO_REPO_PATH = process.env.DEMO_REPO_PATH
  ? path.resolve(process.env.DEMO_REPO_PATH)
  : path.resolve(rootDir, ".data", "demo-target");

if (!fs.existsSync(DEMO_REPO_PATH)) {
  console.error(`[demo:check] Demo repo not found at ${DEMO_REPO_PATH}. Run 'npm run demo:build' first.`);
  process.exit(1);
}

// Find Python binary (python or python3)
let pythonCmd = "python";
try {
  execSync("python --version", { stdio: "ignore" });
} catch {
  try {
    execSync("python3 --version", { stdio: "ignore" });
    pythonCmd = "python3";
  } catch {
    console.error("[demo:check] Neither 'python' nor 'python3' was found on PATH.");
    process.exit(1);
  }
}

console.log(`[demo:check] Verifying demo repo at: ${DEMO_REPO_PATH}`);
console.log(`[demo:check] Using Python runtime: ${pythonCmd}\n`);

function git(cmd) {
  return execSync(`git ${cmd}`, {
    cwd: DEMO_REPO_PATH,
    stdio: "pipe",
  }).toString().trim();
}

function runCommand(commandStr) {
  try {
    const stdout = execSync(commandStr, {
      cwd: DEMO_REPO_PATH,
      stdio: "pipe",
    }).toString();
    return { exitCode: 0, stdout, stderr: "" };
  } catch (err) {
    return {
      exitCode: err.status || 1,
      stdout: err.stdout ? err.stdout.toString() : "",
      stderr: err.stderr ? err.stderr.toString() : "",
    };
  }
}

const results = [];
let allPassed = true;

for (const tag of manifest.tags) {
  // 1. Checkout tag
  git(`checkout ${tag.name}`);

  // 2. Run reproducer
  const reproCmd = `${pythonCmd} ${tag.name === "broken-build" ? manifest.reproducerPath : manifest.reproducerPath}`;
  const reproRes = runCommand(reproCmd);

  let actualReproduced = false;
  let oracleContract = null;

  if (reproRes.exitCode === 0) {
    const lines = reproRes.stdout.trim().split("\n");
    const lastLine = lines[lines.length - 1].trim();
    try {
      oracleContract = JSON.parse(lastLine);
      actualReproduced = Boolean(oracleContract.reproduced);
    } catch {
      actualReproduced = false;
    }
  }

  // 3. Run regression tests
  const regCmd = `${pythonCmd} -m unittest discover tests`;
  const regRes = runCommand(regCmd);
  const actualRegPassed = regRes.exitCode === 0;

  // 4. Validate against expected outcome
  const exp = tag.expectedOutcome;
  const matchRepro =
    actualReproduced === exp.reproduced && reproRes.exitCode === exp.reproducerExitCode;
  const matchReg =
    actualRegPassed === exp.regressionPassed && regRes.exitCode === exp.regressionExitCode;
  const tagPassed = matchRepro && matchReg;

  if (!tagPassed) {
    allPassed = false;
  }

  results.push({
    tag: tag.name,
    sha: tag.sha.slice(0, 7),
    description: tag.description,
    reproduced: actualReproduced,
    reproExit: reproRes.exitCode,
    expReproduced: exp.reproduced,
    expReproExit: exp.reproducerExitCode,
    regPassed: actualRegPassed,
    regExit: regRes.exitCode,
    expRegPassed: exp.regressionPassed,
    expRegExit: exp.regressionExitCode,
    match: tagPassed,
  });
}

// Return repo to baseline
git("checkout baseline");

// Print Formatted Comparison Table
console.log("=".repeat(92));
console.log(
  `| ${"Tag".padEnd(16)} | ${"SHA".padEnd(7)} | ${"Reproduced (Exp/Act)".padEnd(22)} | ${"Regression (Exp/Act)".padEnd(22)} | ${"Status".padEnd(8)} |`
);
console.log("=".repeat(92));

for (const r of results) {
  const reproStr = `${r.expReproduced ? "YES" : "NO"} (${r.expReproExit}) / ${r.reproduced ? "YES" : "NO"} (${r.reproExit})`;
  const regStr = `${r.expRegPassed ? "PASS" : "FAIL"} (${r.expRegExit}) / ${r.regPassed ? "PASS" : "FAIL"} (${r.regExit})`;
  const statusStr = r.match ? "PASS" : "FAIL";

  console.log(
    `| ${r.tag.padEnd(16)} | ${r.sha.padEnd(7)} | ${reproStr.padEnd(22)} | ${regStr.padEnd(22)} | ${statusStr.padEnd(8)} |`
  );
}

console.log("=".repeat(92));

if (allPassed) {
  console.log("\n[demo:check] SUCCESS: All 5 tags match expected reproduction & regression outcomes exactly.\n");
  process.exit(0);
} else {
  console.error("\n[demo:check] FAILURE: One or more tags did not match expected outcomes.\n");
  process.exit(1);
}

