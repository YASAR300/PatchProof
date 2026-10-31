import React from "react";
import { cookies } from "next/headers";
import { requireUser } from "@/auth";
import { prisma } from "@/lib/db";
import { getUserProjects, PROJECT_COOKIE_NAME } from "@/lib/projects";
import { FindingsClient } from "./FindingsClient";

export const metadata = {
  title: "Findings — PatchProof",
  description: "Discovered security flaws with reproduction and verification status",
};

export default async function FindingsPage() {
  const user = await requireUser();
  const cookieStore = await cookies();
  const activeProjectId = cookieStore.get(PROJECT_COOKIE_NAME)?.value || null;

  // Resolve projects for user
  const userProjects = await getUserProjects(user.id);
  const targetProjectIds = activeProjectId
    ? [activeProjectId]
    : userProjects.map((p) => p.id);

  let initialFindings = [];
  if (targetProjectIds.length > 0) {
    initialFindings = await prisma.finding.findMany({
      where: {
        projectId: { in: targetProjectIds },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            isDemo: true,
          },
        },
        scan: {
          select: {
            id: true,
            commitSha: true,
            branch: true,
            tool: true,
            startedAt: true,
          },
        },
      },
      orderBy: [
        { severity: "asc" },
        { createdAt: "desc" },
      ],
    });
  }

  return (
    <FindingsClient
      initialFindings={initialFindings}
      initialProjectId={activeProjectId}
    />
  );
}
