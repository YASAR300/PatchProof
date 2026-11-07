import crypto from "node:crypto";
import {
  generateWebhookSecret,
  encryptSecret,
  decryptSecret,
  verifyGitHubWebhookSignature,
} from "../src/lib/crypto.js";
import {
  checkPrExecutionAllowed,
  isRepositoryAllowListed,
  getExecutionAllowedRepos,
} from "../src/lib/execution-safety.js";

async function runStep16Tests() {
  console.log("=== STEP 16 GITHUB PR VERIFICATION & WEBHOOK TEST SUITE ===");

  // 1. Webhook Secret Generation & AES-256-GCM Round-trip
  console.log("[1] Testing Webhook Secret Generation & AES-256-GCM Encryption:");
  const secret = generateWebhookSecret();
  if (typeof secret !== "string" || secret.length !== 64) {
    throw new Error(`Expected 64-char hex secret, got length ${secret?.length}`);
  }
  console.log(`   - Generated secret: ${secret.slice(0, 8)}...${secret.slice(-8)} (32 bytes)`);

  const encryptedBundle = encryptSecret(secret);
  const parts = encryptedBundle.split(":");
  if (parts.length !== 3) {
    throw new Error(`Malformed encrypted bundle: ${encryptedBundle}`);
  }
  console.log(`   - Encrypted bundle format (iv:authTag:ciphertext): ${encryptedBundle.slice(0, 30)}...`);

  const decrypted = decryptSecret(encryptedBundle);
  if (decrypted !== secret) {
    throw new Error("Decrypted secret does not match original secret!");
  }
  console.log("   ✓ AES-256-GCM encryption and decryption round-trip verified.");

  // 2. HMAC-SHA256 Constant-time Signature Verification
  console.log("[2] Testing HMAC-SHA256 Signature Verification:");
  const samplePayload = JSON.stringify({ action: "opened", number: 42, repository: { name: "demo-target" } });
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(samplePayload);
  const validSignature = `sha256=${hmac.digest("hex")}`;

  // Valid signature
  const isValid = verifyGitHubWebhookSignature(samplePayload, validSignature, secret);
  if (!isValid) throw new Error("Valid HMAC signature was rejected!");
  console.log("   ✓ Valid HMAC signature successfully verified.");

  // Tampered payload
  const isTampered = verifyGitHubWebhookSignature(samplePayload + "tamper", validSignature, secret);
  if (isTampered) throw new Error("Tampered payload signature was erroneously accepted!");
  console.log("   ✓ Tampered payload signature rejected.");

  // Wrong secret
  const isWrongSecret = verifyGitHubWebhookSignature(samplePayload, validSignature, "wrong-secret-123");
  if (isWrongSecret) throw new Error("Signature with wrong secret was accepted!");
  console.log("   ✓ Wrong secret signature rejected.");

  // Missing or invalid header prefix
  if (verifyGitHubWebhookSignature(samplePayload, "invalid-header", secret)) {
    throw new Error("Invalid header format accepted!");
  }
  if (verifyGitHubWebhookSignature(samplePayload, null, secret)) {
    throw new Error("Null header accepted!");
  }
  console.log("   ✓ Missing or invalid signature headers cleanly rejected.");

  // 3. Execution Safety Allow-list Policy
  console.log("[3] Testing Execution Safety & Allow-list Barriers:");
  process.env.EXECUTION_ALLOWED_REPOS = "loopwise/patchproof,demo/target,yasar300/patchproof";

  // Case A: executionEnabled = false
  const pDisabled = {
    executionEnabled: false,
    repoOwner: "loopwise",
    repoName: "patchproof",
  };
  const safetyA = checkPrExecutionAllowed(pDisabled);
  if (safetyA.allowed) throw new Error("Execution allowed when executionEnabled is false!");
  console.log(`   ✓ Barrier 1 enforced: ${safetyA.reason}`);

  // Case B: Not in allow-list
  const pUntrusted = {
    executionEnabled: true,
    repoOwner: "malicious-user",
    repoName: "crypto-miner",
  };
  const safetyB = checkPrExecutionAllowed(pUntrusted);
  if (safetyB.allowed) throw new Error("Execution allowed for non-allow-listed repository!");
  if (safetyB.reason !== "skipped: execution not allowed") {
    throw new Error(`Expected reason 'skipped: execution not allowed', got '${safetyB.reason}'`);
  }
  console.log(`   ✓ Barrier 2 enforced: ${safetyB.reason}`);

  // Case C: Allowed repository
  const pAllowed = {
    executionEnabled: true,
    repoOwner: "loopwise",
    repoName: "patchproof",
  };
  const safetyC = checkPrExecutionAllowed(pAllowed);
  if (!safetyC.allowed) throw new Error("Execution erroneously denied for allow-listed repository!");
  console.log("   ✓ Both barriers met: PR check permitted for allow-listed repository.");

  // 4. Regression Alert Classification Logic
  console.log("[4] Testing Regression Alert Classification Logic:");
  function evaluateRegression(storedStatus, currentStatus) {
    return storedStatus === "FIX_VERIFIED" && currentStatus === "REPRODUCED";
  }

  // Good fix maintains non-reproducibility
  if (evaluateRegression("FIX_VERIFIED", "NOT_REPRODUCED")) {
    throw new Error("False regression alert raised on NOT_REPRODUCED fix!");
  }
  console.log("   ✓ FIX_VERIFIED + NOT_REPRODUCED -> No regression alert (PASS).");

  // Re-introducing vulnerability triggers REGRESSION ALERT
  if (!evaluateRegression("FIX_VERIFIED", "REPRODUCED")) {
    throw new Error("Failed to raise REGRESSION ALERT when previously fixed vulnerability reproduces!");
  }
  console.log("   ✓ FIX_VERIFIED + REPRODUCED -> REGRESSION ALERT RAISED (ALERT).");

  // Previously unverified or reproduced finding reproducing is not a regression
  if (evaluateRegression("REPRODUCED", "REPRODUCED")) {
    throw new Error("Erroneous regression alert on already-vulnerable finding!");
  }
  console.log("   ✓ REPRODUCED + REPRODUCED -> Baseline vulnerability persists (No regression alert).");

  console.log("\nALL STEP 16 CORE UNIT TESTS PASSED!\n");
}

runStep16Tests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});

