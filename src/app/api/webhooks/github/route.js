import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { decryptSecret, verifyGitHubWebhookSignature } from "@/lib/crypto";
import { checkPrExecutionAllowed } from "@/lib/execution-safety";
import { setCommitStatus } from "@/lib/github-reporter";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/github
 * Ingests GitHub webhooks, verifies HMAC signature with constant-time check,
 * ensures idempotency via delivery ID, checks execution safety, and enqueues 'pr-check' jobs.
 */
export async function POST(req) {
  try {
    const rawBody = await req.text();

    const signatureHeader = req.headers.get("x-hub-signature-256");
    const event = req.headers.get("x-github-event") || "unknown";
    const deliveryId =
      req.headers.get("x-github-delivery") ||
      `deliv-${crypto.randomBytes(16).toString("hex")}`;

    // 1. Never process unsigned payloads
    if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid X-Hub-Signature-256 header." },
        { status: 401 }
      );
    }

    // 2. Idempotency check: check if this delivery was already processed
    const existingDelivery = await prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
    });
    if (existingDelivery) {
      console.log(`[webhook] Delivery ${deliveryId} already recorded with outcome: ${existingDelivery.outcome}`);
      return NextResponse.json(
        {
          ok: true,
          idempotent: true,
          message: "Delivery already processed.",
          outcome: existingDelivery.outcome,
        },
        { status: 200 }
      );
    }

    // Parse JSON payload
    let payload = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Resolve project from repository metadata
    const repoData = payload.repository || {};
    const repoOwner = (repoData.owner?.login || repoData.owner?.name || "").trim().toLowerCase();
    const repoName = (repoData.name || "").trim().toLowerCase();
    const repoFullName = (repoData.full_name || `${repoOwner}/${repoName}`).trim().toLowerCase();

    // Look up project by repoOwner/repoName, slug, or matching repoUrl
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          {
            repoOwner: { equals: repoOwner, mode: "insensitive" },
            repoName: { equals: repoName, mode: "insensitive" },
          },
          { slug: { equals: repoName, mode: "insensitive" } },
          { slug: { equals: repoFullName.replace("/", "-"), mode: "insensitive" } },
          { repoUrl: { contains: repoFullName, mode: "insensitive" } },
        ],
      },
    });

    if (!project) {
      console.warn(`[webhook] No matching project found for repository '${repoFullName}'`);
      await prisma.webhookDelivery.create({
        data: {
          id: deliveryId,
          event,
          action: payload.action || null,
          outcome: "rejected: project not found",
          payload: { repo: repoFullName },
        },
      });
      return NextResponse.json(
        { error: `Unauthorized: No project found for repository '${repoFullName}'` },
        { status: 401 }
      );
    }

    // 3. Verify HMAC signature with constant-time comparison against per-project secret
    if (!project.webhookSecretEncrypted) {
      console.warn(`[webhook] Project '${project.name}' does not have a configured webhook secret`);
      await prisma.webhookDelivery.create({
        data: {
          id: deliveryId,
          projectId: project.id,
          event,
          action: payload.action || null,
          outcome: "rejected: secret not configured",
          payload: { repo: repoFullName },
        },
      });
      return NextResponse.json(
        { error: "Unauthorized: Webhook secret not configured for this project." },
        { status: 401 }
      );
    }

    let plainSecret = "";
    try {
      plainSecret = decryptSecret(project.webhookSecretEncrypted);
    } catch (err) {
      console.error(`[webhook] Failed to decrypt webhook secret for project ${project.id}:`, err.message);
      return NextResponse.json(
        { error: "Internal server error: failed to resolve secret" },
        { status: 500 }
      );
    }

    const isValidSignature = verifyGitHubWebhookSignature(
      rawBody,
      signatureHeader,
      plainSecret
    );

    if (!isValidSignature) {
      console.warn(`[webhook] Invalid signature for project '${project.name}' (${deliveryId})`);
      await prisma.webhookDelivery.create({
        data: {
          id: deliveryId,
          projectId: project.id,
          event,
          action: payload.action || null,
          outcome: "rejected: invalid signature",
          payload: { repo: repoFullName },
        },
      });
      return NextResponse.json(
        { error: "Unauthorized: Invalid X-Hub-Signature-256 signature." },
        { status: 401 }
      );
    }

    // 4. Handle only pull_request events with actions: opened, synchronize, reopened
    const action = payload.action || "";
    if (event !== "pull_request") {
      console.log(`[webhook] Ignoring non-pull_request event '${event}' with HTTP 200`);
      await prisma.webhookDelivery.create({
        data: {
          id: deliveryId,
          projectId: project.id,
          event,
          action: action || null,
          outcome: `ignored: non-PR event (${event})`,
          payload: { event, action },
        },
      });
      return NextResponse.json(
        { ok: true, message: `Ignored non-PR event '${event}'` },
        { status: 200 }
      );
    }

    const ALLOWED_ACTIONS = ["opened", "synchronize", "reopened"];
    if (!ALLOWED_ACTIONS.includes(action)) {
      console.log(`[webhook] Ignoring pull_request action '${action}' with HTTP 200`);
      await prisma.webhookDelivery.create({
        data: {
          id: deliveryId,
          projectId: project.id,
          event,
          action,
          outcome: `ignored: unhandled action (${action})`,
          payload: { pr: payload.pull_request?.number, action },
        },
      });
      return NextResponse.json(
        { ok: true, message: `Ignored unhandled pull_request action '${action}'` },
        { status: 200 }
      );
    }

    // 5. Execution safety check: executionEnabled must be true AND repo must be in EXECUTION_ALLOWED_REPOS
    const safety = checkPrExecutionAllowed(project);
    if (!safety.allowed) {
      console.log(`[webhook] Execution safety check failed for '${project.name}': ${safety.reason}`);
      await prisma.webhookDelivery.create({
        data: {
          id: deliveryId,
          projectId: project.id,
          event,
          action,
          outcome: "skipped: execution not allowed",
          payload: {
            pr: payload.pull_request?.number,
            head: payload.pull_request?.head?.sha,
            reason: safety.reason,
          },
        },
      });

      return NextResponse.json(
        {
          ok: true,
          outcome: "skipped: execution not allowed",
          message: "Execution safety check not met; PR check skipped.",
        },
        { status: 200 }
      );
    }

    // 6. Execution is permitted: enqueue 'pr-check' worker job
    const prData = payload.pull_request || {};
    const prNumber = prData.number;
    const headSha = prData.head?.sha;
    const baseSha = prData.base?.sha || project.defaultBranch;
    const prTitle = prData.title || `PR #${prNumber}`;
    const prUrl = prData.html_url || "";

    if (!headSha) {
      return NextResponse.json({ error: "Missing PR head commit SHA" }, { status: 400 });
    }

    // Create PullRequestCheck record in PENDING status
    const prCheck = await prisma.pullRequestCheck.create({
      data: {
        projectId: project.id,
        prNumber: prNumber || 0,
        prTitle,
        prUrl,
        headSha,
        baseSha,
        status: "PENDING",
        hasRegression: false,
        resultsSummary: "Verification job queued...",
        deliveryId,
      },
    });

    // Enqueue 'pr-check' job
    const job = await prisma.job.create({
      data: {
        type: "pr-check",
        status: "QUEUED",
        projectId: project.id,
        payload: {
          prCheckId: prCheck.id,
          projectId: project.id,
          prNumber,
          prTitle,
          prUrl,
          headSha,
          baseSha,
          deliveryId,
          repoOwner: project.repoOwner,
          repoName: project.repoName,
        },
      },
    });

    // Link job to prCheck
    await prisma.pullRequestCheck.update({
      where: { id: prCheck.id },
      data: { jobId: job.id },
    });

    // Record delivery outcome
    await prisma.webhookDelivery.create({
      data: {
        id: deliveryId,
        projectId: project.id,
        event,
        action,
        outcome: "enqueued: pr-check",
        payload: {
          prNumber,
          headSha,
          jobId: job.id,
          prCheckId: prCheck.id,
        },
      },
    });

    // Audit event: PR_CHECK_STARTED
    await prisma.auditEvent.create({
      data: {
        projectId: project.id,
        action: "PR_CHECK_STARTED",
        entityType: "PullRequestCheck",
        entityId: prCheck.id,
        metadata: {
          prNumber,
          headSha,
          jobId: job.id,
          deliveryId,
        },
      },
    });

    // Post pending commit status to GitHub if token configured
    const appUrl = process.env.APP_URL || "https://patchproof-three.vercel.app";
    await setCommitStatus({
      owner: project.repoOwner,
      repo: project.repoName,
      sha: headSha,
      state: "pending",
      description: "PatchProof verification running...",
      targetUrl: `${appUrl}/app/repositories/${project.id}`,
    });

    return NextResponse.json(
      {
        ok: true,
        outcome: "enqueued: pr-check",
        prCheckId: prCheck.id,
        jobId: job.id,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[api/webhooks/github] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error processing webhook" },
      { status: 500 }
    );
  }
}

