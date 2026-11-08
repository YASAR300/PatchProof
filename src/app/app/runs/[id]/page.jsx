import React from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/auth";
import { prisma } from "@/lib/db";
import { requireProjectRole } from "@/lib/projects";
import { RunDetailClient } from "./RunDetailClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const run = await prisma.verificationRun.findUnique({
    where: { id },
    select: { status: true, reproducerId: true },
  });

  if (!run) return { title: "Verification Run Not Found — PatchProof" };

  return {
    title: `Run ${id.slice(0, 8)} (${run.status}) — PatchProof`,
    description: `Evidence trace and execution log for verification run ${id}`,
  };
}

export default async function RunDetailPage({ params }) {
  const { id } = await params;
  const user = await requireUser();

  const run = await prisma.verificationRun.findUnique({
    where: { id },
    include: {
      finding: true,
      project: true,
      artifacts: true,
      job: true,
    },
  });

  if (!run) {
    notFound();
  }

  // Ensure user has access to project
  try {
    await requireProjectRole(run.projectId, user.id, ["OWNER", "MEMBER", "VIEWER"]);
  } catch {
    notFound();
  }

  return <RunDetailClient run={run} />;
}

