import { describe, it, expect } from "vitest";
import crypto from "node:crypto";
import {
  generateWebhookSecret,
  encryptSecret,
  decryptSecret,
  verifyGitHubWebhookSignature,
} from "@/lib/crypto.js";

describe("webhook — HMAC Signature Verifier & Secret Encryption", () => {
  const secret = "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0";
  const payload = JSON.stringify({
    action: "opened",
    pull_request: { number: 42, title: "Fix SQL injection" },
  });

  function signPayload(body, key) {
    const hmac = crypto.createHmac("sha256", key);
    hmac.update(Buffer.from(body, "utf8"));
    return `sha256=${hmac.digest("hex")}`;
  }

  it("successfully verifies valid HMAC SHA-256 signature", () => {
    const validHeader = signPayload(payload, secret);
    const isValid = verifyGitHubWebhookSignature(payload, validHeader, secret);
    expect(isValid).toBe(true);
  });

  it("rejects invalid signature with wrong secret", () => {
    const header = signPayload(payload, "wrong-secret-key-123");
    const isValid = verifyGitHubWebhookSignature(payload, header, secret);
    expect(isValid).toBe(false);
  });

  it("rejects tampered payload where body does not match signature", () => {
    const header = signPayload(payload, secret);
    const tamperedPayload = JSON.stringify({
      action: "opened",
      pull_request: { number: 42, title: "Tampered malicious title" },
    });
    const isValid = verifyGitHubWebhookSignature(tamperedPayload, header, secret);
    expect(isValid).toBe(false);
  });

  it("rejects missing signature header or missing secret", () => {
    expect(verifyGitHubWebhookSignature(payload, null, secret)).toBe(false);
    expect(verifyGitHubWebhookSignature(payload, "", secret)).toBe(false);
    expect(verifyGitHubWebhookSignature(payload, "sha256=abc", null)).toBe(false);
  });

  it("rejects header without sha256= prefix", () => {
    const hmacHex = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    expect(verifyGitHubWebhookSignature(payload, hmacHex, secret)).toBe(false);
  });

  describe("Secret Encryption & Decryption", () => {
    it("round-trips secret encryption with AES-256-GCM and unique IVs", () => {
      const generatedSecret = generateWebhookSecret();
      expect(generatedSecret.length).toBe(64);

      const enc1 = encryptSecret(generatedSecret);
      const enc2 = encryptSecret(generatedSecret);

      // Ciphertexts should differ due to distinct random IVs
      expect(enc1).not.toBe(enc2);

      const dec1 = decryptSecret(enc1);
      const dec2 = decryptSecret(enc2);
      expect(dec1).toBe(generatedSecret);
      expect(dec2).toBe(generatedSecret);
    });
  });
});
