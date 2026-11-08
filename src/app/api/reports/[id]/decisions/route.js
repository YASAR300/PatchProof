import { NextResponse } from "next/server";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { requireProjectRole, getProjectRole } from "@/lib/projects";

const ALLOWED_DECISIONS = ["APPROVED", "CHANGES_REQUESTED", "REJECTED"];

/**
 * GET /api/reports/[id]/decisions
 * Returns all reviewer decisions for a patch report ordered newest first.
 */
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const report = await prisma.patchReport.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Must have at least VIEWER role
    await requireProjectRole(report.projectId, user.id, ["OWNER", "MEMBER", "VIEWER"]);

    const decisions = await prisma.reviewerDecision.findMany({
      where: { patchReportId: id },
      orderBy: { createdAt: "desc" },
      include: {
        reviewer: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    const userRole = await getProjectRole(report.projectId, user.id);

    return NextResponse.json({ ok: true, decisions, userRole });
  } catch (err) {
    console.error("[GET /api/reports/[id]/decisions] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch reviewer decisions" },
      { status: err.message?.includes("Permission denied") ? 403 : 500 }
    );
  }
}

/**
 * POST /api/reports/[id]/decisions
 * Saves a reviewer decision (APPROVED, CHANGES_REQUESTED, REJECTED) with required comment.
 * Restricted to OWNER or MEMBER roles; VIEWER is rejected with 403.
 */
export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const report = await prisma.patchReport.findUnique({
      where: { id },
      include: { finding: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Role check: Only OWNER or MEMBER can decide; VIEWER is blocked
    try {
      await requireProjectRole(report.projectId, user.id, ["OWNER", "MEMBER"]);
    } catch {
      return NextResponse.json(
        {
          error:
            "Forbidden: VIEWER role cannot submit reviewer decisions. Only project OWNER or MEMBER can decide.",
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { decision, comment } = body;

    if (!decision || !ALLOWED_DECISIONS.includes(decision)) {
      return NextResponse.json(
        {
          error: `Invalid decision '${decision}'. Allowed: ${ALLOWED_DECISIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json(
        { error: "A comment explaining your review decision is required." },
        { status: 400 }
      );
    }

    const cleanComment = comment.trim();

    // Create ReviewerDecision record
    const decisionRecord = await prisma.reviewerDecision.create({
      data: {
        patchReportId: id,
        reviewerId: user.id,
        decision,
        comment: cleanComment,
      },
      include: {
        reviewer: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    // Write audit event REVIEWER_DECISION
    await prisma.auditEvent.create({
      data: {
        actorId: user.id,
        projectId: report.projectId,
        action: "REVIEWER_DECISION",
        entityType: "PatchReport",
        entityId: id,
        metadata: {
          reportId: id,
          findingId: report.findingId,
          findingTitle: report.finding?.title || "Security finding",
          verdict: report.verdict,
          decision,
          comment: cleanComment,
          reviewerEmail: user.email,
          reviewerName: user.name,
        },
      },
    });

    return NextResponse.json(
      { ok: true, decision: decisionRecord },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/reports/[id]/decisions] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to record reviewer decision" },
      { status: 500 }
    );
  }
}

