import { describe, it, expect } from "vitest";
import { computeFindingFingerprint } from "@/lib/importers/detect.js";

describe("fingerprint — Deterministic Vulnerability Fingerprinting", () => {
  it("produces identical 64-char hex SHA-256 for identical inputs", () => {
    const fp1 = computeFindingFingerprint("py/sql-injection", "src/users.py", "cursor.execute(query)");
    const fp2 = computeFindingFingerprint("py/sql-injection", "src/users.py", "cursor.execute(query)");
    expect(fp1).toBe(fp2);
    expect(fp1).toMatch(/^[a-f0-9]{64}$/);
  });

  it("normalizes leading and trailing snippet whitespace", () => {
    const fp1 = computeFindingFingerprint("py/sql-injection", "src/users.py", "cursor.execute(query)");
    const fp2 = computeFindingFingerprint("py/sql-injection", "src/users.py", "  cursor.execute(query)\n\n");
    expect(fp1).toBe(fp2);
  });

  it("handles null or undefined snippet gracefully", () => {
    const fp1 = computeFindingFingerprint("py/sql-injection", "src/users.py", null);
    const fp2 = computeFindingFingerprint("py/sql-injection", "src/users.py", "");
    expect(fp1).toBe(fp2);
    expect(fp1).toMatch(/^[a-f0-9]{64}$/);
  });

  it("produces different fingerprints for different files or rules", () => {
    const fpA = computeFindingFingerprint("rule-1", "src/a.py", "snippet");
    const fpB = computeFindingFingerprint("rule-2", "src/a.py", "snippet");
    const fpC = computeFindingFingerprint("rule-1", "src/b.py", "snippet");
    expect(fpA).not.toBe(fpB);
    expect(fpA).not.toBe(fpC);
    expect(fpB).not.toBe(fpC);
  });
});
