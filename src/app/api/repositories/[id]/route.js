import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/auth";
import { prisma } from "@/lib/db";
import { getProjectForUser, requireProjectRole, PROJECT_COOKIE_NAME } from "@/lib/projects";
import { getRecentCommits, getLatestCommitSha } from "@/lib/github";

export async function GET(req, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await getProjectForUser(id, user.id);
    if (!project) {
      return NextResponse.json(
        { error: "Project not found or you do not have permission to view it." },
        { status: 404 }
      );
    }

    // Fetch latest 15 commits from GitHub API
    const commits = await getRecentCommits(
      project.repoOwner,
      project.repoName,
      project.defaultBranch,
      15
    );

    return NextResponse.json({
      ok: true,
      project,
      commits,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve repository." },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    // VIEWER cannot edit
    const project = await requireProjectRole(id, user.id, ["OWNER", "MEMBER"]);

    const body = await req.json();
    const { name, defaultBranch } = body || {};

    const updateData = {};
    if (typeof name === "string" && name.trim()) {
      updateData.name = name.trim();
    }
    if (typeof defaultBranch === "string" && defaultBranch.trim()) {
      const newBranch = defaultBranch.trim();
      updateData.defaultBranch = newBranch;
      // Also update latestCommitSha for the new branch
      try {
        const commitInfo = await getLatestCommitSha(
          project.repoOwner,
          project.repoName,
          newBranch
        );
        if (commitInfo?.sha) {
          updateData.latestCommitSha = commitInfo.sha;
        }
      } catch (e) {
        console.warn("Could not fetch commit for updated branch:", e.message);
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields provided to update." }, { status: 400 });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ok: true, project: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to update repository." },
      { status: 403 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    // VIEWER cannot delete
    const project = await requireProjectRole(id, user.id, ["OWNER", "MEMBER"]);

    const body = await req.json();
    const { confirmationName } = body || {};

    if (confirmationName !== project.name && confirmationName !== project.repoName) {
      return NextResponse.json(
        { error: "Confirmation repository name does not match." },
        { status: 400 }
      );
    }

    // Write PROJECT_DELETED audit event & delete project in transaction
    await prisma.$transaction(async (tx) => {
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          projectId: project.id,
          action: "PROJECT_DELETED",
          entityType: "Project",
          entityId: project.id,
          metadata: {
            name: project.name,
            repoOwner: project.repoOwner,
            repoName: project.repoName,
            deletedBy: user.email,
          },
        },
      });

      await tx.project.delete({
        where: { id: project.id },
      });
    });

    // Clear active project cookie if it was this project
    const cookieStore = await cookies();
    const currentActive = cookieStore.get(PROJECT_COOKIE_NAME)?.value;
    if (currentActive === project.id) {
      cookieStore.delete(PROJECT_COOKIE_NAME);
    }

    return NextResponse.json({ ok: true, deletedId: project.id });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to delete repository." },
      { status: 403 }
    );
  }
}

