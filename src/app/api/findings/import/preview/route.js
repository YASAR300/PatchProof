import { NextResponse } from "next/server";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { requireProjectRole } from "@/lib/projects";
import { parseSecurityReport, isValidCommitSha } from "@/lib/importers/detect";
import { rateLimiter, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/findings/import/preview
 * Accepts report content, runs structural validation, computes fingerprints,
 * and returns severity counts, preview findings, and duplicate count against the DB.
 */
export async function POST(req) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 20 imports per 10 minutes per user/IP
    const ip = getClientIp(req);
    const limitResult = rateLimiter.check(`import-preview:${user.id}:${ip}`, 20, 600000);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded for report uploads. Please wait before retrying." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limitResult.resetMs / 1000)) } }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let rawText = "";
    let projectId = "";
    let commitSha = "";
    let format = "auto";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      projectId = formData.get("projectId") || "";
      commitSha = formData.get("commitSha") || "";
      format = formData.get("format") || "auto";

      if (!file || typeof file === "string") {
        return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
      }

      // 1. Enforce file size limit (max 5 MB)
      const MAX_SIZE_BYTES = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json(
          { error: `File size exceeds the 5 MB limit (received ${(file.size / (1024 * 1024)).toFixed(2)} MB).` },
          { status: 400 }
        );
      }

      // 2. Validate file extension
      const fileName = (file.name || "").toLowerCase();
      if (!fileName.endsWith(".json") && !fileName.endsWith(".sarif")) {
        return NextResponse.json(
          { error: `Invalid file extension for '${file.name}'. Only .json and .sarif files are permitted.` },
          { status: 400 }
        );
      }

      rawText = await file.text();
    } else {
      const body = await req.json();
      rawText = body.content || "";
      projectId = body.projectId || "";
      commitSha = body.commitSha || "";
      format = body.format || "auto";

      const byteLength = Buffer.byteLength(rawText, "utf8");
      if (byteLength > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Content size exceeds the 5 MB limit." },
          { status: 400 }
        );
      }
    }

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
    }

    // Validate commit SHA (7-40 hex chars)
    if (!isValidCommitSha(commitSha)) {
      return NextResponse.json(
        { error: "Commit SHA must be a valid 7 to 40 character hexadecimal string (e.g. '9d13f9f')." },
        { status: 400 }
      );
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

    // 3. Parse report using server-side importer
    let parsed;
    try {
      parsed = parseSecurityReport(rawText, format);
    } catch (parseErr) {
      return NextResponse.json({ error: parseErr.message }, { status: 400 });
    }

    const { format: detectedFormat, toolName, findings } = parsed;

    if (findings.length === 0) {
      return NextResponse.json(
        { error: "The report was parsed successfully, but contains 0 security findings." },
        { status: 400 }
      );
    }

    // 4. Compute severity counts
    const severityCounts = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      INFO: 0,
    };

    findings.forEach((f) => {
      if (severityCounts[f.severity] !== undefined) {
        severityCounts[f.severity] += 1;
      } else {
        severityCounts.MEDIUM += 1;
      }
    });

    // 5. Check for duplicate fingerprints already in the database for this project
    const fingerprints = findings.map((f) => f.fingerprint);
    const existingFindings = await prisma.finding.findMany({
      where: {
        projectId: project.id,
        fingerprint: { in: fingerprints },
      },
      select: { fingerprint: true },
    });

    const existingSet = new Set(existingFindings.map((e) => e.fingerprint));
    const duplicateCount = findings.filter((f) => existingSet.has(f.fingerprint)).length;

    // Attach duplicate flag to each finding for preview
    const findingsWithDuplicateFlag = findings.map((f) => ({
      ...f,
      isDuplicate: existingSet.has(f.fingerprint),
    }));

    return NextResponse.json({
      ok: true,
      totalCount: findings.length,
      severityCounts,
      duplicateCount,
      newCount: findings.length - duplicateCount,
      detectedFormat,
      toolName,
      commitSha: commitSha.trim(),
      firstFindings: findingsWithDuplicateFlag.slice(0, 20),
      allFindings: findingsWithDuplicateFlag,
    });
  } catch (err) {
    console.error("Preview import error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to parse and preview report." },
      { status: 500 }
    );
  }
}

