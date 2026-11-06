import React from "react";
import { cookies } from "next/headers";
import { requireUser } from "@/auth";
import { prisma } from "@/lib/db";
import { getActiveProject } from "@/lib/projects";
import { RunsClient } from "./RunsClient";

export const metadata = {
  title: "Verification Runs — PatchProof",
  description: "Isolated container execution logs and reproducer results",
};

export default async function RunsPage() {
  const user = await requireUser();
  const cookieStore = await cookies();
  const { activeProject } = await getActiveProject(cookieStore, user.id);

  let runs = [];
  let projectFindings = [];

  if (activeProject) {
    [runs, projectFindings] = await Promise.all([
      prisma.verificationRun.findMany({
        where: { projectId: activeProject.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          finding: {
            select: {
              id: true,
              title: true,
              filePath: true,
              lineStart: true,
              ruleId: true,
            },
          },
        },
      }),
      prisma.finding.findMany({
        where: { projectId: activeProject.id },
        select: {
          id: true,
          title: true,
        },
        orderBy: { title: "asc" },
      }),
    ]);
  }

  return (
    <RunsClient
      initialRuns={runs}
      projectFindings={projectFindings}
      activeProject={activeProject}
    />
  );
}
