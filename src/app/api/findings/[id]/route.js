import { NextResponse } from "next/server";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { requireProjectRole } from "@/lib/projects";

/**
 * GET /api/findings/[id]
 * Retrieves full details of a specific finding including scan, context lines, and provenance.
 */
export async function GET(_req, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const finding = await prisma.finding.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            repoUrl: true,
            defaultBranch: true,
            isDemo: true,
            executionEnabled: true,
          },
        },
        scan: {
          select: {
            id: true,
            commitSha: true,
            branch: true,
            tool: true,
            startedAt: true,
            finishedAt: true,
          },
        },
        verificationRuns: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!finding) {
      return NextResponse.json({ error: "Finding not found." }, { status: 404 });
    }

    // Verify user is a member of the finding's project
    await requireProjectRole(finding.projectId, user.id, ["OWNER", "MEMBER", "VIEWER"]);

    return NextResponse.json({ ok: true, finding });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to load finding details." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/findings/[id]
 * Updates triage status (OPEN or IGNORED) and logs an audit event.
 */
export async function PATCH(req, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const finding = await prisma.finding.findUnique({
      where: { id },
      select: {
        id: true,
        projectId: true,
        triageStatus: true,
      },
    });

    if (!finding) {
      return NextResponse.json({ error: "Finding not found." }, { status: 404 });
    }

    // Must be OWNER or MEMBER to modify triage status
    await requireProjectRole(finding.projectId, user.id, ["OWNER", "MEMBER"]);

    const body = await req.json();
    const { triageStatus } = body || {};

    const VALID_TRIAGE_STATUSES = ["OPEN", "IGNORED", "FIXED"];
    if (!triageStatus || !VALID_TRIAGE_STATUSES.includes(triageStatus)) {
      return NextResponse.json(
        { error: `Invalid triage status. Supported values: ${VALID_TRIAGE_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const previousStatus = finding.triageStatus;
    const updated = await prisma.finding.update({
      where: { id },
      data: {
        triageStatus,
        updatedAt: new Date(),
      },
    });

    // Write audit event
    try {
      await prisma.auditEvent.create({
        data: {
          actorId: user.id,
          projectId: finding.projectId,
          action: "FINDING_STATUS_CHANGED",
          entityType: "Finding",
          entityId: finding.id,
          metadata: {
            findingId: finding.id,
            previousStatus,
            newStatus: triageStatus,
          },
        },
      });
    } catch {
      // non-fatal
    }

    return NextResponse.json({ ok: true, finding: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to update triage status." },
      { status: 500 }
    );
  }
}

