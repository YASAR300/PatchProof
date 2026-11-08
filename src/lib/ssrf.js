/**
 * Server-Side Request Forgery (SSRF) Guard
 *
 * Whitelists strictly allowed external domains:
 * - github.com
 * - api.github.com
 * - api.osv.dev
 * - api.anthropic.com
 *
 * Explicitly blocks private IP addresses, loopback addresses, metadata services,
 * and dangerous protocols.
 */

const ALLOWED_HOSTS = new Set([
  "github.com",
  "api.github.com",
  "api.osv.dev",
  "api.anthropic.com",
]);

/**
 * Checks if a hostname or IPv4/IPv6 string is a private or local address.
 * @param {string} hostname
 * @returns {boolean}
 */
export function isPrivateOrLocalAddress(hostname) {
  if (!hostname) return true;

  const normalized = hostname.toLowerCase().trim();

  // Localhost aliases
  if (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized === "127.0.0.1" ||
    normalized === "0.0.0.0" ||
    normalized === "::1" ||
    normalized === "[::1]" ||
    normalized === "ip6-localhost" ||
    normalized === "ip6-loopback"
  ) {
    return true;
  }

  // Cloud metadata endpoint
  if (normalized === "169.254.169.254") {
    return true;
  }

  // IPv4 dotted-quad check
  const ipv4Match = normalized.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const octets = [
      parseInt(ipv4Match[1], 10),
      parseInt(ipv4Match[2], 10),
      parseInt(ipv4Match[3], 10),
      parseInt(ipv4Match[4], 10),
    ];

    // Invalid octet
    if (octets.some((o) => o < 0 || o > 255)) return true;

    // 127.0.0.0/8 (Loopback)
    if (octets[0] === 127) return true;

    // 10.0.0.0/8 (Private)
    if (octets[0] === 10) return true;

    // 172.16.0.0/12 (Private)
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;

    // 192.168.0.0/16 (Private)
    if (octets[0] === 192 && octets[1] === 168) return true;

    // 169.254.0.0/16 (Link Local / Metadata)
    if (octets[0] === 169 && octets[1] === 254) return true;

    // 0.0.0.0/8 (Current network)
    if (octets[0] === 0) return true;

    // 100.64.0.0/10 (Carrier-grade NAT)
    if (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127) return true;
  }

  return false;
}

/**
 * Validates that a target URL is strictly permitted by the SSRF whitelist.
 * @param {string|URL} urlTarget
 * @returns {boolean}
 */
export function isAllowedExternalUrl(urlTarget) {
  try {
    const parsed = typeof urlTarget === "string" ? new URL(urlTarget) : urlTarget;

    // Only allow http: and https: protocols
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }

    const host = parsed.hostname.toLowerCase();

    // Block private/local addresses
    if (isPrivateOrLocalAddress(host)) {
      return false;
    }

    // Check against strict whitelist
    return ALLOWED_HOSTS.has(host);
  } catch {
    return false;
  }
}

/**
 * Wraps global fetch with SSRF verification.
 * Throws an Error if destination URL is not explicitly allowed.
 */
export async function safeFetch(urlTarget, options = {}) {
  const urlStr = typeof urlTarget === "string" ? urlTarget : urlTarget.toString();
  if (!isAllowedExternalUrl(urlStr)) {
    throw new Error(
      `SSRF Guard: Request blocked. Target URL '${urlStr}' is not on the allowed outbound domain list.`
    );
  }

  return fetch(urlTarget, options);
}
