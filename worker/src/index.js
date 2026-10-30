import os from "node:os";
import process from "node:process";
import { prisma } from "./db.js";
import { getDockerVersion, getSandboxRuntime } from "./docker-info.js";
import { handleSelfTest } from "./handlers/selftest.js";

const WORKER_VERSION = "0.1.0";
const workerId = `worker-${os.hostname().toLowerCase().replace(/[^a-z0-9_-]/g, "-")}-${process.pid}`;
const workerStartedAt = new Date();

// Handler registry
const handlers = new Map();
handlers.set("selftest", handleSelfTest);

let activeJob = null;
let isShuttingDown = false;
let pollTimer = null;
let heartbeatTimer = null;
let staleCheckTimer = null;

console.log(`[worker] PatchProof Worker Service initialized (${workerId})`);
console.log(`[worker] Registered job handlers: ${Array.from(handlers.keys()).join(", ")}`);

/**
 * Creates an appendLog helper for the active job
 * @param {string} jobId
 */
function createJobLogger(jobId) {
  return async function appendLog(message) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${message}\n`;
    console.log(`[job:${jobId}] ${message}`);

    try {
      const current = await prisma.job.findUnique({
        where: { id: jobId },
        select: { logs: true },
      });
      await prisma.job.update({
        where: { id: jobId },
        data: { logs: (current?.logs || "") + line },
      });
    } catch (err) {
      console.warn(`[worker] Failed to append log to job ${jobId}:`, err.message);
    }
  };
}

/**
 * Sends worker heartbeat every 5 seconds
 */
async function sendHeartbeat() {
  if (isShuttingDown) return;
  try {
    const dockerVersion = await getDockerVersion();
    const runtime = getSandboxRuntime();

    await prisma.workerHeartbeat.upsert({
      where: { workerId },
      create: {
        workerId,
        hostname: os.hostname(),
        startedAt: workerStartedAt,
        lastSeenAt: new Date(),
        version: WORKER_VERSION,
        dockerVersion,
        runtime,
      },
      update: {
        lastSeenAt: new Date(),
        dockerVersion,
        runtime,
      },
    });
  } catch (err) {
    if (process.env.DEBUG_WORKER) {
      console.warn("[worker] Heartbeat update skipped:", err.message);
    }
  }
}

/**
 * Marks stale RUNNING jobs (no heartbeat for 60 seconds) as FAILED.
 */
async function sweepStaleJobs() {
  if (isShuttingDown) return;
  try {
    const staleThreshold = new Date(Date.now() - 60 * 1000);
    const stale = await prisma.job.updateMany({
      where: {
        status: "RUNNING",
        heartbeatAt: {
          lt: staleThreshold,
        },
      },
      data: {
        status: "FAILED",
        error: "Job timed out: no heartbeat received for 60 seconds",
        finishedAt: new Date(),
      },
    });
    if (stale.count > 0) {
      console.log(`[worker] Swept ${stale.count} stale abandoned job(s) to FAILED.`);
    }
  } catch {
    // Non-fatal
  }
}

/**
 * Claims a single queued job atomically using SELECT ... FOR UPDATE SKIP LOCKED
 */
async function claimNextJob() {
  try {
    return await prisma.$transaction(async (tx) => {
      let rows = [];
      try {
        rows = await tx.$queryRaw`
          SELECT id FROM "Job"
          WHERE "status" = 'QUEUED'::"JobStatus"
          ORDER BY "createdAt" ASC
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        `;
      } catch {
        // Fallback query if raw cast or SKIP LOCKED fails
        const candidate = await tx.job.findFirst({
          where: { status: "QUEUED" },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        });
        if (candidate) {
          rows = [candidate];
        }
      }

      if (!rows || rows.length === 0) {
        return null;
      }

      const jobId = rows[0].id;
      return await tx.job.update({
        where: { id: jobId },
        data: {
          status: "RUNNING",
          lockedBy: workerId,
          lockedAt: new Date(),
          startedAt: new Date(),
          heartbeatAt: new Date(),
          attempts: { increment: 1 },
        },
      });
    });
  } catch (err) {
    if (process.env.DEBUG_WORKER) {
      console.warn("[worker] Failed to claim job:", err.message);
    }
    return null;
  }
}

/**
 * Executes a claimed job with heartbeats, logging, and retry backoff
 * @param {object} job
 */
async function executeJob(job) {
  activeJob = job;
  const appendLog = createJobLogger(job.id);

  await appendLog(`Job ${job.id} claimed by worker ${workerId} (Attempt ${job.attempts}/${job.maxAttempts})`);

  // Active job heartbeat interval (every 5 seconds)
  const jobHeartbeatInterval = setInterval(async () => {
    try {
      await prisma.job.update({
        where: { id: job.id },
        data: { heartbeatAt: new Date() },
      });
    } catch {
      // ignore transient error
    }
  }, 5000);

  const handler = handlers.get(job.type);

  try {
    if (!handler) {
      throw new Error(`Unrecognized job type '${job.type}'. No handler registered.`);
    }

    const result = await handler(job, { appendLog });

    clearInterval(jobHeartbeatInterval);
    await appendLog(`Job completed successfully.`);

    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "SUCCEEDED",
        result,
        error: null,
        finishedAt: new Date(),
      },
    });
  } catch (err) {
    clearInterval(jobHeartbeatInterval);
    console.error(`[worker] Error executing job ${job.id}:`, err);
    await appendLog(`Execution error: ${err.message}`);

    if (job.attempts < job.maxAttempts) {
      const backoffDelay = Math.min(1000 * Math.pow(2, job.attempts), 30000);
      await appendLog(`Retry scheduled: attempt ${job.attempts}/${job.maxAttempts} failed. Backing off for ${backoffDelay / 1000}s...`);

      // Sleep backoff
      await new Promise((r) => setTimeout(r, backoffDelay));

      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "QUEUED",
          lockedBy: null,
          lockedAt: null,
          error: `Attempt ${job.attempts} failed: ${err.message}`,
        },
      });
    } else {
      await appendLog(`Job reached maximum retry threshold (${job.maxAttempts}). Marked as FAILED.`);
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          error: err.message,
          finishedAt: new Date(),
        },
      });
    }
  } finally {
    activeJob = null;
  }
}

/**
 * Main polling cycle (every 2 seconds)
 */
async function pollLoop() {
  if (isShuttingDown || activeJob) return;

  const job = await claimNextJob();
  if (job) {
    await executeJob(job);
  }
}

// Start timers
sendHeartbeat(); // Immediate first heartbeat
heartbeatTimer = setInterval(sendHeartbeat, 5000);
staleCheckTimer = setInterval(sweepStaleJobs, 15000);
pollTimer = setInterval(pollLoop, 2000);

/**
 * Graceful termination handler
 * @param {string} signal
 */
async function handleShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n[worker] Received ${signal}. Initiating graceful shutdown...`);

  clearInterval(pollTimer);
  clearInterval(heartbeatTimer);
  clearInterval(staleCheckTimer);

  if (activeJob) {
    console.log(`[worker] Waiting for active job ${activeJob.id} to wrap up...`);
    // Wait up to 10 seconds for completion
    const waitStart = Date.now();
    while (activeJob && Date.now() - waitStart < 10000) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  try {
    await prisma.$disconnect();
  } catch {
    // ignore
  }

  console.log("[worker] Shutdown complete. Goodbye.");
  process.exit(0);
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

