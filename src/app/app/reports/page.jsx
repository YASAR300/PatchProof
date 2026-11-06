import React from "react";
import { cookies } from "next/headers";
import { requireUser } from "@/auth";
import { prisma } from "@/lib/db";
import { getActiveProject } from "@/lib/projects";
import { ReportsClient } from "./ReportsClient";

export const metadata = {
  title: "Patch Reports — PatchProof",
  description: "Pull request verification verdicts, before/after matrices, and regression suites",
};

export default async function ReportsPage() {
  const user = await requireUser();
  const cookieStore = await cookies();
  const { activeProject } = await getActiveProject(cookieStore, user.id);

  const reports = activeProject
    ? await prisma.patchReport.findMany({
        where: { projectId: activeProject.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          finding: {
            select: {
              id: true,
              title: true,
              ruleId: true,
              severity: true,
              filePath: true,
            },
          },
          decisions: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      })
    : [];

  return <ReportsClient reports={reports} />;
}
