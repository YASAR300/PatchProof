/**
 * GitHub Status & PR Comment Reporting Service.
 * Sets commit statuses and creates/updates a single PR verification comment.
 * Automatically retries once on network/API failure and logs results.
 */

import { safeFetch } from "./ssrf.js";

const GITHUB_API_URL = "https://api.github.com";
const STATUS_CONTEXT = "patchproof/verification";
const COMMENT_MARKER = "<!-- patchproof-pr-comment -->";

/**
 * Helper to execute a fetch request with 1 retry on error.
 */
async function fetchWithRetry(url, options, maxRetries = 1) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await safeFetch(url, options);
      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new Error(`GitHub API error HTTP ${res.status}: ${errorText}`);
      }
      return await res.json().catch(() => ({}));
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        console.warn(`[github-reporter] Attempt ${attempt + 1} failed (${err.message}). Retrying in 1s...`);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }
  throw lastError;
}

/**
 * Sets a commit status on GitHub for context 'patchproof/verification'.
 *
 * @param {object} params
 * @param {string} params.owner
 * @param {string} params.repo
 * @param {string} params.sha
 * @param {"pending"|"success"|"failure"} params.state
 * @param {string} params.description
 * @param {string} [params.targetUrl]
 * @param {string} [params.token]
 */
export async function setCommitStatus({
  owner,
  repo,
  sha,
  state,
  description,
  targetUrl,
  token,
}) {
  const botToken = token || process.env.GITHUB_BOT_TOKEN;
  if (!botToken) {
    console.log("[github-reporter] GITHUB_BOT_TOKEN not configured; skipping commit status update.");
    return { skipped: true, reason: "No GITHUB_BOT_TOKEN configured" };
  }

  const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/statuses/${sha}`;
  const payload = {
    state,
    target_url: targetUrl || process.env.APP_URL || "https://patchproof-three.vercel.app",
    description: String(description || "").slice(0, 140),
    context: STATUS_CONTEXT,
  };

  try {
    const data = await fetchWithRetry(url, {
      method: "POST",
      headers: {
        Authorization: `token ${botToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "PatchProof-Verification-Bot",
      },
      body: JSON.stringify(payload),
    });
    console.log(`[github-reporter] Commit status updated to '${state}' for ${owner}/${repo}@${sha.slice(0, 7)}`);
    return { ok: true, data };
  } catch (err) {
    console.error(`[github-reporter] Failed to update commit status for ${sha.slice(0, 7)}:`, err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Creates or updates a single PR comment with a compact table of findings and results.
 *
 * @param {object} params
 * @param {string} params.owner
 * @param {string} params.repo
 * @param {number} params.pullNumber
 * @param {string} params.headSha
 * @param {Array<object>} params.findings
 * @param {boolean} params.hasRegression
 * @param {string} [params.monitoringUrl]
 * @param {string} [params.token]
 */
export async function postOrUpdatePrComment({
  owner,
  repo,
  pullNumber,
  headSha,
  findings = [],
  hasRegression = false,
  monitoringUrl,
  token,
}) {
  const botToken = token || process.env.GITHUB_BOT_TOKEN;
  if (!botToken) {
    console.log("[github-reporter] GITHUB_BOT_TOKEN not configured; skipping PR comment update.");
    return { skipped: true, reason: "No GITHUB_BOT_TOKEN configured" };
  }

  const appUrl = process.env.APP_URL || "https://patchproof-three.vercel.app";
  const link = monitoringUrl || `${appUrl}/app/repositories`;

  // Build compact Markdown table
  const lines = [
    COMMENT_MARKER,
    `### 🛡️ PatchProof Verification Report`,
    ``,
    `**Commit:** \`${headSha.slice(0, 7)}\` | **Status:** ${
      hasRegression ? "⚠️ **REGRESSION ALERT DETECTED**" : "✅ **ALL TESTS PASSED**"
    }`,
    ``,
    `| Finding | Stored Baseline | PR Head Result | Verdict |`,
    `| :--- | :--- | :--- | :--- |`,
  ];

  if (findings.length === 0) {
    lines.push(`| *No prior reproducible findings in project* | — | — | PASS |`);
  } else {
    for (const f of findings) {
      const icon = f.isRegression ? "🚨 REGRESSION" : f.reproduced ? "❌ REPRODUCED" : "✅ NEUTRALIZED";
      lines.push(
        `| [${f.title}](${appUrl}/app/findings/${f.id}) | \`${f.storedStatus}\` | \`${f.currentStatus}\` | ${icon} |`
      );
    }
  }

  lines.push(``);
  if (hasRegression) {
    lines.push(
      `> 🚨 **REGRESSION ALERT:** This pull request re-introduces a vulnerability that was previously marked \`FIX_VERIFIED\`. Please inspect the reproduction harness before merging.`
    );
    lines.push(``);
  }

  lines.push(`[👉 View Detailed Monitoring & Sandbox Evidence](${link})`);
  lines.push(``);
  lines.push(`*This report describes what was tested and what the results demonstrated. It is not a guarantee that the software is secure.*`);

  const commentBody = lines.join("\n");

  try {
    // 1. List existing comments to locate previous PatchProof comment
    const listUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/issues/${pullNumber}/comments`;
    const comments = await fetchWithRetry(listUrl, {
      method: "GET",
      headers: {
        Authorization: `token ${botToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "PatchProof-Verification-Bot",
      },
    });

    const existingComment = Array.isArray(comments)
      ? comments.find((c) => c.body && c.body.includes(COMMENT_MARKER))
      : null;

    if (existingComment) {
      // 2. Update existing comment
      const updateUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/issues/comments/${existingComment.id}`;
      const data = await fetchWithRetry(updateUrl, {
        method: "PATCH",
        headers: {
          Authorization: `token ${botToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "PatchProof-Verification-Bot",
        },
        body: JSON.stringify({ body: commentBody }),
      });
      console.log(`[github-reporter] Updated existing PR comment #${existingComment.id} for PR #${pullNumber}`);
      return { ok: true, action: "updated", commentId: existingComment.id, data };
    } else {
      // 3. Create new comment
      const createUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/issues/${pullNumber}/comments`;
      const data = await fetchWithRetry(createUrl, {
        method: "POST",
        headers: {
          Authorization: `token ${botToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "PatchProof-Verification-Bot",
        },
        body: JSON.stringify({ body: commentBody }),
      });
      console.log(`[github-reporter] Created new PR comment for PR #${pullNumber}`);
      return { ok: true, action: "created", data };
    }
  } catch (err) {
    console.error(`[github-reporter] Failed to post/update PR comment for PR #${pullNumber}:`, err.message);
    return { ok: false, error: err.message };
  }
}

