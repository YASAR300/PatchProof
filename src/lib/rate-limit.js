/**
 * In-memory sliding-window token / request rate limiter.
 *
 * NOTE ON ARCHITECTURE:
 * In serverless deployments (such as Vercel), each ephemeral instance maintains its
 * own local window in memory. For globally distributed strict limits, Redis or a database
 * backing store can be plugged in. For this application's threat model, this in-memory
 * sliding-window bucket effectively throttles burst spam and brute-force attempts per instance,
 * with periodic self-cleaning to prevent memory leaks.
 */

class MemoryRateLimiter {
  constructor() {
    /** @type {Map<string, number[]>} key -> array of request timestamps in ms */
    this.hits = new Map();

    // Periodically evict expired buckets every 60 seconds
    if (typeof setInterval !== "undefined") {
      const timer = setInterval(() => {
        this.cleanup(60000);
      }, 60000);
      if (timer.unref) timer.unref();
    }
  }

  /**
   * Checks if an action is permitted under the rate limit.
   * @param {string} key Unique identifier (e.g. IP, user ID, or combined)
   * @param {number} maxRequests Maximum allowed requests in the time window
   * @param {number} windowMs Window duration in milliseconds (default 60000 = 1 minute)
   * @returns {{ success: boolean, limit: number, remaining: number, resetMs: number }}
   */
  check(key, maxRequests = 30, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;

    let timestamps = this.hits.get(key) || [];
    // Filter out timestamps outside the active window
    timestamps = timestamps.filter((t) => t > windowStart);

    if (timestamps.length >= maxRequests) {
      const oldest = timestamps[0];
      const resetMs = Math.max(0, oldest + windowMs - now);
      this.hits.set(key, timestamps);
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        resetMs,
      };
    }

    timestamps.push(now);
    this.hits.set(key, timestamps);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - timestamps.length,
      resetMs: windowMs,
    };
  }

  /**
   * Removes stale entries older than the longest typical window.
   */
  cleanup(maxAgeMs = 300000) {
    const cutoff = Date.now() - maxAgeMs;
    for (const [key, timestamps] of this.hits.entries()) {
      const valid = timestamps.filter((t) => t > cutoff);
      if (valid.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, valid);
      }
    }
  }

  /**
   * Resets limit for a key (primarily for unit tests).
   */
  reset(key) {
    if (key) {
      this.hits.delete(key);
    } else {
      this.hits.clear();
    }
  }
}

export const rateLimiter = new MemoryRateLimiter();

/**
 * Helper to extract client IP from incoming Next.js Request headers.
 */
export function getClientIp(req) {
  if (!req?.headers) return "127.0.0.1";
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}
