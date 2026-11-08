import React from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/auth";
import { prisma } from "@/lib/db";
import { requireProjectRole } from "@/lib/projects";
import { buildEvidenceDocument } from "@/lib/report";
import { PrintReportClient } from "./PrintReportClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const report = await prisma.patchReport.findUnique({
    where: { id },
    include: { finding: true },
  });

  if (!report) return { title: "Patch Report (Print) — PatchProof" };

  return {
    title: `Print Evidence Report: ${report.verdict} (#${id.slice(-8)}) — PatchProof`,
    description: `Print-optimized verifiable evidence report for ${report.finding?.title || id}`,
  };
}

export default async function PrintReportPage({ params }) {
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
  try {
    await requireProjectRole(report.projectId, user.id, ["OWNER", "MEMBER", "VIEWER"]);
  } catch {
    notFound();
  }

  const aiExplanation = await prisma.aiExplanation.findFirst({
    where: { entityType: "PatchReport", entityId: id },
    orderBy: { createdAt: "desc" },
  });

  const doc = buildEvidenceDocument(report, aiExplanation);

  return <PrintReportClient doc={doc} reportId={report.id} />;
}

