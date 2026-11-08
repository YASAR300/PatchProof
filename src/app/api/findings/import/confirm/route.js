import { NextResponse } from "next/server";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { requireProjectRole } from "@/lib/projects";
import { isValidCommitSha } from "@/lib/importers/detect";
import { rateLimiter, getClientIp } from "@/lib/rate-limit";

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

    // Rate limiting: 20 import confirms per 10 minutes per user/IP
    const ip = getClientIp(req);
    const limitResult = rateLimiter.check(`import-confirm:${user.id}:${ip}`, 20, 600000);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded for report confirmation. Please wait before retrying." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limitResult.resetMs / 1000)) } }
      );
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

    // Verify project exists and user has OWNER or MEMBER role
    let project;
    try {
      project = await requireProjectRole(projectId, user.id, ["OWNER", "MEMBER"]);
    } catch {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to import findings to this project." },
        { status: 403 }
      );
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

