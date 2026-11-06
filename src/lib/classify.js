/**
 * Pure classification logic for vulnerability verification runs.
 * Follows the deterministic oracle contract.
 */

/**
 * Extracts and parses the final JSON assertion line emitted by an oracle reproducer script.
 * Expects format: {"reproduced": boolean, "precondition_ok": boolean, "reason"?: string}
 *
 * @param {string} stdout - Process stdout text
 * @returns {{ assertion: { reproduced: boolean, precondition_ok: boolean, reason?: string } | null, parseError: boolean }}
 */
export function parseOracleOutput(stdout) {
  if (!stdout || typeof stdout !== "string") {
    return { assertion: null, parseError: true };
  }

  const lines = stdout
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Scan lines backwards to find the final JSON assertion object
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.startsWith("{") && line.endsWith("}")) {
      try {
        const parsed = JSON.parse(line);
        if (typeof parsed === "object" && parsed !== null && "reproduced" in parsed) {
          return {
            assertion: {
              reproduced: Boolean(parsed.reproduced),
              precondition_ok: parsed.precondition_ok !== undefined ? Boolean(parsed.precondition_ok) : true,
              reason: typeof parsed.reason === "string" ? parsed.reason : "",
            },
            parseError: false,
          };
        }
      } catch {
        // Continue searching upward
      }
    }
  }

  return { assertion: null, parseError: true };
}

/**
 * Classifies an array of execution runs (typically 3 iterations) into a deterministic VerificationStatus:
 * - REPRODUCED: all runs exit 0 and report reproduced: true with precondition_ok: true.
 * - NOT_REPRODUCED: all runs exit 0 and report reproduced: false with precondition_ok: true.
 * - INCONCLUSIVE: precondition_ok is false, the results disagree between runs (flaky), or the final JSON line is missing/unparsable.
 * - EXECUTION_ERROR: the build or setup fails, the exit code is non-zero, the run timed out or was OOM-killed.
 *
 * @param {Array<{
 *   exitCode: number,
 *   stdout?: string,
 *   stderr?: string,
 *   timedOut?: boolean,
 *   oomKilled?: boolean,
 *   setupFailed?: boolean,
 *   assertion?: { reproduced: boolean, precondition_ok: boolean, reason?: string } | null,
 *   parseError?: boolean
 * }>} runs
 * @returns {{
 *   status: "REPRODUCED" | "NOT_REPRODUCED" | "INCONCLUSIVE" | "EXECUTION_ERROR",
 *   reason: string,
 *   summary: string,
 *   reproduced: boolean,
 *   precondition_ok: boolean,
 *   flaky: boolean,
 *   runsAnalyzed: number
 * }}
 */
export function classifyRuns(runs = []) {
  if (!Array.isArray(runs) || runs.length === 0) {
    return {
      status: "EXECUTION_ERROR",
      reason: "No execution runs provided for verification classification.",
      summary: "Execution failed: zero runs recorded.",
      reproduced: false,
      precondition_ok: false,
      flaky: false,
      runsAnalyzed: 0,
    };
  }

  // 1. Check for EXECUTION_ERROR
  // Non-zero exit code, timeout, OOM kill, or setup failure in ANY run
  for (let i = 0; i < runs.length; i++) {
    const r = runs[i];
    if (r.setupFailed) {
      return {
        status: "EXECUTION_ERROR",
        reason: `Run ${i + 1} failed during sandbox environment setup.`,
        summary: `Setup error in sandbox run ${i + 1}.`,
        reproduced: false,
        precondition_ok: false,
        flaky: false,
        runsAnalyzed: runs.length,
      };
    }
    if (r.timedOut) {
      return {
        status: "EXECUTION_ERROR",
        reason: `Run ${i + 1} timed out exceeding sandbox execution boundary.`,
        summary: `Process timed out in run ${i + 1}.`,
        reproduced: false,
        precondition_ok: false,
        flaky: false,
        runsAnalyzed: runs.length,
      };
    }
    if (r.oomKilled) {
      return {
        status: "EXECUTION_ERROR",
        reason: `Run ${i + 1} was terminated due to memory boundary exhaustion (OOM).`,
        summary: `Out of memory in run ${i + 1}.`,
        reproduced: false,
        precondition_ok: false,
        flaky: false,
        runsAnalyzed: runs.length,
      };
    }
    if (r.exitCode !== 0) {
      return {
        status: "EXECUTION_ERROR",
        reason: `Run ${i + 1} exited with non-zero status code (${r.exitCode}).`,
        summary: `Non-zero exit code (${r.exitCode}) in run ${i + 1}: ${r.stderr?.trim() || "Process error"}`,
        reproduced: false,
        precondition_ok: false,
        flaky: false,
        runsAnalyzed: runs.length,
      };
    }
  }

  // 2. Parse oracle assertion for each run if not already parsed
  const parsedRuns = runs.map((r) => {
    if (r.assertion !== undefined && r.parseError !== undefined) {
      return { assertion: r.assertion, parseError: r.parseError };
    }
    return parseOracleOutput(r.stdout || "");
  });

  // 3. Check for missing/unparsable JSON or precondition_ok === false
  for (let i = 0; i < parsedRuns.length; i++) {
    const { assertion, parseError } = parsedRuns[i];
    if (parseError || !assertion) {
      return {
        status: "INCONCLUSIVE",
        reason: `Final oracle JSON assertion line was missing or unparsable in run ${i + 1}.`,
        summary: "Inconclusive: oracle did not emit a valid JSON verdict.",
        reproduced: false,
        precondition_ok: false,
        flaky: false,
        runsAnalyzed: runs.length,
      };
    }

    if (assertion.precondition_ok === false) {
      return {
        status: "INCONCLUSIVE",
        reason: `Precondition check failed in run ${i + 1}: ${assertion.reason || "environment precondition not met"}`,
        summary: `Inconclusive: precondition failed (${assertion.reason || "prerequisites not met"}).`,
        reproduced: false,
        precondition_ok: false,
        flaky: false,
        runsAnalyzed: runs.length,
      };
    }
  }

  // 4. Check for disagreement between runs (flaky)
  const firstVerdict = parsedRuns[0].assertion.reproduced;
  const isFlaky = parsedRuns.some((r) => r.assertion.reproduced !== firstVerdict);

  if (isFlaky) {
    return {
      status: "INCONCLUSIVE",
      reason: "Disagreement between verification iterations: reproducer output was flaky.",
      summary: "Inconclusive: inconsistent outcomes across 3 verification runs.",
      reproduced: false,
      precondition_ok: true,
      flaky: true,
      runsAnalyzed: runs.length,
    };
  }

  // 5. Unanimous deterministic outcome
  if (firstVerdict === true) {
    return {
      status: "REPRODUCED",
      reason: "Exploit deterministically reproduced across all verification iterations.",
      summary: "Exploit reproduced: vulnerability confirmed under sandbox execution.",
      reproduced: true,
      precondition_ok: true,
      flaky: false,
      runsAnalyzed: runs.length,
    };
  } else {
    return {
      status: "NOT_REPRODUCED",
      reason: "Exploit did not trigger across all verification iterations; tests completed cleanly.",
      summary: "Exploit not reproduced: test ran cleanly without triggering vulnerability.",
      reproduced: false,
      precondition_ok: true,
      flaky: false,
      runsAnalyzed: runs.length,
    };
  }
}

