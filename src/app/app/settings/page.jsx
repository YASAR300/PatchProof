import React from "react";
import { cookies } from "next/headers";
import { requireUser } from "@/auth";
import { prisma } from "@/lib/db";
import { getActiveProject, getProjectRole } from "@/lib/projects";
import { isRepositoryAllowListed, getExecutionAllowedRepos } from "@/lib/execution-safety";
import { PageHeader } from "@/components/app/PageHeader";
import { SettingsClient } from "@/components/app/SettingsClient";

export const metadata = {
  title: "Settings — PatchProof",
  description: "User profile, project details, access control, worker configuration, and danger zone",
};

export default async function SettingsPage() {
  const sessionUser = await requireUser();
  const cookieStore = await cookies();
  const { activeProject } = await getActiveProject(cookieStore, sessionUser?.id);

  // Fetch full user record to check passwordHash / avatarUrl
  const user = sessionUser
    ? await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          passwordHash: true,
        },
      })
    : null;

  let members = [];
  let deliveries = [];
  let currentUserRole = "VIEWER";

  if (activeProject && user) {
    currentUserRole = (await getProjectRole(activeProject.id, user.id)) || "VIEWER";

    members = await prisma.projectMember.findMany({
      where: { projectId: activeProject.id },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
    });

    deliveries = await prisma.webhookDelivery.findMany({
      where: { projectId: activeProject.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  const isAllowListed = activeProject
    ? isRepositoryAllowListed(activeProject.repoOwner, activeProject.repoName, activeProject)
    : false;
  const allowedRepos = getExecutionAllowedRepos();

  return (
    <div className="max-w-[1200px] mx-auto w-full space-y-5 font-sans pb-16">
      <PageHeader
        title="Settings"
        description="Configure your user profile, repository boundaries, team member access, webhook integrations, and worker execution limits."
      />

      <SettingsClient
        user={user}
        project={activeProject}
        initialMembers={members}
        currentUserRole={currentUserRole}
        isAllowListed={isAllowListed}
        allowedRepos={allowedRepos}
        deliveries={deliveries}
      />
    </div>
  );
}
