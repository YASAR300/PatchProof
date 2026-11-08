import { describe, it, expect } from "vitest";
import crypto from "node:crypto";
import {
  canonicalJsonStringify,
  computeSha256,
  verifyReportIntegrity,
  buildEvidenceDocument,
} from "@/lib/report.js";

describe("integrity — Report Cryptographic Integrity Hashing", () => {
  describe("canonicalJsonStringify", () => {
    it("sorts object keys in deterministic alphabetical order", () => {
      const obj1 = { zebra: 1, apple: 2, mango: 3 };
      const obj2 = { apple: 2, mango: 3, zebra: 1 };
      const str1 = canonicalJsonStringify(obj1);
      const str2 = canonicalJsonStringify(obj2);

      expect(str1).toBe('{"apple":2,"mango":3,"zebra":1}');
      expect(str1).toBe(str2);
    });

    it("recursively sorts nested objects and preserves arrays", () => {
      const nested = { b: { y: 10, x: 20 }, a: [1, 2, { d: 4, c: 3 }] };
      const serialized = canonicalJsonStringify(nested);
      expect(serialized).toBe('{"a":[1,2,{"c":3,"d":4}],"b":{"x":20,"y":10}}');
    });
  });

  describe("computeSha256", () => {
    it("computes accurate SHA-256 hex digest", () => {
      const hash = computeSha256("test-content");
      const expected = crypto.createHash("sha256").update("test-content", "utf8").digest("hex");
      expect(hash).toBe(expected);
      expect(hash.length).toBe(64);
    });
  });

  describe("verifyReportIntegrity", () => {
    const mockDiffContent = "diff --git a/src/users.py b/src/users.py\n--- a/src/users.py\n+++ b/src/users.py";
    const validDiffSha = crypto.createHash("sha256").update(mockDiffContent).digest("hex");

    const mockReport = {
      id: "report-12345",
      projectId: "proj-123",
      verdict: "FIX_VERIFIED",
      summary: "Fix verified for tested cases",
      baselineCommit: "da17102a1b2c3d4e5f678901234567890abcdef0",
      candidateCommit: "9d13f9fa1b2c3d4e5f678901234567890abcdef0",
      createdAt: new Date("2026-11-01T12:00:00Z"),
      project: { id: "proj-123", name: "Demo", slug: "demo", repoOwner: "org", repoName: "repo" },
      finding: { id: "find-1", ruleId: "py/sql-injection", title: "SQLi", filePath: "src/users.py", severity: "HIGH" },
      artifacts: [
        {
          id: "art-1",
          kind: "DIFF",
          name: "patch.diff",
          content: mockDiffContent,
          sizeBytes: Buffer.byteLength(mockDiffContent),
          sha256: validDiffSha,
        },
      ],
      baselineRun: {
        id: "run-baseline",
        status: "REPRODUCED",
        artifacts: [],
      },
      candidateRun: {
        id: "run-candidate",
        status: "NOT_REPRODUCED",
        artifacts: [],
      },
      decisions: [],
    };

    it("confirms valid report integrity when hashes match stored content", () => {
      const result = verifyReportIntegrity(mockReport);
      expect(result.valid).toBe(true);
      expect(result.verifiedCount).toBe(1);
      expect(result.totalCount).toBe(1);
      expect(result.artifacts[0].valid).toBe(true);
      expect(result.reportHash).toBeDefined();
    });

    it("detects tampered artifact where content was modified after hash creation", () => {
      const tamperedReport = {
        ...mockReport,
        artifacts: [
          {
            ...mockReport.artifacts[0],
            content: "Tampered malicious patch content here!",
            // Stored sha256 is the old sha
            sha256: validDiffSha,
          },
        ],
      };

      const result = verifyReportIntegrity(tamperedReport);
      expect(result.valid).toBe(false);
      expect(result.verifiedCount).toBe(0);
      expect(result.artifacts[0].valid).toBe(false);
      expect(result.artifacts[0].computedSha256).not.toBe(validDiffSha);
    });
  });
});
