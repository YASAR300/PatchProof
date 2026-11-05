import React from "react";
import { cookies } from "next/headers";
import { FileCheck2, Plus, Filter, GitPullRequest } from "lucide-react";
import { requireUser } from "@/auth";
import { prisma } from "@/lib/db";
import { getActiveProject } from "@/lib/projects";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Patch Reports",
  description: "Pull request verification verdicts and before/after matrices",
};

export default async function ReportsPage() {
  const user = await requireUser();
  const cookieStore = await cookies();
  const { activeProject } = await getActiveProject(cookieStore, user.id);

  const reports = activeProject
    ? await prisma.patchReport.findMany({
        where: { projectId: activeProject.id },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: { finding: true },
      })
    : [];

  return (
    <div className="space-y-4 font-sans w-full max-w-[1200px] mx-auto">
      <PageHeader
        title="Patch reports"
        description="Candidate fix verifications, side-effect regression checks, and tamper-evident PR artifacts."
        actions={
          <Button variant="primary" size="sm">
            <Plus className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            Verify proposed patch
          </Button>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-border text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] border border-border bg-surface text-text-secondary">
            <Filter className="w-3 h-3 text-text-tertiary" />
            <span className="text-[11px]">Verdict:</span>
            <span className="text-[11px] font-medium text-text">All verdicts</span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-text-tertiary tabular-nums">
          {reports.length} {reports.length === 1 ? "report" : "reports"} generated
        </div>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={<FileCheck2 className="w-4 h-4 text-text-secondary" aria-hidden="true" />}
          title="No patch reports generated"
          description="When a proposed fix or pull request is submitted, PatchProof validates that the exploit is neutralized without breaking any normal behavior."
          action={
            <Button variant="secondary" size="sm">
              <Plus className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              Verify proposed patch
            </Button>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tamper-evident verification matrices</CardTitle>
            <span className="text-[11px] font-mono text-text-tertiary">Cryptographically attested</span>
          </CardHeader>
          <div className="divide-y divide-border">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-surface-hover transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-text">{rep.id.slice(0, 10)}</span>
                    <Badge variant={rep.verdict === "FIX_VERIFIED" ? "success" : "danger"}>
                      {rep.verdict}
                    </Badge>
                    <span className="font-medium text-text truncate">{rep.summary || rep.finding?.title || "Patch report"}</span>
                  </div>
                  <div className="text-[11px] text-text-tertiary flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-text-secondary">{rep.finding?.ruleId || "rule"}</span>
                    <span>•</span>
                    <span>Commit: <code className="font-mono text-text">{rep.candidateCommit.slice(0, 7)}</code></span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0 text-right sm:text-right">
                  <div className="text-[11px] text-text-tertiary font-mono">
                    {new Date(rep.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
