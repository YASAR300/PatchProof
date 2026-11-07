/**
 * Anthropic Messages API client implemented using native fetch.
 * Enforces a 30-second timeout, one automatic retry on network/5xx errors, and graceful error messages.
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";
const TIMEOUT_MS = 30000;

/**
 * Performs a single fetch request to the Anthropic Messages API with timeout.
 */
async function sendRequest({ systemPrompt, userMessage, apiKey, model }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: model || process.env.AI_MODEL || DEFAULT_MODEL,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorBody = {};
      try {
        errorBody = await res.json();
      } catch {
        errorBody = { message: await res.text().catch(() => "Unknown error") };
      }

      const errorMessage = errorBody?.error?.message || errorBody?.message || res.statusText;

      if (res.status === 401 || res.status === 403) {
        const err = new Error(
          `Anthropic API authentication failed (HTTP ${res.status}): Invalid or unauthorized ANTHROPIC_API_KEY. ${errorMessage}`
        );
        err.statusCode = res.status;
        err.isAuthError = true;
        throw err;
      }

      const err = new Error(`Anthropic API error (HTTP ${res.status}): ${errorMessage}`);
      err.statusCode = res.status;
      err.isServerOrNetwork = res.status >= 500;
      throw err;
    }

    const data = await res.json();
    const textBlock = data?.content?.find((block) => block.type === "text") || data?.content?.[0];
    if (!textBlock || !textBlock.text) {
      throw new Error("Anthropic API returned an empty or invalid text response block.");
    }

    return textBlock.text;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      const timeoutErr = new Error("Anthropic API request timed out after 30 seconds.");
      timeoutErr.isServerOrNetwork = true;
      throw timeoutErr;
    }
    throw err;
  }
}

/**
 * Calls Anthropic Messages API with one retry on transient network or 5xx server errors.
 *
 * @param {object} params
 * @param {string} params.systemPrompt
 * @param {string} params.userMessage
 * @param {string} params.apiKey
 * @param {string} [params.model]
 * @returns {Promise<string>} Model response text
 */
export async function callAnthropicMessages({ systemPrompt, userMessage, apiKey, model }) {
  if (!apiKey || typeof apiKey !== "string") {
    throw new Error("No ANTHROPIC_API_KEY provided.");
  }

  try {
    return await sendRequest({ systemPrompt, userMessage, apiKey, model });
  } catch (firstErr) {
    // If it's an auth error (401/403) or client error (400), don't retry - fail immediately
    if (firstErr.isAuthError || (firstErr.statusCode && firstErr.statusCode < 500 && firstErr.statusCode !== 429)) {
      throw firstErr;
    }

    console.warn("[Anthropic API] First attempt failed. Retrying once after 1s delay:", firstErr.message);

    // Wait 1 second before one retry
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      return await sendRequest({ systemPrompt, userMessage, apiKey, model });
    } catch (retryErr) {
      console.error("[Anthropic API] Retry attempt also failed:", retryErr.message);
      throw retryErr;
    }
  }
}

