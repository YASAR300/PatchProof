import { z } from "zod";

const SemgrepMatchSchema = z.object({
  check_id: z.string().min(1, "Semgrep check_id rule is required"),
  path: z.string().min(1, "Semgrep finding path is required"),
  start: z
    .object({
      line: z.number().int().positive().optional(),
      col: z.number().int().positive().optional(),
    })
    .optional(),
  end: z
    .object({
      line: z.number().int().positive().optional(),
      col: z.number().int().positive().optional(),
    })
    .optional(),
  extra: z
    .object({
      message: z.string().optional(),
      severity: z.string().optional(),
      lines: z.string().optional(),
      metadata: z
        .object({
          cwe: z.union([z.string(), z.array(z.string())]).optional(),
          explanation: z.string().optional(),
        })
        .passthrough()
        .optional(),
    })
    .passthrough()
    .optional(),
});

export const SemgrepDocumentSchema = z.union([
  z.object({
    results: z.array(SemgrepMatchSchema),
    errors: z.array(z.unknown()).optional(),
    version: z.string().optional(),
  }),
  z.array(SemgrepMatchSchema),
]);

/**
 * Normalizes Semgrep severity strings to PatchProof Severity enum.
 */
export function mapSemgrepSeverity(rawSeverity, cwe) {
  const s = String(rawSeverity || "").toUpperCase().trim();
  switch (s) {
    case "ERROR":
    case "CRITICAL":
      return "HIGH"; // Semgrep ERROR maps to HIGH (or CRITICAL if high impact)
    case "WARNING":
      return "MEDIUM";
    case "INFO":
      return "LOW";
    default:
      return "MEDIUM";
  }
}

/**
 * Normalizes file path, stripping leading slashes or Windows backslashes.
 */
function normalizeFilePath(filePath) {
  if (!filePath) return "unknown";
  let clean = filePath.replace(/^file:\/\/\/?/, "");
  clean = clean.replace(/\\/g, "/");
  clean = clean.replace(/^\/+/, "");
  return clean || "unknown";
}

/**
 * Parses and normalizes Semgrep JSON output.
 * @param {string | object} rawInput
 * @returns {{ toolName: string, findings: Array }}
 */
export function parseSemgrepJson(rawInput) {
  let json;
  if (typeof rawInput === "string") {
    try {
      json = JSON.parse(rawInput);
    } catch (err) {
      throw new Error(`Invalid JSON syntax in Semgrep file: ${err.message}`);
    }
  } else {
    json = rawInput;
  }

  // Validate structural schema with Zod
  const validation = SemgrepDocumentSchema.safeParse(json);
  if (!validation.success) {
    const issues = validation.error?.issues || validation.error?.errors || [];
    const errorDetails = issues.length > 0
      ? issues.map((e) => `${e.path?.join(".") || "root"}: ${e.message}`).join("; ")
      : validation.error?.message || "Invalid Semgrep JSON schema";
    throw new Error(`Malformed Semgrep JSON structure: ${errorDetails}`);
  }

  const rawMatches = Array.isArray(validation.data)
    ? validation.data
    : validation.data.results || [];

  const findings = [];

  for (const match of rawMatches) {
    const ruleId = match.check_id;
    const filePath = normalizeFilePath(match.path);
    const lineStart = match.start?.line || 1;
    const lineEnd = match.end?.line || lineStart;
    const snippet = match.extra?.lines || "";
    const message = match.extra?.message || ruleId;
    const explanation = match.extra?.metadata?.explanation || "";
    const description = explanation ? `${message}\n\n${explanation}` : message;

    // Extract CWE
    let cwe = null;
    const rawCwe = match.extra?.metadata?.cwe;
    if (rawCwe) {
      const cweCandidate = Array.isArray(rawCwe) ? rawCwe[0] : String(rawCwe);
      const cweMatch = cweCandidate.match(/\bCWE-?([0-9]{1,5})\b/i);
      if (cweMatch) {
        cwe = `CWE-${cweMatch[1]}`;
      } else {
        cwe = cweCandidate;
      }
    }

    const severity = mapSemgrepSeverity(match.extra?.severity, cwe);

    findings.push({
      tool: "Semgrep",
      ruleId,
      title: message,
      description,
      severity,
      filePath,
      lineStart,
      lineEnd,
      snippet,
      cwe,
    });
  }

  return {
    toolName: "Semgrep",
    findings,
  };
}
