import React from "react";
import { cookies } from "next/headers";
import { Terminal, Play, Filter, Clock } from "lucide-react";
import { requireUser } from "@/auth";
import { prisma } from "@/lib/db";
import { getActiveProject } from "@/lib/projects";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Verification Runs",
  description: "Isolated container execution logs and reproducer results",
};

export default async function RunsPage() {
  const user = await requireUser();
  const cookieStore = await cookies();
  const { activeProject } = await getActiveProject(cookieStore, user.id);

  const runs = activeProject
    ? await prisma.verificationRun.findMany({
        where: { projectId: activeProject.id },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: { finding: true },
      })
    : [];

  return (
    <div className="space-y-4 font-sans w-full max-w-[1200px] mx-auto">
      <PageHeader
        title="Verification runs"
        description="Isolated sandbox test executions measuring exploit reproducibility and recording deterministic execution evidence."
        actions={
          <Button variant="primary" size="sm">
            <Play className="w-3.5 h-3.5 flex-shrink-0 fill-current" aria-hidden="true" />
            Run reproducer
          </Button>
        }
      />

      {/* Compact filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-border text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] border border-border bg-surface text-text-secondary">
            <Filter className="w-3 h-3 text-text-tertiary" />
            <span className="text-[11px]">Verdict:</span>
            <span className="text-[11px] font-medium text-text">All verdicts</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] border border-border bg-surface text-text-secondary">
            <span className="text-[11px]">Branch:</span>
            <span className="text-[11px] font-medium text-text font-mono">
              {activeProject?.defaultBranch || "main"}
            </span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-text-tertiary tabular-nums">
          {runs.length} {runs.length === 1 ? "run" : "runs"} recorded
        </div>
      </div>

      {runs.length === 0 ? (
        <EmptyState
          icon={<Terminal className="w-4 h-4 text-text-secondary" aria-hidden="true" />}
          title="No verification runs executed"
          description="Automated exploit test runs in isolated sandbox environments will record execution traces, durations, and status verdicts here."
          action={
            <Button variant="secondary" size="sm">
              <Play className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              Execute test run
            </Button>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Execution log & evidence traces</CardTitle>
            <span className="text-[11px] font-mono text-text-tertiary">
              Tamper-proof container traces
            </span>
          </CardHeader>
          <div className="divide-y divide-border">
            {runs.map((run) => (
              <div
                key={run.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-surface-hover transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-text">{run.id.slice(0, 10)}</span>
                    <StatusBadge status={run.status} size="sm" />
                    <span className="text-[11px] font-mono text-text-secondary truncate">
                      {run.finding?.filePath ? `${run.finding.filePath}:${run.finding.lineStart || 1}` : run.reproducerId || "reproducer"}
                    </span>
                  </div>
                  <div className="text-[11px] text-text-tertiary flex items-center gap-2 flex-wrap">
                    <span>Rule: <code className="text-text-secondary">{run.finding?.ruleId || "reproducer"}</code></span>
                    <span>•</span>
                    <span>Commit: <code className="font-mono text-text">{run.commitSha.slice(0, 7)}</code></span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0 text-right sm:text-right">
                  <div className="text-[11px] text-text-tertiary font-mono">
                    <div>Duration: <span className="text-text font-medium">{run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : "—"}</span></div>
                    <div>Exit: <span className={run.exitCode === 0 ? "text-success font-medium" : "text-danger font-medium"}>{run.exitCode ?? "—"}</span></div>
                  </div>
                  <div className="text-[11px] text-text-tertiary font-mono">
                    {new Date(run.createdAt).toLocaleDateString()}
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
