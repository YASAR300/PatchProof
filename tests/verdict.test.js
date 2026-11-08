import { describe, it, expect } from "vitest";
import { decidePatchVerdict, LIMITATIONS_NOTICE } from "@/lib/verdict.js";

describe("verdict.js — Patch Validation Verdict Engine", () => {
  it("precedence 1: returns EXECUTION_ERROR when baseline security run has EXECUTION_ERROR", () => {
    const verdict = decidePatchVerdict({
      baselineRun: { status: "EXECUTION_ERROR", exitCode: 1 },
      candidateRun: { status: "NOT_REPRODUCED", exitCode: 0 },
      newFailures: [],
    });
    expect(verdict.verdict).toBe("EXECUTION_ERROR");
    expect(verdict.limitations).toBe(LIMITATIONS_NOTICE);
  });

  it("precedence 1: returns EXECUTION_ERROR when candidate security run has EXECUTION_ERROR", () => {
    const verdict = decidePatchVerdict({
      baselineRun: { status: "REPRODUCED", exitCode: 0 },
      candidateRun: { status: "EXECUTION_ERROR", exitCode: 137 },
      newFailures: [],
    });
    expect(verdict.verdict).toBe("EXECUTION_ERROR");
  });

  it("precedence 1: returns EXECUTION_ERROR when candidate regression suite has execution error", () => {
    const verdict = decidePatchVerdict({
      baselineRun: { status: "REPRODUCED", exitCode: 0 },
      candidateRun: { status: "NOT_REPRODUCED", exitCode: 0 },
      candidateRegression: { hasExecutionError: true, exitCode: 1 },
      newFailures: [],
    });
    expect(verdict.verdict).toBe("EXECUTION_ERROR");
  });

  it("precedence 2: returns INCONCLUSIVE when baseline is NOT_REPRODUCED (comparison invalid)", () => {
    const verdict = decidePatchVerdict({
      baselineRun: { status: "NOT_REPRODUCED", exitCode: 0 },
      candidateRun: { status: "NOT_REPRODUCED", exitCode: 0 },
      newFailures: [],
    });
    expect(verdict.verdict).toBe("INCONCLUSIVE");
    expect(verdict.explanation).toContain("The vulnerable baseline did not reproduce the issue");
  });

  it("precedence 2: returns INCONCLUSIVE when baseline is INCONCLUSIVE", () => {
    const verdict = decidePatchVerdict({
      baselineRun: { status: "INCONCLUSIVE", exitCode: 0 },
      candidateRun: { status: "NOT_REPRODUCED", exitCode: 0 },
      newFailures: [],
    });
    expect(verdict.verdict).toBe("INCONCLUSIVE");
  });

  it("precedence 3: returns PATCH_NOT_VERIFIED when candidate still reproduces the exploit", () => {
    const verdict = decidePatchVerdict({
      baselineRun: { status: "REPRODUCED", exitCode: 0 },
      candidateRun: { status: "REPRODUCED", exitCode: 0 },
      newFailures: [],
    });
    expect(verdict.verdict).toBe("PATCH_NOT_VERIFIED");
    expect(verdict.summary).toContain("Patch not verified");
  });

  it("precedence 4: returns INCONCLUSIVE when candidate is INCONCLUSIVE", () => {
    const verdict = decidePatchVerdict({
      baselineRun: { status: "REPRODUCED", exitCode: 0 },
      candidateRun: { status: "INCONCLUSIVE", exitCode: 0 },
      newFailures: [],
    });
    expect(verdict.verdict).toBe("INCONCLUSIVE");
    expect(verdict.summary).toContain("candidate security reproducer was inconclusive");
  });

  it("precedence 5: returns REGRESSION_FAILURE when exploit is fixed but regression tests fail", () => {
    const verdict = decidePatchVerdict({
      baselineRun: { status: "REPRODUCED", exitCode: 0 },
      candidateRun: { status: "NOT_REPRODUCED", exitCode: 0 },
      newFailures: [
        { testName: "tests.test_users.UserTestCase.test_user_lookup", outcome: "FAIL" },
      ],
    });
    expect(verdict.verdict).toBe("REGRESSION_FAILURE");
    expect(verdict.summary).toContain("fix breaks 1 existing functionality test(s)");
  });

  it("precedence 6: returns FIX_VERIFIED when exploit is neutralized and 0 regressions exist", () => {
    const verdict = decidePatchVerdict({
      baselineRun: { status: "REPRODUCED", exitCode: 0 },
      candidateRun: { status: "NOT_REPRODUCED", exitCode: 0 },
      newFailures: [],
    });
    expect(verdict.verdict).toBe("FIX_VERIFIED");
    expect(verdict.summary).toBe("Fix verified for tested cases");
    expect(verdict.limitations).toBe(LIMITATIONS_NOTICE);
  });
});
