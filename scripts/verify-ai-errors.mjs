import assert from "node:assert";
import { callAnthropicMessages } from "../src/lib/ai/anthropic.js";

async function testInvalidKeyAuthError() {
  console.log("--> Testing callAnthropicMessages with an invalid key...");
  let caughtError = null;

  try {
    await callAnthropicMessages({
      systemPrompt: "You are a test assistant.",
      userMessage: "Hello",
      apiKey: "sk-ant-invalid-fake-key-for-testing",
      model: "claude-3-5-sonnet-20241022",
    });
  } catch (err) {
    caughtError = err;
  }

  assert(caughtError, "Expected callAnthropicMessages to throw an error for invalid key");
  console.log("Caught status code:", caughtError.statusCode);
  console.log("Caught isAuthError:", caughtError.isAuthError);
  console.log("Caught error message:", caughtError.message);

  assert.strictEqual(caughtError.statusCode, 401, "Expected HTTP 401 status code");
  assert.strictEqual(caughtError.isAuthError, true, "Expected isAuthError to be true");
  assert(
    caughtError.message.includes("401") || caughtError.message.includes("authentication"),
    "Expected message to describe authentication failure"
  );
  console.log("✔ Invalid key correctly throws clean 401 error with isAuthError: true (no 500 unhandled crash)!");
}

testInvalidKeyAuthError().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

