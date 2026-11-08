import { describe, it, expect } from "vitest";
import { redactSecrets } from "@/lib/redact.js";

describe("redact — Secrets Redactor", () => {
  it("redacts Anthropic API keys", () => {
    const input = "Calling Claude with key sk-ant-api03-abcdef1234567890abcdef1234567890-XYZ123";
    const output = redactSecrets(input);
    expect(output).not.toContain("sk-ant-api03");
    expect(output).toContain("[REDACTED_SECRET]");
  });

  it("redacts OpenAI API keys", () => {
    const input = "Authorization: Bearer sk-1234567890abcdef1234567890abcdef";
    const output = redactSecrets(input);
    expect(output).not.toContain("sk-1234567890");
    expect(output).toContain("[REDACTED");
  });

  it("redacts GitHub tokens (ghp_ and github_pat_)", () => {
    const input = "Cloning using token ghp_1234567890abcdef1234567890abcdef1234 and github_pat_11AAAAAAA0000000000000000000000000000000000000000000000000";
    const output = redactSecrets(input);
    expect(output).not.toContain("ghp_1234567890");
    expect(output).not.toContain("github_pat_11");
    expect(output).toContain("[REDACTED_SECRET]");
  });

  it("redacts AWS access key IDs", () => {
    const input = "Configured AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE for S3";
    const output = redactSecrets(input);
    expect(output).not.toContain("AKIAIOSFODNN7EXAMPLE");
    expect(output).toContain("[REDACTED_SECRET]");
  });

  it("redacts Bearer tokens in headers", () => {
    const input = "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0";
    const output = redactSecrets(input);
    expect(output).not.toContain("eyJhbGciOi");
    expect(output).toContain("Bearer [REDACTED_TOKEN]");
  });

  it("redacts basic auth credentials in URLs", () => {
    const input = "Connecting to https://admin:SuperSecretPassword123@db.internal:5432/main";
    const output = redactSecrets(input);
    expect(output).not.toContain("SuperSecretPassword123");
    expect(output).toContain("https://admin:[REDACTED]@db.internal:5432/main");
  });

  it("redacts PEM private keys", () => {
    const input = `
Certificate received:
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0Y1+examplePrivateKeystring
morePrivateLinesHere1234567890
-----END RSA PRIVATE KEY-----
Connection closed.`;
    const output = redactSecrets(input);
    expect(output).not.toContain("examplePrivateKeystring");
    expect(output).toContain("[REDACTED_SECRET]");
  });

  it("handles null, undefined, or empty text without throwing", () => {
    expect(redactSecrets("")).toBe("");
    expect(redactSecrets(null)).toBe("");
    expect(redactSecrets(undefined)).toBe("");
  });
});
