import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { requireProjectRole } from "@/lib/projects";

// Validate artifact database ID strictly (alphanumeric, cuid, or standard IDs; never file paths)
const artifactIdSchema = z.string().trim().regex(/^[a-zA-Z0-9_-]{1,64}$/, {
  message: "Invalid artifact ID format. Database ID must be alphanumeric without directory traversal characters.",
});

/**
 * GET /api/artifacts/[id]
 * Secure artifact download endpoint.
 * - Accepts only database primary key ID (no file paths)
 * - Verifies authenticated user is an OWNER, MEMBER, or VIEWER of the enclosing project
 * - Returns the exact stored content with appropriate Content-Disposition and security headers
 */
export async function GET(_req, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const parsed = artifactIdSchema.safeParse(id);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid artifact ID" },
        { status: 400 }
      );
    }

    const artifactId = parsed.data;

    // Fetch artifact by primary key only
    const artifact = await prisma.evidenceArtifact.findUnique({
      where: { id: artifactId },
      include: {
        verificationRun: {
          select: { projectId: true },
        },
        patchReport: {
          select: { projectId: true },
        },
      },
    });

    if (!artifact) {
      return NextResponse.json({ error: "Artifact not found." }, { status: 404 });
    }

    // Resolve enclosing project ID
    const projectId = artifact.verificationRun?.projectId || artifact.patchReport?.projectId;
    if (!projectId) {
      return NextResponse.json(
        { error: "Artifact is not associated with an accessible project." },
        { status: 403 }
      );
    }

    // Enforce project membership (OWNER, MEMBER, VIEWER)
    try {
      await requireProjectRole(projectId, user.id, ["OWNER", "MEMBER", "VIEWER"]);
    } catch {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to access artifacts for this project." },
        { status: 403 }
      );
    }

    // Clean filename (strip any path characters)
    const sanitizedFilename = (artifact.name || `artifact-${artifact.id}.txt`)
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    const contentType = artifact.kind === "DIFF"
      ? "text/x-diff; charset=utf-8"
      : artifact.kind === "TEST_RESULT" || artifact.kind === "REPORT"
      ? "application/json; charset=utf-8"
      : "text/plain; charset=utf-8";

    return new Response(artifact.content, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${sanitizedFilename}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store, max-age=0",
        "X-Artifact-Sha256": artifact.sha256,
      },
    });
  } catch (err) {
    console.error("[api/artifacts/[id]] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve artifact." },
      { status: 500 }
    );
  }
}
