export const APP_CONFIG = {
  name: "PatchProof",
  tagline: "Evidence-First Security Verification",
  version: "0.1.0",
};

/**
 * Semantic Verification Statuses
 * Defined once and reused across all badges, logs, and verification runs.
 *
 * Semantic color mapping:
 * REPRODUCED = red
 * NOT_REPRODUCED = green
 * INCONCLUSIVE = amber
 * EXECUTION_ERROR = gray
 * FIX_VERIFIED = green
 * PATCH_NOT_VERIFIED = red
 * REGRESSION_FAILURE = orange
 * UNVERIFIED = neutral
 */
export const VERIFICATION_STATUS = {
  REPRODUCED: {
    key: "REPRODUCED",
    label: "Reproduced",
    color: "red",
    description: "Vulnerability was deterministically triggered by test",
  },
  NOT_REPRODUCED: {
    key: "NOT_REPRODUCED",
    label: "Not Reproduced",
    color: "green",
    description: "Vulnerability could not be triggered under test conditions",
  },
  INCONCLUSIVE: {
    key: "INCONCLUSIVE",
    label: "Inconclusive",
    color: "amber",
    description: "Verification execution produced ambiguous or flaked output",
  },
  EXECUTION_ERROR: {
    key: "EXECUTION_ERROR",
    label: "Execution Error",
    color: "gray",
    description: "Test environment, harness, or harness runner failed to complete",
  },
  FIX_VERIFIED: {
    key: "FIX_VERIFIED",
    label: "Fix Verified",
    color: "green",
    description: "Patch eliminates exploit without breaking normal behavior",
  },
  PATCH_NOT_VERIFIED: {
    key: "PATCH_NOT_VERIFIED",
    label: "Patch Not Verified",
    color: "red",
    description: "Exploit still succeeds after applying proposed patch",
  },
  REGRESSION_FAILURE: {
    key: "REGRESSION_FAILURE",
    label: "Regression Failure",
    color: "orange",
    description: "Patch introduces side-effect breaks in existing test suites",
  },
  UNVERIFIED: {
    key: "UNVERIFIED",
    label: "Unverified",
    color: "neutral",
    description: "Awaiting automated test generation or reproduction harness",
  },
};

/**
 * Security Severities
 * Each severity receives an unambiguous, distinct color identity.
 */
export const SEVERITY_LEVELS = {
  CRITICAL: {
    key: "CRITICAL",
    label: "Critical",
    color: "critical",
    rank: 5,
  },
  HIGH: {
    key: "HIGH",
    label: "High",
    color: "high",
    rank: 4,
  },
  MEDIUM: {
    key: "MEDIUM",
    label: "Medium",
    color: "medium",
    rank: 3,
  },
  LOW: {
    key: "LOW",
    label: "Low",
    color: "low",
    rank: 2,
  },
  INFO: {
    key: "INFO",
    label: "Info",
    color: "info",
    rank: 1,
  },
};
