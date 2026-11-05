import { z } from "zod";

/**
 * Zod schema for SARIF 2.1.0 subset validation.
 * Strips untrusted data and strictly validates required structural elements.
 */
const SarifLocationSchema = z.object({
  physicalLocation: z
    .object({
      artifactLocation: z
        .object({
          uri: z.string().optional(),
          uriBaseId: z.string().optional(),
        })
        .optional(),
      region: z
        .object({
          startLine: z.number().int().positive().optional(),
          startColumn: z.number().int().positive().optional(),
          endLine: z.number().int().positive().optional(),
          endColumn: z.number().int().positive().optional(),
          snippet: z
            .object({
              text: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
});

const SarifRuleSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  shortDescription: z.object({ text: z.string() }).optional(),
  fullDescription: z.object({ text: z.string() }).optional(),
  defaultConfiguration: z
    .object({
      level: z.enum(["error", "warning", "note", "none"]).optional(),
    })
    .optional(),
  helpUri: z.string().optional(),
  properties: z.record(z.unknown()).optional(),
});

const SarifResultSchema = z.object({
  ruleId: z.string().optional(),
  ruleIndex: z.number().int().nonnegative().optional(),
  level: z.enum(["error", "warning", "note", "none"]).optional(),
  message: z.object({
    text: z.string().optional(),
  }),
  locations: z.array(SarifLocationSchema).optional(),
  properties: z.record(z.unknown()).optional(),
});

const SarifRunSchema = z.object({
  tool: z.object({
    driver: z.object({
      name: z.string().min(1, "Tool driver name is required"),
      version: z.string().optional(),
      rules: z.array(SarifRuleSchema).optional(),
    }),
  }),
  results: z.array(SarifResultSchema).optional(),
});

export const SarifDocumentSchema = z.object({
  version: z.string().refine((v) => v === "2.1.0", {
    message: "SARIF version must be '2.1.0'",
  }),
  $schema: z.string().optional(),
  runs: z.array(SarifRunSchema).min(1, "SARIF document must contain at least one run"),
});

/**
 * Normalize SARIF security-severity score and level into PatchProof Severity enum.
 * Score mapping:
 * - 9.0 to 10.0 -> CRITICAL
 * - 7.0 to 8.9  -> HIGH
 * - 4.0 to 6.9  -> MEDIUM
 * - 0.1 to 3.9  -> LOW
 * Level mapping fallback:
 * - error   -> HIGH (or CRITICAL if security-severity >= 9.0)
 * - warning -> MEDIUM
 * - note    -> LOW
 * - none    -> INFO
 */
export function mapSarifSeverity(level, securitySeverityScore) {
  if (typeof securitySeverityScore === "number" || (typeof securitySeverityScore === "string" && !isNaN(Number(securitySeverityScore)))) {
    const score = Number(securitySeverityScore);
    if (score >= 9.0) return "CRITICAL";
    if (score >= 7.0) return "HIGH";
    if (score >= 4.0) return "MEDIUM";
    if (score > 0) return "LOW";
    return "INFO";
  }

  const normalizedLevel = String(level || "warning").toLowerCase();
  switch (normalizedLevel) {
    case "error":
      return "HIGH";
    case "warning":
      return "MEDIUM";
    case "note":
      return "LOW";
    case "none":
      return "INFO";
    default:
      return "MEDIUM";
  }
}

/**
 * Extracts CWE identifiers from rule tags, helpUri, or properties.
 * Looks for patterns like "CWE-89", "external/cwe/cwe-89", etc.
 */
export function extractCweFromProperties(rule, result) {
  const candidates = [];

  const checkItem = (val) => {
    if (!val) return;
    if (typeof val === "string") {
      candidates.push(val);
    } else if (Array.isArray(val)) {
      val.forEach((item) => typeof item === "string" && candidates.push(item));
    }
  };

  checkItem(rule?.properties?.cwe);
  checkItem(rule?.properties?.tags);
  checkItem(rule?.helpUri);
  checkItem(result?.properties?.cwe);
  checkItem(result?.properties?.tags);

  const cweRegex = /\bCWE-?([0-9]{1,5})\b/i;
  for (const str of candidates) {
    const match = str.match(cweRegex);
    if (match) {
      return `CWE-${match[1]}`;
    }
  }
  return null;
}

/**
 * Normalizes file path, stripping file:// protocol and leading slashes.
 */
function normalizeFilePath(uri) {
  if (!uri) return "unknown";
  let clean = uri.replace(/^file:\/\/\/?/, "");
  clean = clean.replace(/\\/g, "/");
  clean = clean.replace(/^\/+/, "");
  return clean || "unknown";
}

/**
 * Parses and normalizes a SARIF 2.1.0 document.
 * @param {string | object} rawInput
 * @returns {{ toolName: string, findings: Array }}
 */
export function parseSarif(rawInput) {
  let json;
  if (typeof rawInput === "string") {
    try {
      json = JSON.parse(rawInput);
    } catch (err) {
      throw new Error(`Invalid JSON syntax in SARIF file: ${err.message}`);
    }
  } else {
    json = rawInput;
  }

  // Validate structural schema with Zod
  const validation = SarifDocumentSchema.safeParse(json);
  if (!validation.success) {
    const issues = validation.error?.issues || validation.error?.errors || [];
    const errorDetails = issues.length > 0
      ? issues.map((e) => `${e.path?.join(".") || "root"}: ${e.message}`).join("; ")
      : validation.error?.message || "Invalid SARIF 2.1.0 schema";
    throw new Error(`Malformed SARIF structure: ${errorDetails}`);
  }

  const sarif = validation.data;
  const findings = [];
  let primaryToolName = "SARIF";

  for (const run of sarif.runs) {
    const driver = run.tool.driver;
    const toolName = driver.name || "SARIF";
    if (primaryToolName === "SARIF" && toolName !== "SARIF") {
      primaryToolName = toolName;
    }

    // Build rule lookup map
    const rulesMap = new Map();
    if (Array.isArray(driver.rules)) {
      driver.rules.forEach((rule, idx) => {
        if (rule.id) rulesMap.set(rule.id, rule);
        rulesMap.set(idx, rule);
      });
    }

    const results = run.results || [];
    for (const res of results) {
      // Resolve rule definition
      const rule = (res.ruleId && rulesMap.get(res.ruleId)) ||
        (res.ruleIndex !== undefined && rulesMap.get(res.ruleIndex)) ||
        null;

      const ruleId = res.ruleId || rule?.id || "unknown-rule";
      const title = res.message?.text || rule?.shortDescription?.text || ruleId;
      const description = rule?.fullDescription?.text || rule?.shortDescription?.text || title;

      // Extract severity
      const securitySeverity =
        res.properties?.["security-severity"] ??
        rule?.properties?.["security-severity"];
      const level = res.level || rule?.defaultConfiguration?.level || "warning";
      const severity = mapSarifSeverity(level, securitySeverity);

      // Extract location
      const firstLoc = res.locations?.[0]?.physicalLocation;
      const filePath = normalizeFilePath(firstLoc?.artifactLocation?.uri);
      const lineStart = firstLoc?.region?.startLine || 1;
      const lineEnd = firstLoc?.region?.endLine || lineStart;
      const snippet = firstLoc?.region?.snippet?.text || "";

      // Extract CWE
      const cwe = extractCweFromProperties(rule, res);

      findings.push({
        tool: toolName,
        ruleId,
        title,
        description,
        severity,
        filePath,
        lineStart,
        lineEnd,
        snippet,
        cwe,
      });
    }
  }

  return {
    toolName: primaryToolName,
    findings,
  };
}
