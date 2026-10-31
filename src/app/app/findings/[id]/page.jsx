import React from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/auth";
import { prisma } from "@/lib/db";
import { requireProjectRole } from "@/lib/projects";
import { FindingDetailClient } from "./FindingDetailClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const finding = await prisma.finding.findUnique({
    where: { id },
    select: { title: true, filePath: true },
  });

  if (!finding) return { title: "Finding Not Found — PatchProof" };

  return {
    title: `${finding.title} — Findings — PatchProof`,
    description: `Security finding details for ${finding.filePath}`,
  };
}

export default async function FindingDetailPage({ params }) {
  const { id } = await params;
  const user = await requireUser();

  const finding = await prisma.finding.findUnique({
    where: { id },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
          repoUrl: true,
          defaultBranch: true,
          isDemo: true,
          executionEnabled: true,
        },
      },
      scan: {
        select: {
          id: true,
          commitSha: true,
          branch: true,
          tool: true,
          startedAt: true,
          finishedAt: true,
        },
      },
    },
  });

  if (!finding) {
    notFound();
  }

  // Ensure user has access to project
  try {
    await requireProjectRole(finding.projectId, user.id, ["OWNER", "MEMBER", "VIEWER"]);
  } catch {
    notFound();
  }

  return <FindingDetailClient finding={finding} />;
}

