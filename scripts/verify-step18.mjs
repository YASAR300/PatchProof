/**
 * Automated Verification Script for Step 18 Hardening & Security
 */

import { redactSecrets } from "../src/lib/redact.js";
import { isAllowedExternalUrl, isPrivateOrLocalAddress } from "../src/lib/ssrf.js";
import { rateLimiter } from "../src/lib/rate-limit.js";
import { verifyGitHubWebhookSignature } from "../src/lib/crypto.js";
import { classifyRuns } from "../src/lib/classify.js";
import { decidePatchVerdict } from "../src/lib/verdict.js";
import { parseSecurityReport } from "../src/lib/importers/detect.js";
import { computeSha256, canonicalJsonStringify } from "../src/lib/report.js";

let passedCount = 0;
let totalCount = 0;

function assert(condition, message) {
  totalCount++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
    passedCount++;
  }
}

async function run() {
  console.log("=== Step 18 Security & Hardening Automated Verification ===\n");

  // 1. SSRF Guard Verification
  console.log("--- 1. SSRF Guard Checks ---");
  assert(isAllowedExternalUrl("https://api.github.com/repos/owner/repo"), "api.github.com is allowed");
  assert(isAllowedExternalUrl("https://github.com/owner/repo"), "github.com is allowed");
  assert(isAllowedExternalUrl("https://api.osv.dev/v1/query"), "api.osv.dev is allowed");
  assert(isAllowedExternalUrl("https://api.anthropic.com/v1/messages"), "api.anthropic.com is allowed");

  assert(!isAllowedExternalUrl("http://localhost:3000/api/keys"), "localhost is blocked");
  assert(!isAllowedExternalUrl("http://127.0.0.1:8080/internal"), "127.0.0.1 loopback is blocked");
  assert(!isAllowedExternalUrl("http://169.254.169.254/latest/meta-data"), "AWS/GCP metadata IP 169.254.169.254 is blocked");
  assert(!isAllowedExternalUrl("http://10.0.0.1/admin"), "Private class A 10.0.0.0/8 is blocked");
  assert(!isAllowedExternalUrl("http://192.168.1.1/router"), "Private class C 192.168.0.0/16 is blocked");
  assert(!isAllowedExternalUrl("http://172.16.0.1/secret"), "Private class B 172.16.0.0/12 is blocked");
  assert(!isAllowedExternalUrl("https://evil-attacker-site.com/callback"), "Unlisted external domain is blocked");
  assert(!isAllowedExternalUrl("file:///etc/passwd"), "file:// protocol is blocked");

  // 2. Secrets Redactor Verification
  console.log("\n--- 2. Secrets Redaction Checks ---");
  const sampleLog = "Error with key sk-ant-api03-secret12345678901234567890-test and ghp_111122223333444455556666777788889999 and Bearer mySecretToken1234567890=";
  const redacted = redactSecrets(sampleLog);
  assert(!redacted.includes("sk-ant-api03"), "Anthropic key is redacted from logs");
  assert(!redacted.includes("ghp_1111"), "GitHub token is redacted from logs");
  assert(!redacted.includes("mySecretToken1234567890"), "Bearer token is redacted from logs");
  assert(redacted.includes("[REDACTED"), "Redaction marker is present");

  // 3. Webhook Signature Verifier
  console.log("\n--- 3. Webhook Signature Verifier Checks ---");
  const webhookSecret = "test-webhook-secret-key-32-bytes-minimum-ok!";
  const payload = '{"action":"synchronize","pull_request":{"id":123}}';
  const crypto = await import("node:crypto");
  const validHmac = `sha256=${crypto.createHmac("sha256", webhookSecret).update(payload).digest("hex")}`;
  const tamperedHmac = `sha256=${crypto.createHmac("sha256", "wrong-secret").update(payload).digest("hex")}`;

  assert(verifyGitHubWebhookSignature(payload, validHmac, webhookSecret), "Valid webhook signature verified");
  assert(!verifyGitHubWebhookSignature(payload, tamperedHmac, webhookSecret), "Tampered signature rejected");
  assert(!verifyGitHubWebhookSignature(payload + "tampered", validHmac, webhookSecret), "Tampered payload rejected");
  assert(!verifyGitHubWebhookSignature(payload, null, webhookSecret), "Missing signature header rejected");

  // 4. Rate Limiter Verification
  console.log("\n--- 4. In-Memory Rate Limiter Checks ---");
  rateLimiter.reset();
  const testKey = "test-rate-key";
  let allowed = true;
  for (let i = 0; i < 5; i++) {
    const res = rateLimiter.check(testKey, 5, 10000);
    if (!res.success) allowed = false;
  }
  assert(allowed, "First 5 requests within limit are allowed");
  const overLimit = rateLimiter.check(testKey, 5, 10000);
  assert(!overLimit.success, "6th request exceeding limit is rejected (HTTP 429)");

  // 5. Canonical JSON & Integrity
  console.log("\n--- 5. Canonical Document Hashing Checks ---");
  const jsonA = canonicalJsonStringify({ z: 1, a: 2, m: { y: 10, x: 20 } });
  const jsonB = canonicalJsonStringify({ a: 2, z: 1, m: { x: 20, y: 10 } });
  assert(jsonA === jsonB, "Canonical JSON stringify is order-independent");
  assert(computeSha256(jsonA).length === 64, "SHA-256 digest is exactly 64 hex characters");

  console.log(`\n=== Verification Results: ${passedCount}/${totalCount} assertions passed ===\n`);
  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
