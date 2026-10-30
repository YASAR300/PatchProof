import { NextResponse } from "next/server";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";

const ALLOWED_JOB_TYPES = ["selftest"];

/**
 * GET /api/jobs?limit=&type=
 * Returns recent jobs along with worker status and queue metrics.
 */
export async function GET(req) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "10", 10), 1), 50);
    const type = searchParams.get("type");

    const where = type ? { type } : {};

    let jobs = [];
    let queueDepth = 0;
    let latestHeartbeat = null;

    try {
      jobs = await prisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    } catch (err) {
      console.warn("[api/jobs] Job findMany error:", err.message);
    }

    try {
      queueDepth = await prisma.job.count({
        where: { status: "QUEUED" },
      });
    } catch (err) {
      console.warn("[api/jobs] Queue count error:", err.message);
    }

    try {
      latestHeartbeat = await prisma.workerHeartbeat.findFirst({
        orderBy: { lastSeenAt: "desc" },
      });
    } catch (err) {
      console.warn("[api/jobs] WorkerHeartbeat query error:", err.message);
    }

    const isOnline = latestHeartbeat
      ? Date.now() - new Date(latestHeartbeat.lastSeenAt).getTime() <= 15000
      : false;

    return NextResponse.json({
      ok: true,
      jobs,
      queueDepth,
      worker: {
        isOnline,
        workerId: latestHeartbeat?.workerId || null,
        hostname: latestHeartbeat?.hostname || null,
        dockerVersion: latestHeartbeat?.dockerVersion || null,
        runtime: latestHeartbeat?.runtime || null,
        lastSeenAt: latestHeartbeat?.lastSeenAt || null,
        startedAt: latestHeartbeat?.startedAt || null,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to load jobs." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/jobs
 * Creates a new queued job (authenticated, allowed job types only).
 */
export async function POST(req) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, projectId, payload } = body || {};

    if (!type || !ALLOWED_JOB_TYPES.includes(type)) {
      return NextResponse.json(
        {
          error: `Job type '${type}' is not allowed. Supported types: ${ALLOWED_JOB_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        type,
        status: "QUEUED",
        createdById: user.id,
        projectId: projectId || null,
        payload: payload || {},
      },
    });

    return NextResponse.json({ ok: true, job }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to create job." },
      { status: 500 }
    );
  }
}

