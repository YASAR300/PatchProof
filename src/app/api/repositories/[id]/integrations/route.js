import { NextResponse } from "next/server";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { requireProjectRole, getProjectForUser } from "@/lib/projects";
import { isRepositoryAllowListed, getExecutionAllowedRepos } from "@/lib/execution-safety";

/**
 * GET /api/repositories/[id]/integrations
 * Returns webhook URL, secret configuration status, execution allow-list status,
 * and the last 20 webhook deliveries.
 */
export async function GET(req, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await getProjectForUser(id, user.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const appUrl = process.env.APP_URL || "https://patchproof-three.vercel.app";
    const webhookUrl = `${appUrl}/api/webhooks/github`;
    const isAllowListed = isRepositoryAllowListed(
      project.repoOwner,
      project.repoName,
      project
    );
    const allowedRepos = getExecutionAllowedRepos();

    // Fetch last 20 deliveries
    const deliveries = await prisma.webhookDelivery.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      ok: true,
      webhookUrl,
      hasSecret: Boolean(project.webhookSecretEncrypted),
      executionEnabled: Boolean(project.executionEnabled),
      isAllowListed,
      allowedRepos,
      deliveries,
    });
  } catch (err) {
    console.error("[api/repositories/[id]/integrations GET] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load integrations status" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/repositories/[id]/integrations
 * Updates project execution settings (e.g. toggle executionEnabled).
 */
export async function PATCH(req, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await requireProjectRole(id, user.id, ["OWNER", "MEMBER"]);

    const body = await req.json().catch(() => ({}));
    const { executionEnabled } = body;

    const updateData = {};
    if (typeof executionEnabled === "boolean") {
      updateData.executionEnabled = executionEnabled;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields provided to update" }, { status: 400 });
    }

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: updateData,
    });

    // Write audit event for execution toggle
    await prisma.auditEvent.create({
      data: {
        actorId: user.id,
        projectId: project.id,
        action: "REPOSITORY_EXECUTION_TOGGLED",
        entityType: "Project",
        entityId: project.id,
        metadata: {
          executionEnabled: updated.executionEnabled,
          updatedBy: user.email,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      project: updated,
    });
  } catch (err) {
    console.error("[api/repositories/[id]/integrations PATCH] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update integration settings" },
      { status: 500 }
    );
  }
}

