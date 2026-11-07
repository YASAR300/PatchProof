#!/usr/bin/env node
import crypto from "node:crypto";
import http from "node:http";
import { prisma } from "../src/lib/db.js";
import { encryptSecret, decryptSecret, generateWebhookSecret } from "../src/lib/crypto.js";

/**
 * scripts/simulate-webhook.mjs
 * Sends signed or test GitHub pull_request webhooks to the PatchProof webhook endpoint.
 *
 * Usage:
 *   node scripts/simulate-webhook.mjs [options]
 *
 * Options:
 *   --url <endpointUrl>     Webhook target URL (default: http://localhost:3000/api/webhooks/github)
 *   --action <action>       PR action: opened | synchronize | reopened (default: synchronize)
 *   --pr <number>           PR number (default: 42)
 *   --commit <sha>          Head commit SHA or tag (default: da17102 [fix-good] or 9d13f9f [vulnerable])
 *   --regression            Simulate regression head commit (9d13f9f) against fixed finding
 *   --unsigned              Omit X-Hub-Signature-256 header (expects 401)
 *   --invalid-sig           Send invalid signature (expects 401)
 *   --replay                Send identical delivery ID twice to verify idempotency
 *   --not-allowed           Use an un-whitelisted repo to verify 'skipped: execution not allowed'
 */

async function main() {
  const args = process.argv.slice(2);
  const isUnsigned = args.includes("--unsigned");
  const isInvalidSig = args.includes("--invalid-sig");
  const isReplay = args.includes("--replay");
  const isNotAllowed = args.includes("--not-allowed");
  const isRegression = args.includes("--regression");

  const port = process.env.PORT || 3000;
  const targetUrl =
    args[args.indexOf("--url") + 1] ||
    `http://127.0.0.1:${port}/api/webhooks/github`;

  console.log("=== PATCHPROOF GITHUB WEBHOOK SIMULATOR ===");
  console.log(`Target endpoint: ${targetUrl}`);

  // 1. Resolve project from database
  let project = await prisma.project.findFirst({
    where: {
      OR: [
        { name: "LOOPWISE" },
        { repoName: "demo-target" },
        { isDemo: true },
      ],
    },
  });

  if (!project) {
    project = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } });
  }

  if (!project) {
    throw new Error("No projects found in database. Create or seed a project first.");
  }

  console.log(`Target project: ${project.name} (${project.repoOwner}/${project.repoName})`);

  // 2. Ensure project has a webhook secret
  let plainSecret = "";
  if (!project.webhookSecretEncrypted) {
    console.log("Project has no webhook secret configured. Generating new secret...");
    plainSecret = generateWebhookSecret();
    const enc = encryptSecret(plainSecret);
    await prisma.project.update({
      where: { id: project.id },
      data: { webhookSecretEncrypted: enc },
    });
    console.log(`Generated & saved webhook secret for ${project.name}`);
  } else {
    plainSecret = decryptSecret(project.webhookSecretEncrypted);
  }

  // 3. Prepare PR commit SHA
  let headSha = "da17102"; // fix-good
  if (isRegression) {
    headSha = "9d13f9f"; // vulnerable baseline
    console.log("Mode: --regression (head commit: 9d13f9f -> re-introduces SQLi)");
  }

  const customCommitIdx = args.indexOf("--commit");
  if (customCommitIdx !== -1 && args[customCommitIdx + 1]) {
    headSha = args[customCommitIdx + 1];
  }

  // 4. Construct sample GitHub pull_request payload
  const repoOwner = isNotAllowed ? "untrusted-org" : project.repoOwner;
  const repoName = isNotAllowed ? "untrusted-repo" : project.repoName;
  const prNumber = parseInt(args[args.indexOf("--pr") + 1] || "42", 10);
  const action = args[args.indexOf("--action") + 1] || "synchronize";

  const payloadObject = {
    action,
    number: prNumber,
    pull_request: {
      id: 987654321,
      number: prNumber,
      state: "open",
      title: isRegression ? "feat: revert database queries" : "fix(security): resolve SQL concatenation",
      html_url: `https://github.com/${repoOwner}/${repoName}/pull/${prNumber}`,
      head: {
        sha: headSha,
        ref: "patch-review-branch",
        repo: {
          full_name: `${repoOwner}/${repoName}`,
        },
      },
      base: {
        sha: "9d13f9f",
        ref: project.defaultBranch || "main",
      },
    },
    repository: {
      id: 12345678,
      name: repoName,
      full_name: `${repoOwner}/${repoName}`,
      owner: {
        login: repoOwner,
      },
    },
    sender: {
      login: "developer-alice",
    },
  };

  const rawBody = JSON.stringify(payloadObject, null, 2);
  const deliveryId = `deliv-sim-${crypto.randomBytes(8).toString("hex")}`;

  // 5. Compute HMAC SHA-256 signature
  let signatureHeader = "";
  if (!isUnsigned) {
    if (isInvalidSig) {
      signatureHeader = "sha256=invalid_signature_hex_00000000000000000000000000000000000000000000";
    } else {
      const hmac = crypto.createHmac("sha256", plainSecret);
      hmac.update(rawBody);
      signatureHeader = `sha256=${hmac.digest("hex")}`;
    }
  }

  async function sendWebhook(delId, sig) {
    const headers = {
      "Content-Type": "application/json",
      "User-Agent": "GitHub-Hookshot/simulated",
      "X-GitHub-Event": "pull_request",
      "X-GitHub-Delivery": delId,
    };

    if (sig) {
      headers["X-Hub-Signature-256"] = sig;
    }

    console.log(`\nDispatching request -> [${delId}]`);
    console.log(`Event: pull_request | Action: ${action} | PR: #${prNumber}`);
    console.log(`Signature: ${sig ? sig.slice(0, 24) + "..." : "(none)"}`);

    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: rawBody,
    });

    const status = res.status;
    let bodyJson = {};
    try {
      bodyJson = await res.json();
    } catch {
      bodyJson = { text: await res.text().catch(() => "") };
    }

    console.log(`Response Status: HTTP ${status}`);
    console.log(`Response Body:`, JSON.stringify(bodyJson, null, 2));
    return { status, body: bodyJson };
  }

  // First delivery
  const result1 = await sendWebhook(deliveryId, signatureHeader);

  // If testing replay / idempotency
  if (isReplay) {
    console.log("\n[--replay] Sending duplicate webhook with identical X-GitHub-Delivery...");
    const result2 = await sendWebhook(deliveryId, signatureHeader);
    if (result2.status === 200 && result2.body?.idempotent) {
      console.log("✓ Idempotency verified: duplicate delivery returned HTTP 200 with cached outcome.");
    } else {
      console.warn("⚠️ Idempotency check did not return expected cached response!");
    }
  }

  console.log("\nSimulation complete.");
}

main().catch((err) => {
  console.error("Simulation script error:", err);
  process.exit(1);
});

