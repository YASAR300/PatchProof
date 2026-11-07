import React from "react";
import { cookies } from "next/headers";
import { requireUser } from "@/auth";
import { prisma } from "@/lib/db";
import { getActiveProject } from "@/lib/projects";
import { AuditClient } from "./AuditClient";

export const metadata = {
  title: "History & Audit — PatchProof",
  description: "Cryptographic, append-only security timeline of verification events and repository activities",
};

export default async function AuditPage() {
  const user = await requireUser();
  const cookieStore = await cookies();
  const { activeProject } = await getActiveProject(cookieStore, user.id);

  // Where condition: project-scoped events or global events if no project
  const whereCondition = activeProject
    ? {
        OR: [
          { projectId: activeProject.id },
          { projectId: null, actorId: user.id },
        ],
      }
    : { actorId: user.id };

  const events = await prisma.auditEvent.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    take: 500, // Fetch up to 500 recent events for client-side instant filtering & 50-row pagination
    include: {
      actor: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      project: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return <AuditClient initialEvents={events} activeProject={activeProject} />;
}
