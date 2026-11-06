import React from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/auth";
import { prisma } from "@/lib/db";
import { requireProjectRole } from "@/lib/projects";
import { ReportDetailClient } from "./ReportDetailClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const report = await prisma.patchReport.findUnique({
    where: { id },
    include: { finding: true },
  });

  if (!report) return { title: "Patch Report Not Found — PatchProof" };

  return {
    title: `Patch Report: ${report.verdict} — PatchProof`,
    description: `Automated patch validation evidence and regression matrix for ${report.finding?.title || id}`,
  };
}

export default async function ReportDetailPage({ params }) {
  const { id } = await params;
  const user = await requireUser();

  const report = await prisma.patchReport.findUnique({
    where: { id },
    include: {
      finding: true,
      project: true,
      baselineRun: {
        include: { artifacts: true },
      },
      candidateRun: {
        include: { artifacts: true },
      },
      artifacts: true,
      decisions: {
        include: { reviewer: true },
      },
    },
  });

  if (!report) {
    notFound();
  }

  // Ensure user has membership/access to project
  await requireProjectRole(report.projectId, user.id, ["OWNER", "MEMBER", "VIEWER"]);

  return <ReportDetailClient report={report} />;
}

