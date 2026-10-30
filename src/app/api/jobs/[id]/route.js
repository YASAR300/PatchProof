import { NextResponse } from "next/server";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/jobs/[id]
 * Retrieves details, status, logs, and structured result of a specific job.
 */
export async function GET(_req, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Job ID is required." }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, job });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to load job details." },
      { status: 500 }
    );
  }
}

