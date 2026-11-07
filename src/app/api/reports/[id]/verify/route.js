import { NextResponse } from "next/server";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { requireProjectRole } from "@/lib/projects";
import { verifyReportIntegrity } from "@/lib/report";

/**
 * POST /api/reports/[id]/verify
 * Recomputes and verifies cryptographic hashes for all stored artifacts
 * and checks the canonical report hash.
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
      include: {
        project: true,
        finding: true,
        baselineRun: {
          include: { artifacts: true },
        },
        candidateRun: {
          include: { artifacts: true },
        },
        artifacts: true,
        decisions: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check project membership (OWNER, MEMBER, VIEWER)
    try {
      await requireProjectRole(report.projectId, user.id, ["OWNER", "MEMBER", "VIEWER"]);
    } catch (err) {
      return NextResponse.json(
        { error: "Forbidden: You are not a member of this project." },
        { status: 403 }
      );
    }

    const verificationResult = verifyReportIntegrity(report);

    // Audit event for cryptographic integrity verification
    await prisma.auditEvent.create({
      data: {
        actorId: user.id,
        projectId: report.projectId,
        action: "REPORT_INTEGRITY_VERIFIED",
        entityType: "PatchReport",
        entityId: id,
        metadata: {
          reportId: id,
          valid: verificationResult.valid,
          verifiedCount: verificationResult.verifiedCount,
          totalCount: verificationResult.totalCount,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      reportId: id,
      verifiedAt: new Date().toISOString(),
      result: verificationResult,
    });
  } catch (err) {
    console.error("[api/reports/[id]/verify] Error verifying integrity:", err);
    return NextResponse.json(
      { error: "Internal server error during integrity verification" },
      { status: 500 }
    );
  }
}

