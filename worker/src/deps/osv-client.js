import { compareVersions } from "./version-utils.js";

const OSV_BATCH_URL = "https://api.osv.dev/v1/querybatch";
const OSV_VULN_URL = "https://api.osv.dev/v1/vulns/";
const DEFAULT_TIMEOUT_MS = 10000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Maps OSV / CVSS severity to PatchProof Severity enum:
 * CRITICAL, HIGH, MEDIUM, LOW, INFO or null (which UI displays as UNKNOWN)
 *
 * @param {object} vuln
 * @returns {string|null}
 */
export function extractSeverity(vuln) {
  if (!vuln) return null;

  // 1. Check database_specific severity (GitHub / OSV advisory severity string)
  const dbSeverity = String(
    vuln.database_specific?.severity || vuln.database_specific?.cvss?.severity || ""
  ).toUpperCase();

  if (dbSeverity === "CRITICAL") return "CRITICAL";
  if (dbSeverity === "HIGH") return "HIGH";
  if (dbSeverity === "MODERATE" || dbSeverity === "MEDIUM") return "MEDIUM";
  if (dbSeverity === "LOW") return "LOW";
  if (dbSeverity === "NONE") return "INFO";

  // 2. Check numeric CVSS score in database_specific
  const numScore = parseFloat(vuln.database_specific?.cvss?.score);
  if (!isNaN(numScore)) {
    if (numScore >= 9.0) return "CRITICAL";
    if (numScore >= 7.0) return "HIGH";
    if (numScore >= 4.0) return "MEDIUM";
    if (numScore > 0) return "LOW";
  }

  // 3. Check severity array for CVSS_V3 or CVSS_V2
  if (Array.isArray(vuln.severity)) {
    for (const item of vuln.severity) {
      if (item && item.score && typeof item.score === "string") {
        const scoreStr = item.score;
        // If it contains a numeric score prefix or vector
        const scoreMatch = scoreStr.match(/\b([0-9]\.[0-9])\b/);
        if (scoreMatch) {
          const val = parseFloat(scoreMatch[1]);
          if (val >= 9.0) return "CRITICAL";
          if (val >= 7.0) return "HIGH";
          if (val >= 4.0) return "MEDIUM";
          if (val > 0) return "LOW";
        }
      }
    }
  }

  // CVSS not present or unparsed -> returns null (displayed as UNKNOWN)
  return null;
}

/**
 * Extracts affected version range string from OSV affected object.
 * e.g. "< 2.32.4" or ">= 1.0.0, < 2.0.0"
 *
 * @param {object} affectedObj
 * @returns {string|null}
 */
export function extractAffectedRange(affectedObj) {
  if (!affectedObj || !Array.isArray(affectedObj.ranges)) {
    return null;
  }

  const parts = [];
  for (const range of affectedObj.ranges) {
    if (!Array.isArray(range.events)) continue;

    let introduced = null;
    let fixed = null;

    for (const evt of range.events) {
      if (evt.introduced && evt.introduced !== "0") {
        introduced = evt.introduced;
      }
      if (evt.fixed) {
        fixed = evt.fixed;
      }
    }

    if (introduced && fixed) {
      parts.push(`>= ${introduced}, < ${fixed}`);
    } else if (fixed) {
      parts.push(`< ${fixed}`);
    } else if (introduced) {
      parts.push(`>= ${introduced}`);
    }
  }

  return parts.length > 0 ? parts.join("; ") : null;
}

/**
 * Finds the lowest fixed version from OSV affected events that is higher than installedVersion.
 *
 * @param {object} affectedObj
 * @param {string} installedVersion
 * @returns {string|null}
 */
export function findLowestFixedVersion(affectedObj, installedVersion) {
  if (!affectedObj || !Array.isArray(affectedObj.ranges)) {
    return null;
  }

  const fixedVersions = [];

  for (const range of affectedObj.ranges) {
    if (!Array.isArray(range.events)) continue;
    for (const evt of range.events) {
      if (evt.fixed && typeof evt.fixed === "string") {
        fixedVersions.push(evt.fixed.trim());
      }
    }
  }

  if (fixedVersions.length === 0) return null;

  // Filter fixed versions that are greater than installed version
  const candidates = fixedVersions.filter((fixedVer) => {
    try {
      return compareVersions(fixedVer, installedVersion) > 0;
    } catch {
      return true;
    }
  });

  if (candidates.length === 0) {
    // If no candidate > installed, return the smallest overall fixed version
    fixedVersions.sort(compareVersions);
    return fixedVersions[0] || null;
  }

  candidates.sort(compareVersions);
  return candidates[0];
}

/**
 * Helper to execute a fetch request with timeout and 1 retry.
 *
 * @param {string} url
 * @param {object} options
 * @param {number} timeoutMs
 * @returns {Promise<Response>}
 */
async function fetchWithRetry(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${url}`);
      }
      return response;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt < 2) {
        // Wait 500ms before retry
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  throw new Error(`OSV API request failed after retry: ${lastError?.message || "Unknown error"}`);
}

/**
 * Queries OSV.dev batch API with 24-hour database caching.
 *
 * @param {Array<{ name: string, installedVersion: string, ecosystem: string }>} packages
 * @param {object} deps
 * @param {object} deps.prisma - Prisma client
 * @param {number} [deps.timeoutMs=10000]
 * @returns {Promise<Map<string, Array<object>>>} Map of `${ecosystem}:${name}@${version}` -> array of vuln summaries
 */
export async function queryOsvBatch(packages = [], { prisma, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  const resultsMap = new Map();
  if (packages.length === 0) return resultsMap;

  const now = new Date();
  const toQueryIndices = [];
  const queryPayload = [];

  // 1. Check cache for each package
  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i];
    const cacheKey = `osv:query:${pkg.ecosystem.toLowerCase()}:${pkg.name.toLowerCase()}@${pkg.installedVersion}`;

    let cached = null;
    try {
      if (prisma?.osvCache) {
        cached = await prisma.osvCache.findUnique({
          where: { cacheKey },
        });
      }
    } catch (err) {
      // Non-fatal cache read error
    }

    if (cached && cached.expiresAt > now) {
      const key = `${pkg.ecosystem}:${pkg.name}@${pkg.installedVersion}`;
      resultsMap.set(key, cached.data || []);
    } else {
      toQueryIndices.push({ index: i, pkg, cacheKey });
      queryPayload.push({
        package: {
          name: pkg.name,
          ecosystem: pkg.ecosystem,
        },
        version: pkg.installedVersion,
      });
    }
  }

  // 2. If all were cached, return immediately
  if (queryPayload.length === 0) {
    return resultsMap;
  }

  // 3. Batch query OSV API in chunks of up to 500
  const CHUNK_SIZE = 500;
  for (let offset = 0; offset < queryPayload.length; offset += CHUNK_SIZE) {
    const chunk = queryPayload.slice(offset, offset + CHUNK_SIZE);
    const chunkItems = toQueryIndices.slice(offset, offset + CHUNK_SIZE);

    const res = await fetchWithRetry(
      OSV_BATCH_URL,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queries: chunk }),
      },
      timeoutMs
    );

    const json = await res.json();
    const batchResults = json.results || [];

    for (let rIdx = 0; rIdx < chunkItems.length; rIdx++) {
      const { pkg, cacheKey } = chunkItems[rIdx];
      const matchObj = batchResults[rIdx] || {};
      const vulns = Array.isArray(matchObj.vulns) ? matchObj.vulns : [];

      const key = `${pkg.ecosystem}:${pkg.name}@${pkg.installedVersion}`;
      resultsMap.set(key, vulns);

      // Save to cache for 24 hours
      if (prisma?.osvCache) {
        try {
          await prisma.osvCache.upsert({
            where: { cacheKey },
            create: {
              cacheKey,
              data: vulns,
              expiresAt: new Date(Date.now() + CACHE_TTL_MS),
            },
            update: {
              data: vulns,
              expiresAt: new Date(Date.now() + CACHE_TTL_MS),
            },
          });
        } catch {
          // Non-fatal cache write error
        }
      }
    }
  }

  return resultsMap;
}

/**
 * Fetches vulnerability details with 24-hour database caching.
 *
 * @param {string} vulnId
 * @param {object} deps
 * @param {object} deps.prisma
 * @param {number} [deps.timeoutMs=10000]
 * @returns {Promise<object>}
 */
export async function fetchVulnDetails(vulnId, { prisma, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  if (!vulnId) return null;

  const cacheKey = `osv:vuln:${vulnId}`;
  const now = new Date();

  // Check cache
  if (prisma?.osvCache) {
    try {
      const cached = await prisma.osvCache.findUnique({
        where: { cacheKey },
      });
      if (cached && cached.expiresAt > now) {
        return cached.data;
      }
    } catch {
      // Non-fatal
    }
  }

  // Fetch from OSV
  const res = await fetchWithRetry(`${OSV_VULN_URL}${encodeURIComponent(vulnId)}`, {}, timeoutMs);
  const data = await res.json();

  // Save to cache
  if (prisma?.osvCache) {
    try {
      await prisma.osvCache.upsert({
        where: { cacheKey },
        create: {
          cacheKey,
          data,
          expiresAt: new Date(Date.now() + CACHE_TTL_MS),
        },
        update: {
          data,
          expiresAt: new Date(Date.now() + CACHE_TTL_MS),
        },
      });
    } catch {
      // Non-fatal
    }
  }

  return data;
}

