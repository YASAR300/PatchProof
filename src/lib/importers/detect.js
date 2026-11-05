import crypto from "node:crypto";
import { parseSarif } from "./sarif.js";
import { parseSemgrepJson } from "./semgrep-json.js";

/**
 * Validates a commit SHA as a 7-40 character hexadecimal string.
 * @param {string} sha
 * @returns {boolean}
 */
export function isValidCommitSha(sha) {
  if (!sha || typeof sha !== "string") return false;
  return /^[0-9a-fA-F]{7,40}$/.test(sha.trim());
}

/**
 * Computes deterministic fingerprint matching Step 9:
 * sha256(ruleId + ":" + filePath + ":" + normalizedSnippet)
 */
export function computeFindingFingerprint(ruleId, filePath, snippet) {
  const normalizedSnippet = (snippet || "").trim();
  const payload = `${ruleId}:${filePath}:${normalizedSnippet}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

/**
 * Automatically detects whether raw JSON is SARIF 2.1.0 or Semgrep JSON.
 * @param {object} parsedJson
 * @returns {"sarif" | "semgrep"}
 */
export function detectReportFormat(parsedJson) {
  if (!parsedJson || typeof parsedJson !== "object") {
    throw new Error("Report content must be a valid JSON object or array.");
  }

  // SARIF detection: check $schema, version === "2.1.0", or runs array
  if (
    parsedJson.version === "2.1.0" ||
    (typeof parsedJson.$schema === "string" && parsedJson.$schema.toLowerCase().includes("sarif")) ||
    Array.isArray(parsedJson.runs)
  ) {
    return "sarif";
  }

  // Semgrep detection: check results array or array of check_id objects
  if (
    Array.isArray(parsedJson.results) ||
    (Array.isArray(parsedJson) && parsedJson.length > 0 && parsedJson[0]?.check_id)
  ) {
    return "semgrep";
  }

  throw new Error(
    "Unable to auto-detect report format. Please choose either 'SARIF 2.1.0' or 'Semgrep JSON'."
  );
}

/**
 * Unified report parser supporting SARIF 2.1.0 and Semgrep JSON with auto-detection.
 * @param {string} rawText
 * @param {"auto" | "sarif" | "semgrep"} formatChoice
 * @returns {{ format: string, toolName: string, findings: Array }}
 */
export function parseSecurityReport(rawText, formatChoice = "auto") {
  if (!rawText || !rawText.trim()) {
    throw new Error("Report file is completely empty.");
  }

  let json;
  try {
    json = JSON.parse(rawText);
  } catch (err) {
    throw new Error(`Failed to parse file as valid JSON: ${err.message}`);
  }

  let resolvedFormat = formatChoice;
  if (!resolvedFormat || resolvedFormat === "auto") {
    resolvedFormat = detectReportFormat(json);
  }

  let parsed;
  if (resolvedFormat === "sarif") {
    parsed = parseSarif(json);
  } else if (resolvedFormat === "semgrep") {
    parsed = parseSemgrepJson(json);
  } else {
    throw new Error(`Unsupported report format: '${formatChoice}'. Expected 'sarif' or 'semgrep'.`);
  }

  // Enrich each finding with stable fingerprint
  const enrichedFindings = parsed.findings.map((f) => {
    const fingerprint = computeFindingFingerprint(f.ruleId, f.filePath, f.snippet);
    return {
      ...f,
      fingerprint,
    };
  });

  return {
    format: resolvedFormat,
    toolName: parsed.toolName,
    findings: enrichedFindings,
  };
}

