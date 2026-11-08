/**
 * Secrets Redactor
 *
 * Scans log messages, error traces, and evidence outputs to redact sensitive credentials,
 * tokens, API keys, private certificates, and environment secrets before storage or display.
 */

/**
 * Returns a redacted version of the provided input string.
 * @param {string} text
 * @returns {string}
 */
export function redactSecrets(text) {
  if (typeof text !== "string") {
    if (text === null || text === undefined) return "";
    text = String(text);
  }

  let redacted = text;

  // 1. Redact known static / dynamic secrets from environment variables if present
  if (typeof process !== "undefined" && process.env) {
    const envVars = [
      "AUTH_SECRET",
      "NEXTAUTH_SECRET",
      "APP_ENCRYPTION_KEY",
      "ANTHROPIC_API_KEY",
      "GITHUB_TOKEN",
      "GITHUB_CLIENT_SECRET",
    ];

    for (const v of envVars) {
      const val = process.env[v];
      if (val && typeof val === "string" && val.length >= 8) {
        const escaped = val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        redacted = redacted.replace(new RegExp(escaped, "g"), "[REDACTED_SECRET]");
      }
    }
  }

  // 2. Exact token replacements (without capturing groups)
  redacted = redacted
    .replace(/sk-ant-[a-zA-Z0-9_\-]{20,}/g, "[REDACTED_SECRET]")
    .replace(/sk-[a-zA-Z0-9]{20,}/g, "[REDACTED_SECRET]")
    .replace(/gh[pousr]_[A-Za-z0-9_]{36,}/g, "[REDACTED_SECRET]")
    .replace(/github_pat_[A-Za-z0-9_]{36,}/g, "[REDACTED_SECRET]")
    .replace(/AKIA[0-9A-Z]{16}/g, "[REDACTED_SECRET]")
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[REDACTED_SECRET]")
    .replace(/Bearer\s+[a-zA-Z0-9\-._~+/]{15,}=*/gi, "Bearer [REDACTED_TOKEN]");

  // 3. Embedded basic auth credentials in URLs: https://user:pass@host
  redacted = redacted.replace(/(https?:\/\/[^:\s]+:)([^@\s]+)(@)/gi, "$1[REDACTED]$3");

  // 4. Generic key-value secret fields (e.g., password=foo, "secret": "bar")
  redacted = redacted.replace(
    /((?:password|client_secret|access_token|secret_key|webhook_secret|api_key|authToken)\s*[:=]\s*["']?)([^"'&\s\n]{6,})(["']?)/gi,
    "$1[REDACTED]$3"
  );

  return redacted;
}
