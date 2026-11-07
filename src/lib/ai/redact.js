/**
 * Sensitive Token & Secret Redaction Patterns
 */
const SECRET_PATTERNS = [
  // AWS Access Keys
  /\b(AKIA[0-9A-Z]{16})\b/g,
  // GitHub Personal Access Tokens / App Tokens
  /\b(gh[pousr]_[A-Za-z0-9_]{20,})\b/g,
  // Anthropic API Keys
  /\b(sk-ant-[a-zA-Z0-9_\-]{20,})\b/g,
  // OpenAI API Keys
  /\b(sk-[a-zA-Z0-9_\-]{20,})\b/g,
  // Generic Private Keys
  /-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+ PRIVATE KEY-----/g,
  // Bearer Authorization Tokens
  /Bearer\s+[a-zA-Z0-9_\-\.]{15,}/gi,
  // Common password/secret query params & JSON fields
  /("?(?:password|token|secret|apiKey|api_key|auth_token)"?\s*[:=]\s*["'])([^"']{4,})(["'])/gi,
];

/**
 * Redacts potential credentials, API tokens, and secret keys from a string.
 *
 * @param {string} text
 * @returns {string} Sanitized string
 */
export function redactSecrets(text) {
  if (typeof text !== "string") return text;
  let sanitized = text;

  for (const pattern of SECRET_PATTERNS) {
    if (pattern.source.includes("password|token")) {
      sanitized = sanitized.replace(pattern, '$1[REDACTED_SECRET]$3');
    } else {
      sanitized = sanitized.replace(pattern, "[REDACTED_SECRET]");
    }
  }

  return sanitized;
}

/**
 * Truncates raw log text to a maximum number of head and tail lines for safety.
 *
 * @param {string} logText
 * @param {number} [maxLines=30]
 * @returns {string} Truncated log
 */
export function truncateLog(logText, maxLines = 30) {
  if (typeof logText !== "string" || !logText) return "";
  const lines = logText.split(/\r?\n/);
  if (lines.length <= maxLines * 2) {
    return redactSecrets(logText);
  }

  const head = lines.slice(0, maxLines);
  const tail = lines.slice(-maxLines);
  const omitted = lines.length - maxLines * 2;

  return redactSecrets([
    ...head,
    `\n... [${omitted} log lines omitted for evidence safety] ...\n`,
    ...tail,
  ].join("\n"));
}

/**
 * Recursively redacts strings and truncates logs in an evidence data structure.
 *
 * @param {any} value
 * @returns {any} Sanitized value
 */
export function redactEvidence(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    // If it looks like a multiline log (> 40 lines), truncate and redact
    if (value.includes("\n") && value.split("\n").length > 60) {
      return truncateLog(value, 30);
    }
    return redactSecrets(value);
  }
  if (Array.isArray(value)) {
    return value.map(redactEvidence);
  }
  if (typeof value === "object") {
    const sanitizedObj = {};
    for (const [key, val] of Object.entries(value)) {
      // Check if key explicitly denotes logs or raw console output
      if (typeof val === "string" && (key.toLowerCase().includes("log") || key.toLowerCase().includes("console"))) {
        sanitizedObj[key] = truncateLog(val, 30);
      } else {
        sanitizedObj[key] = redactEvidence(val);
      }
    }
    return sanitizedObj;
  }
  return value;
}
