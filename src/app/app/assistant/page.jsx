import React from "react";
import { cookies } from "next/headers";
import { requireUser } from "@/auth";
import { prisma } from "@/lib/db";
import { getActiveProject } from "@/lib/projects";
import { AssistantClient } from "./AssistantClient";

export const metadata = {
  title: "AI Security Assistant — PatchProof",
  description: "Test harness synthesis, patch explanation, and vulnerability root cause analysis",
};

export default async function AssistantPage() {
  const user = await requireUser();
  const cookieStore = await cookies();
  const { activeProject } = await getActiveProject(cookieStore, user.id);

  const whereProject = activeProject ? { projectId: activeProject.id } : { projectId: "__NONE__" };

  const [findings, runs, reports] = await Promise.all([
    prisma.finding.findMany({
      where: whereProject,
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        ruleId: true,
        title: true,
        severity: true,
        filePath: true,
        lineStart: true,
        snippet: true,
      },
    }),
    prisma.verificationRun.findMany({
      where: whereProject,
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        status: true,
        reproducerId: true,
        commitSha: true,
        createdAt: true,
      },
    }),
    prisma.patchReport.findMany({
      where: whereProject,
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        verdict: true,
        summary: true,
        baselineCommit: true,
        candidateCommit: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <AssistantClient
      activeProject={activeProject}
      findings={findings}
      runs={runs}
      reports={reports}
    />
  );
}
