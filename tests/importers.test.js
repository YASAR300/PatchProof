import { describe, it, expect } from "vitest";
import { parseSecurityReport, detectReportFormat } from "@/lib/importers/detect.js";

const VALID_SARIF_SAMPLE = JSON.stringify({
  version: "2.1.0",
  $schema: "https://json.schemastore.org/sarif-2.1.0.json",
  runs: [
    {
      tool: {
        driver: {
          name: "CodeQL",
          rules: [
            {
              id: "py/sql-injection",
              shortDescription: { text: "SQL query built from user-controlled sources" },
              defaultConfiguration: { level: "error" },
            },
          ],
        },
      },
      results: [
        {
          ruleId: "py/sql-injection",
          message: { text: "This query depends on a user-provided value." },
          level: "error",
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: "src/users.py" },
                region: {
                  startLine: 42,
                  endLine: 45,
                  snippet: { text: 'cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")' },
                },
              },
            },
          ],
        },
      ],
    },
  ],
});

const VALID_SEMGREP_SAMPLE = JSON.stringify({
  results: [
    {
      check_id: "python.lang.security.audit.sqli.raw-sql",
      path: "src/database.py",
      start: { line: 15, col: 5 },
      end: { line: 15, col: 50 },
      extra: {
        message: "Untrusted input concatenated into SQL query string.",
        severity: "ERROR",
        lines: "db.query('SELECT * FROM data WHERE key = ' + req.key)",
        metadata: {
          cwe: ["CWE-89: SQL Injection"],
        },
      },
    },
  ],
});

describe("importers — SARIF & Semgrep Importers", () => {
  it("successfully parses valid SARIF 2.1.0 report", () => {
    const parsed = parseSecurityReport(VALID_SARIF_SAMPLE, "sarif");
    expect(parsed.format).toBe("sarif");
    expect(parsed.toolName).toBe("CodeQL");
    expect(parsed.findings.length).toBe(1);

    const finding = parsed.findings[0];
    expect(finding.ruleId).toBe("py/sql-injection");
    expect(finding.filePath).toBe("src/users.py");
    expect(finding.lineStart).toBe(42);
    expect(finding.severity).toBe("HIGH"); // error maps to HIGH or CRITICAL
    expect(finding.fingerprint).toBeDefined();
    expect(finding.fingerprint.length).toBe(64);
  });

  it("successfully parses valid Semgrep JSON report", () => {
    const parsed = parseSecurityReport(VALID_SEMGREP_SAMPLE, "semgrep");
    expect(parsed.format).toBe("semgrep");
    expect(parsed.toolName).toBe("Semgrep");
    expect(parsed.findings.length).toBe(1);

    const finding = parsed.findings[0];
    expect(finding.ruleId).toBe("python.lang.security.audit.sqli.raw-sql");
    expect(finding.filePath).toBe("src/database.py");
    expect(finding.lineStart).toBe(15);
    expect(finding.severity).toBe("HIGH");
    expect(finding.cwe).toContain("CWE-89");
    expect(finding.fingerprint).toBeDefined();
  });

  it("auto-detects format accurately between SARIF and Semgrep", () => {
    expect(detectReportFormat(JSON.parse(VALID_SARIF_SAMPLE))).toBe("sarif");
    expect(detectReportFormat(JSON.parse(VALID_SEMGREP_SAMPLE))).toBe("semgrep");
  });

  it("throws clear error on completely empty file", () => {
    expect(() => parseSecurityReport("")).toThrow("Report file is completely empty");
    expect(() => parseSecurityReport("   ")).toThrow("Report file is completely empty");
  });

  it("throws clear error on malformed JSON", () => {
    expect(() => parseSecurityReport("{ invalid json here ")).toThrow("Failed to parse file as valid JSON");
  });

  it("throws clear error on unrecognizable report structure", () => {
    const unknownJson = JSON.stringify({ randomKey: "randomValue" });
    expect(() => parseSecurityReport(unknownJson)).toThrow("Unable to auto-detect report format");
  });
});
