import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { getUserProjects, requireProjectRole } from "@/lib/projects";
import { rateLimiter, getClientIp } from "@/lib/rate-limit";

const ALLOWED_JOB_TYPES = ["selftest", "scan", "dependency-scan", "verify", "patch-validate", "pr-check"];

const postJobSchema = z.object({
  type: z.enum(ALLOWED_JOB_TYPES),
  projectId: z.string().trim().optional(),
  payload: z.record(z.any()).optional().default({}),
});

/**
 * GET /api/jobs?limit=&type=
 * Returns recent jobs scoped strictly to projects accessible by the authenticated user.
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

    const userProjects = await getUserProjects(user.id);
    const userProjectIds = userProjects.map((p) => p.id);

    // Scoped where condition: only jobs belonging to user's projects or created by this user
    const where = {
      OR: [
        { projectId: { in: userProjectIds } },
        { createdById: user.id },
      ],
    };

    if (type && ALLOWED_JOB_TYPES.includes(type)) {
      where.type = type;
    }

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
        where: {
          status: "QUEUED",
          OR: [
            { projectId: { in: userProjectIds } },
            { createdById: user.id },
          ],
        },
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
 * Creates a new queued job (rate-limited, validated, and role-authorized).
 */
export async function POST(req) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 30 jobs per 10 minutes per user/IP
    const ip = getClientIp(req);
    const limitResult = rateLimiter.check(`job-create:${user.id}:${ip}`, 30, 600000);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded for job dispatch. Please wait before queuing more jobs." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(limitResult.resetMs / 1000)),
          },
        }
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = postJobSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Invalid job configuration." },
        { status: 400 }
      );
    }

    const { type, projectId, payload } = parseResult.data;

    // Authorization check: if projectId is specified, user must have OWNER or MEMBER role
    if (projectId) {
      try {
        await requireProjectRole(projectId, user.id, ["OWNER", "MEMBER"]);
      } catch (roleErr) {
        return NextResponse.json(
          { error: roleErr.message || "Forbidden: You cannot enqueue jobs for this project." },
          { status: 403 }
        );
      }
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
