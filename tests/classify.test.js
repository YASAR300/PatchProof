import { describe, it, expect } from "vitest";
import { classifyRuns, parseOracleOutput } from "@/lib/classify.js";

describe("classify.js — Vulnerability Verification Classifier", () => {
  describe("parseOracleOutput", () => {
    it("extracts clean JSON assertion object from single line", () => {
      const output = '{"reproduced": true, "precondition_ok": true, "reason": "SQL injection payload executed"}';
      const result = parseOracleOutput(output);
      expect(result.parseError).toBe(false);
      expect(result.assertion).toEqual({
        reproduced: true,
        precondition_ok: true,
        reason: "SQL injection payload executed",
      });
    });

    it("parses the final JSON assertion when preceded by multi-line debug logs", () => {
      const output = `[DEBUG] Initializing SQLite connection...\n[INFO] Injecting payload into query...\n{"reproduced": false, "precondition_ok": true}\n`;
      const result = parseOracleOutput(output);
      expect(result.parseError).toBe(false);
      expect(result.assertion.reproduced).toBe(false);
      expect(result.assertion.precondition_ok).toBe(true);
    });

    it("returns parseError when no JSON assertion is present in stdout", () => {
      const output = "Traceback (most recent call last):\nValueError: invalid literal for int()";
      const result = parseOracleOutput(output);
      expect(result.parseError).toBe(true);
      expect(result.assertion).toBeNull();
    });

    it("handles null, undefined, or empty stdout gracefully", () => {
      expect(parseOracleOutput("").parseError).toBe(true);
      expect(parseOracleOutput(null).parseError).toBe(true);
      expect(parseOracleOutput(undefined).parseError).toBe(true);
    });
  });

  describe("classifyRuns", () => {
    it("classifies unanimous runs as REPRODUCED", () => {
      const runs = [
        { exitCode: 0, stdout: '{"reproduced": true, "precondition_ok": true}' },
        { exitCode: 0, stdout: '{"reproduced": true, "precondition_ok": true}' },
        { exitCode: 0, stdout: '{"reproduced": true, "precondition_ok": true}' },
      ];
      const result = classifyRuns(runs);
      expect(result.status).toBe("REPRODUCED");
      expect(result.reproduced).toBe(true);
      expect(result.precondition_ok).toBe(true);
      expect(result.flaky).toBe(false);
    });

    it("classifies unanimous runs as NOT_REPRODUCED", () => {
      const runs = [
        { exitCode: 0, stdout: '{"reproduced": false, "precondition_ok": true}' },
        { exitCode: 0, stdout: '{"reproduced": false, "precondition_ok": true}' },
        { exitCode: 0, stdout: '{"reproduced": false, "precondition_ok": true}' },
      ];
      const result = classifyRuns(runs);
      expect(result.status).toBe("NOT_REPRODUCED");
      expect(result.reproduced).toBe(false);
      expect(result.precondition_ok).toBe(true);
      expect(result.flaky).toBe(false);
    });

    it("classifies runs with disagreeing outcomes as INCONCLUSIVE (flaky)", () => {
      const runs = [
        { exitCode: 0, stdout: '{"reproduced": true, "precondition_ok": true}' },
        { exitCode: 0, stdout: '{"reproduced": false, "precondition_ok": true}' },
        { exitCode: 0, stdout: '{"reproduced": true, "precondition_ok": true}' },
      ];
      const result = classifyRuns(runs);
      expect(result.status).toBe("INCONCLUSIVE");
      expect(result.flaky).toBe(true);
    });

    it("classifies runs with precondition_ok: false as INCONCLUSIVE", () => {
      const runs = [
        { exitCode: 0, stdout: '{"reproduced": false, "precondition_ok": false, "reason": "missing sqlite database"}' },
        { exitCode: 0, stdout: '{"reproduced": false, "precondition_ok": false, "reason": "missing sqlite database"}' },
        { exitCode: 0, stdout: '{"reproduced": false, "precondition_ok": false, "reason": "missing sqlite database"}' },
      ];
      const result = classifyRuns(runs);
      expect(result.status).toBe("INCONCLUSIVE");
      expect(result.precondition_ok).toBe(false);
      expect(result.flaky).toBe(false);
    });

    it("classifies runs with missing or invalid oracle JSON as INCONCLUSIVE", () => {
      const runs = [
        { exitCode: 0, stdout: "Some random logs without json" },
      ];
      const result = classifyRuns(runs);
      expect(result.status).toBe("INCONCLUSIVE");
      expect(result.reason).toContain("missing or unparsable");
    });

    it("classifies non-zero exit code as EXECUTION_ERROR", () => {
      const runs = [
        { exitCode: 0, stdout: '{"reproduced": true, "precondition_ok": true}' },
        { exitCode: 1, stdout: "", stderr: "SyntaxError: invalid syntax" },
        { exitCode: 0, stdout: '{"reproduced": true, "precondition_ok": true}' },
      ];
      const result = classifyRuns(runs);
      expect(result.status).toBe("EXECUTION_ERROR");
      expect(result.summary).toContain("Non-zero exit code (1)");
    });

    it("classifies timeout as EXECUTION_ERROR", () => {
      const runs = [
        { exitCode: 137, timedOut: true, stdout: "Looping forever..." },
      ];
      const result = classifyRuns(runs);
      expect(result.status).toBe("EXECUTION_ERROR");
      expect(result.summary).toContain("Process timed out");
    });

    it("classifies OOM kill as EXECUTION_ERROR", () => {
      const runs = [
        { exitCode: 137, oomKilled: true, stderr: "Killed: Out of memory" },
      ];
      const result = classifyRuns(runs);
      expect(result.status).toBe("EXECUTION_ERROR");
      expect(result.summary).toContain("Out of memory");
    });

    it("classifies setup failure as EXECUTION_ERROR", () => {
      const runs = [
        { exitCode: 1, setupFailed: true, stderr: "Failed to mount workspace" },
      ];
      const result = classifyRuns(runs);
      expect(result.status).toBe("EXECUTION_ERROR");
      expect(result.summary).toContain("Setup error");
    });

    it("handles empty runs array as EXECUTION_ERROR", () => {
      const result = classifyRuns([]);
      expect(result.status).toBe("EXECUTION_ERROR");
      expect(result.runsAnalyzed).toBe(0);
    });
  });
});
