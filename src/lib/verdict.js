/**
 * Patch Validation Verdict Engine
 *
 * Implements strict hierarchical evaluation precedence for patch validation:
 * 1. any EXECUTION_ERROR in either security run or candidate regression run -> EXECUTION_ERROR
 * 2. baseline security status is not REPRODUCED -> INCONCLUSIVE ("The vulnerable baseline did not reproduce the issue, so the comparison is not reliable.")
 * 3. candidate security status is REPRODUCED -> PATCH_NOT_VERIFIED
 * 4. candidate security status is INCONCLUSIVE -> INCONCLUSIVE
 * 5. candidate is NOT_REPRODUCED but at least one regression test fails only on the candidate -> REGRESSION_FAILURE
 * 6. candidate is NOT_REPRODUCED and no new regression failures -> FIX_VERIFIED (worded "Fix verified for tested cases")
 */

export const LIMITATIONS_NOTICE =
  "Verified for the tested cases only. Additional input cases and broader authorization checks have not been evaluated.";

/**
 * Pure function to decide patch verification verdict.
 * Usable by both worker processes and UI views.
 *
 * @param {object} params
 * @param {object} params.baselineRun - Baseline security run { status, exitCode }
 * @param {object} params.candidateRun - Candidate security run { status, exitCode }
 * @param {object} [params.baselineRegression] - Baseline regression suite { passed, tests, exitCode, hasExecutionError }
 * @param {object} [params.candidateRegression] - Candidate regression suite { passed, tests, exitCode, hasExecutionError }
 * @param {Array} [params.newFailures] - Tests passing on baseline but failing on candidate
 * @returns {{
 *   verdict: 'FIX_VERIFIED' | 'PATCH_NOT_VERIFIED' | 'REGRESSION_FAILURE' | 'INCONCLUSIVE' | 'EXECUTION_ERROR',
 *   summary: string,
 *   explanation: string,
 *   limitations: string
 * }}
 */
export function decidePatchVerdict({
  baselineRun,
  candidateRun,
  baselineRegression,
  candidateRegression,
  newFailures = [],
}) {
  const baselineSecurityStatus = baselineRun?.status;
  const candidateSecurityStatus = candidateRun?.status;

  const candidateRegressionExecutionError = Boolean(
    candidateRegression?.hasExecutionError ||
      (candidateRegression?.exitCode !== undefined &&
        candidateRegression.exitCode !== 0 &&
        (!newFailures || newFailures.length === 0) &&
        (!candidateRegression.tests || candidateRegression.tests.length === 0))
  );

  // 1. Any EXECUTION_ERROR in either security run or the candidate regression run
  if (
    baselineSecurityStatus === "EXECUTION_ERROR" ||
    candidateSecurityStatus === "EXECUTION_ERROR" ||
    candidateRegressionExecutionError
  ) {
    return {
      verdict: "EXECUTION_ERROR",
      summary: "Execution error: Build or test setup failed during execution.",
      explanation:
        "Execution error encountered during reproduction or test suite run. The candidate build, syntax, or environment failed.",
      limitations: LIMITATIONS_NOTICE,
    };
  }

  // 2. Baseline security status is not REPRODUCED: INCONCLUSIVE
  if (baselineSecurityStatus !== "REPRODUCED") {
    return {
      verdict: "INCONCLUSIVE",
      summary: "Inconclusive: baseline issue did not reproduce.",
      explanation:
        "The vulnerable baseline did not reproduce the issue, so the comparison is not reliable.",
      limitations: LIMITATIONS_NOTICE,
    };
  }

  // 3. Candidate security status is REPRODUCED: PATCH_NOT_VERIFIED
  if (candidateSecurityStatus === "REPRODUCED") {
    return {
      verdict: "PATCH_NOT_VERIFIED",
      summary: "Patch not verified: vulnerability reproduced in candidate commit.",
      explanation:
        "The proposed patch does not resolve the vulnerability; the exploit reproducer still triggered successfully.",
      limitations: LIMITATIONS_NOTICE,
    };
  }

  // 4. Candidate security status is INCONCLUSIVE: INCONCLUSIVE
  if (candidateSecurityStatus === "INCONCLUSIVE") {
    return {
      verdict: "INCONCLUSIVE",
      summary: "Inconclusive: candidate security reproducer was inconclusive.",
      explanation:
        "The candidate patch produced ambiguous, flaky, or unparsable verification results.",
      limitations: LIMITATIONS_NOTICE,
    };
  }

  // 5. Candidate is NOT_REPRODUCED but at least one regression test fails only on the candidate: REGRESSION_FAILURE
  if (candidateSecurityStatus === "NOT_REPRODUCED" && newFailures && newFailures.length > 0) {
    const failureCount = newFailures.length;
    return {
      verdict: "REGRESSION_FAILURE",
      summary: `Regression failure: fix breaks ${failureCount} existing functionality test(s).`,
      explanation: `The vulnerability was neutralized, but ${failureCount} existing test(s) failed on the candidate patch.`,
      limitations: LIMITATIONS_NOTICE,
    };
  }

  // 6. Candidate is NOT_REPRODUCED and no new regression failures: FIX_VERIFIED
  // Always worded 'Fix verified for tested cases', never as a guarantee of security.
  if (candidateSecurityStatus === "NOT_REPRODUCED") {
    return {
      verdict: "FIX_VERIFIED",
      summary: "Fix verified for tested cases",
      explanation:
        "Fix verified for tested cases. Vulnerability was neutralized and all existing regression tests passed without regression.",
      limitations: LIMITATIONS_NOTICE,
    };
  }

  // Fallback if unexpected state
  return {
    verdict: "INCONCLUSIVE",
    summary: "Inconclusive: unexpected state encountered.",
    explanation: "The verification states could not be reliably determined.",
    limitations: LIMITATIONS_NOTICE,
  };
}
