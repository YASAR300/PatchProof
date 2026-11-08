import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { requireProjectRole } from "@/lib/projects";

const jobIdSchema = z.string().trim().regex(/^[a-zA-Z0-9_-]{1,64}$/, {
  message: "Invalid job ID format.",
});

/**
 * GET /api/jobs/[id]
 * Retrieves details, status, logs, and structured result of a specific job.
 * Strictly verifies user authorization for the job's project.
 */
export async function GET(_req, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const parsed = jobIdSchema.safeParse(id);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid Job ID." }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id: parsed.data },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    // Role check: if job has a projectId, verify membership
    if (job.projectId) {
      try {
        await requireProjectRole(job.projectId, user.id, ["OWNER", "MEMBER", "VIEWER"]);
      } catch {
        return NextResponse.json(
          { error: "Forbidden: You do not have permission to view this job." },
          { status: 403 }
        );
      }
    } else if (job.createdById && job.createdById !== user.id) {
      // If not tied to a project, only the job creator can inspect it
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to view this job." },
        { status: 403 }
      );
    }

    return NextResponse.json({ ok: true, job });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to load job details." },
      { status: 500 }
    );
  }
}
