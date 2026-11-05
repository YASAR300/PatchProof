import { NextResponse } from "next/server";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { isValidCommitSha } from "@/lib/importers/detect";

export const dynamic = "force-dynamic";

/**
 * POST /api/findings/import/confirm
 * Commits imported findings to the database:
 * - Creates Finding rows with source: IMPORT
 * - Skips duplicates based on @@unique([projectId, fingerprint])
 * - Emits audit event: FINDINGS_IMPORTED
 * - Returns execution summary (created, duplicates skipped, rejected)
 */
export async function POST(req) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, commitSha, findings, toolName = "Imported" } = body || {};

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    if (!isValidCommitSha(commitSha)) {
      return NextResponse.json({ error: "A valid commit SHA is required." }, { status: 400 });
    }

    if (!Array.isArray(findings) || findings.length === 0) {
      return NextResponse.json({ error: "No findings provided to import." }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json({ error: "Selected project was not found." }, { status: 404 });
    }

    let createdCount = 0;
    let duplicateCount = 0;
    let rejectedCount = 0;
    const createdFindings = [];

    for (const item of findings) {
      if (!item.ruleId || !item.filePath || !item.fingerprint) {
        rejectedCount += 1;
        continue;
      }

      // Check if duplicate exists
      const existing = await prisma.finding.findUnique({
        where: {
          projectId_fingerprint: {
            projectId: project.id,
            fingerprint: item.fingerprint,
          },
        },
      });

      if (existing) {
        duplicateCount += 1;
        continue;
      }

      try {
        const created = await prisma.finding.create({
          data: {
            projectId: project.id,
            source: "IMPORT",
            tool: item.tool || toolName,
            ruleId: item.ruleId,
            title: item.title || item.ruleId,
            description: item.description || item.title || "",
            severity: item.severity || "MEDIUM",
            filePath: item.filePath,
            lineStart: item.lineStart || 1,
            lineEnd: item.lineEnd || item.lineStart || 1,
            snippet: item.snippet || null,
            commitSha: commitSha.trim(),
            fingerprint: item.fingerprint,
            cwe: item.cwe || null,
            verificationState: "UNVERIFIED",
            triageStatus: "OPEN",
          },
        });
        createdCount += 1;
        createdFindings.push(created);
      } catch (insertErr) {
        // Unique constraint collision under race condition
        if (insertErr.code === "P2002") {
          duplicateCount += 1;
        } else {
          rejectedCount += 1;
        }
      }
    }

    // Record audit log
    try {
      await prisma.auditEvent.create({
        data: {
          actorId: user.id,
          projectId: project.id,
          action: "FINDINGS_IMPORTED",
          entityType: "Finding",
          entityId: project.id,
          metadata: {
            tool: toolName,
            totalReceived: findings.length,
            createdCount,
            duplicateCount,
            rejectedCount,
            commitSha: commitSha.trim(),
          },
        },
      });
    } catch (auditErr) {
      console.warn("Failed to write audit event FINDINGS_IMPORTED:", auditErr.message);
    }

    return NextResponse.json({
      ok: true,
      summary: {
        totalReceived: findings.length,
        createdCount,
        duplicateCount,
        rejectedCount,
        tool: toolName,
        commitSha: commitSha.trim(),
      },
      createdFindings: createdFindings.slice(0, 10),
    });
  } catch (err) {
    console.error("Confirm import error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to confirm and import findings." },
      { status: 500 }
    );
  }
}

