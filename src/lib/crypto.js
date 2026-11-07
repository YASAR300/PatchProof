import crypto from "node:crypto";

/**
 * Derives a consistent 32-byte buffer for AES-256-GCM from APP_ENCRYPTION_KEY or fallbacks.
 */
function getEncryptionKey() {
  const secret =
    process.env.APP_ENCRYPTION_KEY ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "patchproof-default-app-encryption-key-32bytes!";

  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Generates a cryptographically random 32-byte secret as a 64-character hex string.
 * @returns {string}
 */
export function generateWebhookSecret() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Encrypts a plaintext secret string using AES-256-GCM.
 * Format: `${ivHex}:${authTagHex}:${ciphertextHex}`
 *
 * @param {string} plaintext
 * @returns {string} Encrypted bundle
 */
export function encryptSecret(plaintext) {
  if (!plaintext || typeof plaintext !== "string") {
    throw new Error("Invalid plaintext provided for encryption");
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // standard 96-bit IV for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts an AES-256-GCM encrypted bundle created by encryptSecret.
 *
 * @param {string} encryptedBundle
 * @returns {string} Plaintext secret
 */
export function decryptSecret(encryptedBundle) {
  if (!encryptedBundle || typeof encryptedBundle !== "string") {
    throw new Error("Invalid encrypted bundle provided for decryption");
  }

  const parts = encryptedBundle.split(":");
  if (parts.length !== 3) {
    throw new Error("Malformed encrypted bundle. Expected 'iv:authTag:ciphertext'");
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * Verifies a GitHub X-Hub-Signature-256 header using HMAC-SHA256 and constant-time comparison.
 *
 * @param {string|Buffer} rawBody The raw request payload body
 * @param {string} signatureHeader The 'X-Hub-Signature-256' header value (e.g. 'sha256=abcdef...')
 * @param {string} secret The unencrypted webhook secret
 * @returns {boolean} True if signature matches, false otherwise
 */
export function verifyGitHubWebhookSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) {
    return false;
  }

  if (!signatureHeader.startsWith("sha256=")) {
    return false;
  }

  const providedSignature = signatureHeader.slice(7).trim().toLowerCase();
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(typeof rawBody === "string" ? Buffer.from(rawBody, "utf8") : rawBody);
  const expectedSignature = hmac.digest("hex").toLowerCase();

  if (providedSignature.length !== expectedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(providedSignature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
}

