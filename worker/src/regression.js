import { runInSandbox } from "./sandbox.js";

/**
 * Parses Python unittest verbose (-v) output.
 * Extracts individual test names, modules, statuses (ok, FAIL, ERROR, skipped),
 * and tracebacks/failure reasons.
 *
 * @param {string} stdout
 * @param {string} stderr
 * @param {number} exitCode
 * @returns {object} Structured regression results
 */
export function parseUnittestOutput(stdout = "", stderr = "", exitCode = 0) {
  const combined = `${stdout}\n${stderr}`;
  const lines = combined.split(/\r?\n/);

  const tests = [];
  const testMap = new Map();

  // Pattern 1: test_apostrophe_name_obrien_works (test_users.TestUsers.test_apostrophe_name_obrien_works) ... ok/FAIL/ERROR
  const testLineRegex = /^\s*([a-zA-Z0-9_]+)\s+\(([^)]+)\)\s+\.\.\.\s+(ok|FAIL|ERROR|skipped)/;

  for (const line of lines) {
    const match = line.match(testLineRegex);
    if (match) {
      const name = match[1];
      const testId = match[2];
      const status = match[3];

      const item = {
        name,
        testId,
        status,
        error: null,
      };
      tests.push(item);
      testMap.set(name, item);
      testMap.set(testId, item);
    }
  }

  // Parse failure / error tracebacks
  // Format:
  // ======================================================================
  // FAIL/ERROR: test_name (test_id)
  // ----------------------------------------------------------------------
  // Traceback ...
  // AssertionError: ...
  const failureHeaderRegex = /^(?:FAIL|ERROR):\s+([a-zA-Z0-9_]+)\s+\(([^)]+)\)/;
  let currentFailureName = null;
  let currentTraceback = [];
  let inTraceback = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const failMatch = line.match(failureHeaderRegex);
    if (failMatch) {
      if (currentFailureName && testMap.has(currentFailureName)) {
        testMap.get(currentFailureName).error = currentTraceback.join("\n").trim();
      }
      currentFailureName = failMatch[1];
      currentTraceback = [];
      inTraceback = true;
      continue;
    }

    if (inTraceback) {
      if (line.startsWith("----------------------------------------------------------------------") ||
          line.startsWith("======================================================================") ||
          line.startsWith("FAILED (") ||
          line.startsWith("OK")) {
        if (currentFailureName && testMap.has(currentFailureName)) {
          testMap.get(currentFailureName).error = currentTraceback.join("\n").trim();
        }
        currentFailureName = null;
        inTraceback = false;
      } else {
        currentTraceback.push(line);
      }
    }
  }

  if (currentFailureName && testMap.has(currentFailureName)) {
    testMap.get(currentFailureName).error = currentTraceback.join("\n").trim();
  }

  // Detect syntax errors, broken imports, or catastrophic load failures
  const hasSyntaxError = /SyntaxError:/.test(combined);
  const hasImportError = /ImportError:|ModuleNotFoundError:/.test(combined);
  const hasLoaderFailedTest = /unittest\.loader\._FailedTest/.test(combined);

  const hasExecutionError = Boolean(
    hasSyntaxError ||
      hasImportError ||
      hasLoaderFailedTest ||
      (exitCode !== 0 && tests.length === 0)
  );

  const total = tests.length;
  const passedCount = tests.filter((t) => t.status === "ok").length;
  const failedCount = tests.filter((t) => t.status === "FAIL" || t.status === "ERROR").length;
  const passed = exitCode === 0 && !hasExecutionError && failedCount === 0 && total > 0;

  return {
    passed,
    exitCode,
    total,
    passedCount,
    failedCount,
    hasExecutionError,
    tests,
    rawOutput: combined,
  };
}

/**
 * Computes regressions between baseline and candidate test suites.
 * A regression counts ONLY if a test passed on the baseline but fails on the candidate.
 *
 * @param {object} baselineResults
 * @param {object} candidateResults
 * @returns {Array<{ name: string, status: string, error?: string }>}
 */
export function computeRegressions(baselineResults, candidateResults) {
  const baselinePassed = new Set(
    (baselineResults?.tests || [])
      .filter((t) => t.status === "ok")
      .map((t) => t.name)
  );

  const newFailures = [];

  for (const candTest of candidateResults?.tests || []) {
    if (candTest.status !== "ok" && baselinePassed.has(candTest.name)) {
      newFailures.push({
        name: candTest.name,
        testId: candTest.testId,
        status: candTest.status,
        error: candTest.error || "Test failed during regression suite execution.",
      });
    }
  }

  return newFailures;
}

/**
 * Executes the regression test suite inside the container/process sandbox.
 *
 * @param {object} params
 * @param {Buffer} params.archiveBuffer - Source archive buffer for the commit
 * @param {string|string[]} [params.command] - Command array or string
 * @param {number} [params.timeoutMs=30000] - Timeout in milliseconds
 * @returns {Promise<object>} Parsed regression result
 */
export async function runRegressionSuite({
  archiveBuffer,
  command = ["python", "-m", "unittest", "discover", "-v", "tests"],
  timeoutMs = 30000,
}) {
  const sandboxResult = await runInSandbox({
    image: "patchproof-sandbox-python",
    archiveBuffer,
    command: Array.isArray(command) ? command : command.trim().split(/\s+/),
    timeoutMs,
    memoryMb: 512,
    cpus: 1.0,
    pidsLimit: 64,
  });

  const parsed = parseUnittestOutput(sandboxResult.stdout, sandboxResult.stderr, sandboxResult.exitCode);

  return {
    ...parsed,
    stdout: sandboxResult.stdout,
    stderr: sandboxResult.stderr,
    durationMs: sandboxResult.durationMs,
    timedOut: sandboxResult.timedOut,
    oomKilled: sandboxResult.oomKilled,
  };
}

