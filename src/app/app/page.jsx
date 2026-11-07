import React from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  FolderGit2,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode,
  ShieldCheck,
  Activity,
  History,
  Terminal,
  FileCheck2,
  ArrowRight,
  Package,
  Layers,
  Bug,
  Sparkles,
  Play,
  UploadCloud,
  ChevronRight,
  Check,
  Clock,
} from "lucide-react";
import { requireUser } from "@/auth";
import { getActiveProject } from "@/lib/projects";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/app/PageHeader";
import {
  ConnectRepositoryButton,
  AddDemoProjectButton,
} from "@/components/app/OverviewActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { RunsSparklineChart } from "@/components/app/RunsSparklineChart";
import { ReviewDecisionBadge } from "./reports/ReportsClient";

export const metadata = {
  title: "Overview — PatchProof",
  description: "Real-time verification metrics, active regression alerts, and patch validation posture",
};

function formatRelativeTime(date) {
  if (!date) return "Recently";
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function OverviewPage() {
  const user = await requireUser();
  const cookieStore = await cookies();
  const { activeProject, userProjects } = await getActiveProject(cookieStore, user.id);

  // If user has no projects, show onboarding card
  if (!activeProject || userProjects.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto w-full space-y-6">
        <PageHeader
          title="Security Overview"
          description="Consolidated metrics, active verification jobs, and vulnerability resolution posture across your projects."
        />

        <EmptyState
          icon={<FolderGit2 className="w-4 h-4 text-text-secondary" />}
          title="Connect a repository to get started"
          description="PatchProof monitors your GitHub repositories, performs static analysis, and validates code changes without running arbitrary unvetted code."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <AddDemoProjectButton size="md" />
              <ConnectRepositoryButton size="md" />
            </div>
          }
        />
      </div>
    );
  }

  const projectId = activeProject.id;
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Parallel Database Queries for Real Metrics
  const [
    openFindingsCount,
    findingsByStateRaw,
    runsLast7DaysCount,
    patchVerdictsRaw,
    advisoryDependenciesCount,
    runs14Days,
    recentRuns,
    recentReports,
    reproducedFindings,
    regressionAlerts,
    failedJobs,
    totalFindingsCount,
    totalRunsCount,
  ] = await Promise.all([
    // 1. Open findings count
    prisma.finding.count({
      where: { projectId, triageStatus: "OPEN" },
    }),
    // 2. Findings grouped by verification state
    prisma.finding.groupBy({
      by: ["verificationState"],
      where: { projectId },
      _count: { id: true },
    }),
    // 3. Verification runs in the last 7 days
    prisma.verificationRun.count({
      where: { projectId, createdAt: { gte: sevenDaysAgo } },
    }),
    // 4. Patch verdict counts
    prisma.patchReport.groupBy({
      by: ["verdict"],
      where: { projectId },
      _count: { id: true },
    }),
    // 5. Dependencies with advisories
    prisma.dependency.count({
      where: { projectId, advisoryId: { not: null } },
    }),
    // 6. Runs in the last 14 days for chart
    prisma.verificationRun.findMany({
      where: { projectId, createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true },
    }),
    // 7. Recent verification runs (last 5)
    prisma.verificationRun.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        finding: { select: { id: true, title: true, ruleId: true } },
      },
    }),
    // 8. Recent patch reports (last 5)
    prisma.patchReport.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        finding: { select: { id: true, title: true, ruleId: true } },
        decisions: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: { reviewer: true },
        },
      },
    }),
    // 9. Attention: REPRODUCED findings without a verified fix
    prisma.finding.findMany({
      where: { projectId, verificationState: "REPRODUCED" },
      include: {
        patchReports: {
          where: { verdict: "FIX_VERIFIED" },
          select: { id: true },
        },
      },
      take: 8,
    }),
    // 10. Attention: Regression alerts from PR checks and patch reports
    prisma.patchReport.findMany({
      where: { projectId, verdict: "REGRESSION_FAILURE" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { finding: true },
    }),
    // 11. Attention: Failed jobs in last 7 days
    prisma.job.findMany({
      where: { projectId, status: "FAILED", createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Total findings
    prisma.finding.count({ where: { projectId } }),
    // Total runs
    prisma.verificationRun.count({ where: { projectId } }),
  ]);

  // Transform findings by verification state
  const stateCounts = {
    UNVERIFIED: 0,
    REPRODUCED: 0,
    NOT_REPRODUCED: 0,
    INCONCLUSIVE: 0,
    EXECUTION_ERROR: 0,
  };
  for (const item of findingsByStateRaw) {
    stateCounts[item.verificationState] = item._count.id;
  }

  // Transform patch verdict counts
  const verdictCounts = {
    FIX_VERIFIED: 0,
    PATCH_NOT_VERIFIED: 0,
    REGRESSION_FAILURE: 0,
    INCONCLUSIVE: 0,
    EXECUTION_ERROR: 0,
  };
  for (const item of patchVerdictsRaw) {
    verdictCounts[item.verdict] = item._count.id;
  }

  // Assemble 14 days chart data
  const daysMap = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    daysMap[key] = { key, label, count: 0 };
  }
  for (const run of runs14Days) {
    const key = new Date(run.createdAt).toISOString().split("T")[0];
    if (daysMap[key]) daysMap[key].count++;
  }
  const chartData = Object.values(daysMap);

  // Filter unremediated reproduced findings
  const unremediatedFindings = reproducedFindings.filter((f) => f.patchReports.length === 0);

  // Check if project is completely new (empty state)
  const isNewProject = totalFindingsCount === 0 && totalRunsCount === 0;

  return (
    <div className="max-w-[1200px] mx-auto w-full space-y-6 font-sans pb-16">
      {/* Top Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-text tracking-tight">
              {activeProject.name}
            </h1>
            {activeProject.isDemo && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Demo Workspace
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {activeProject.repoOwner}/{activeProject.repoName} on branch{" "}
            <code className="text-text font-mono text-[11px]">{activeProject.defaultBranch}</code>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/app/repositories/${activeProject.id}`}>
            <Button variant="secondary" size="sm" className="gap-1.5 cursor-pointer">
              <Play className="w-3.5 h-3.5 text-accent" />
              <span>Run scan</span>
            </Button>
          </Link>
          <Link href="/app/dependencies">
            <Button variant="secondary" size="sm" className="gap-1.5 cursor-pointer">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>Scan dependencies</span>
            </Button>
          </Link>
          <Link href="/app/findings/import">
            <Button variant="primary" size="sm" className="gap-1.5 cursor-pointer">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Import report</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* New Project Empty State (if 0 findings & 0 runs) */}
      {isNewProject ? (
        <Card className="p-8 text-center border-border">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-surface-raised flex items-center justify-center border border-border">
              <FolderGit2 className="w-6 h-6 text-accent" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-text">Workspace Connected</h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                Your repository is set up. Run your first security scan or import an external SARIF/Semgrep report to begin isolated container verification.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link href={`/app/repositories/${activeProject.id}`}>
                <Button variant="primary" size="sm" className="gap-1.5">
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Initial Scan</span>
                </Button>
              </Link>
              <Link href="/app/findings/import">
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Import Scanner JSON</span>
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Linear-Inspired Dense KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* KPI 1: Open Findings */}
            <div className="p-3.5 rounded-[6px] border border-border bg-surface hover:border-border-strong transition-colors space-y-1.5">
              <div className="flex items-center justify-between text-xs text-text-tertiary">
                <span className="font-medium text-[11px] uppercase tracking-wider font-mono">Open Findings</span>
                <Bug className="w-3.5 h-3.5 text-text-tertiary" />
              </div>
              <div className="text-2xl font-bold font-mono text-text tabular-nums">
                {openFindingsCount}
              </div>
              <div className="text-[11px] text-text-tertiary font-mono">
                {totalFindingsCount} total discovered
              </div>
            </div>

            {/* KPI 2: Verification States */}
            <div className="p-3.5 rounded-[6px] border border-border bg-surface hover:border-border-strong transition-colors space-y-1.5">
              <div className="flex items-center justify-between text-xs text-text-tertiary">
                <span className="font-medium text-[11px] uppercase tracking-wider font-mono">Verification State</span>
                <Terminal className="w-3.5 h-3.5 text-text-tertiary" />
              </div>
              <div className="text-xs font-mono space-y-1 pt-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Reproduced:
                  </span>
                  <span className="font-semibold text-text tabular-nums">{stateCounts.REPRODUCED}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Not Repro:
                  </span>
                  <span className="font-semibold text-text tabular-nums">{stateCounts.NOT_REPRODUCED}</span>
                </div>
              </div>
              <div className="text-[10px] text-text-tertiary font-mono truncate">
                {stateCounts.UNVERIFIED} unverified, {stateCounts.INCONCLUSIVE + stateCounts.EXECUTION_ERROR} other
              </div>
            </div>

            {/* KPI 3: Runs in Last 7 Days */}
            <div className="p-3.5 rounded-[6px] border border-border bg-surface hover:border-border-strong transition-colors space-y-1.5">
              <div className="flex items-center justify-between text-xs text-text-tertiary">
                <span className="font-medium text-[11px] uppercase tracking-wider font-mono">Runs (7 Days)</span>
                <Clock className="w-3.5 h-3.5 text-text-tertiary" />
              </div>
              <div className="text-2xl font-bold font-mono text-accent tabular-nums">
                {runsLast7DaysCount}
              </div>
              <div className="text-[11px] text-text-tertiary font-mono">
                {totalRunsCount} all-time container runs
              </div>
            </div>

            {/* KPI 4: Patch Verdicts */}
            <div className="p-3.5 rounded-[6px] border border-border bg-surface hover:border-border-strong transition-colors space-y-1.5">
              <div className="flex items-center justify-between text-xs text-text-tertiary">
                <span className="font-medium text-[11px] uppercase tracking-wider font-mono">Patch Verdicts</span>
                <FileCheck2 className="w-3.5 h-3.5 text-text-tertiary" />
              </div>
              <div className="text-xs font-mono space-y-1 pt-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Fix Verified:
                  </span>
                  <span className="font-semibold text-text tabular-nums">{verdictCounts.FIX_VERIFIED}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Regression:
                  </span>
                  <span className="font-semibold text-text tabular-nums">{verdictCounts.REGRESSION_FAILURE}</span>
                </div>
              </div>
              <div className="text-[10px] text-text-tertiary font-mono truncate">
                {verdictCounts.PATCH_NOT_VERIFIED} unverified patch(es)
              </div>
            </div>

            {/* KPI 5: Dependencies with Advisories */}
            <div className="p-3.5 rounded-[6px] border border-border bg-surface hover:border-border-strong transition-colors space-y-1.5">
              <div className="flex items-center justify-between text-xs text-text-tertiary">
                <span className="font-medium text-[11px] uppercase tracking-wider font-mono">Advisories</span>
                <Package className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className={`text-2xl font-bold font-mono tabular-nums ${
                advisoryDependenciesCount > 0 ? "text-amber-400" : "text-emerald-400"
              }`}>
                {advisoryDependenciesCount}
              </div>
              <div className="text-[11px] text-text-tertiary font-mono">
                <Link href="/app/dependencies" className="hover:text-accent underline transition-colors">
                  View dependency inventory →
                </Link>
              </div>
            </div>
          </div>

          {/* Runs Per Day SVG Sparkline Chart */}
          <Card className="border-border overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-border/60 bg-surface-raised/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                <CardTitle className="text-xs font-semibold uppercase tracking-wider font-mono">
                  Verification Execution Activity
                </CardTitle>
              </div>
              <Link href="/app/runs" className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1">
                <span>View all runs</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-4">
              <RunsSparklineChart data={chartData} />
            </CardContent>
          </Card>

          {/* Main 2-Column Section: Tables & Attention Needed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 7 Cols: Recent Runs & Recent Patch Reports */}
            <div className="lg:col-span-7 space-y-5">
              {/* Recent Verification Runs Table */}
              <Card className="border-border overflow-hidden">
                <CardHeader className="py-3 px-4 border-b border-border/60 bg-surface-raised/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-accent" />
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider font-mono">
                      Recent Verification Runs
                    </CardTitle>
                  </div>
                  <Link href="/app/runs" className="text-[11px] font-mono text-text-secondary hover:text-text">
                    See all ({totalRunsCount})
                  </Link>
                </CardHeader>
                {recentRuns.length === 0 ? (
                  <div className="p-6 text-center text-xs text-text-tertiary font-mono">
                    No verification runs executed yet.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {recentRuns.map((run) => (
                      <Link
                        key={run.id}
                        href={`/app/runs/${run.id}`}
                        className="p-3 px-4 flex items-center justify-between gap-3 text-xs hover:bg-surface-hover/80 transition-colors group"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={run.status} size="sm" />
                            <span className="font-mono text-[11px] text-text-tertiary">
                              #{run.id.slice(-8)}
                            </span>
                            <span className="font-mono text-[11px] text-text-secondary">
                              ({run.commitSha.slice(0, 7)})
                            </span>
                          </div>
                          <div className="text-text font-medium truncate group-hover:text-accent transition-colors">
                            {run.finding?.title || run.reproducerId || "Security reproducer run"}
                          </div>
                        </div>

                        <div className="text-right font-mono text-[11px] text-text-tertiary flex-shrink-0">
                          <div>{formatRelativeTime(run.createdAt)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>

              {/* Recent Patch Reports Table */}
              <Card className="border-border overflow-hidden">
                <CardHeader className="py-3 px-4 border-b border-border/60 bg-surface-raised/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-purple-400" />
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider font-mono">
                      Recent Patch Reports
                    </CardTitle>
                  </div>
                  <Link href="/app/reports" className="text-[11px] font-mono text-text-secondary hover:text-text">
                    See all
                  </Link>
                </CardHeader>
                {recentReports.length === 0 ? (
                  <div className="p-6 text-center text-xs text-text-tertiary font-mono">
                    No patch reports generated yet.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {recentReports.map((report) => (
                      <Link
                        key={report.id}
                        href={`/app/reports/${report.id}`}
                        className="p-3 px-4 flex items-center justify-between gap-3 text-xs hover:bg-surface-hover/80 transition-colors group"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge status={report.verdict} size="sm" />
                            <span className="font-mono text-[11px] text-text-secondary">
                              {report.baselineCommit.slice(0, 7)} → {report.candidateCommit.slice(0, 7)}
                            </span>
                            {report.decisions?.[0] && (
                              <ReviewDecisionBadge decision={report.decisions[0].decision} />
                            )}
                          </div>
                          <div className="text-text font-medium truncate group-hover:text-accent transition-colors">
                            {report.finding?.title || "Patch report"}
                          </div>
                        </div>

                        <div className="text-right font-mono text-[11px] text-text-tertiary flex-shrink-0">
                          <div>{formatRelativeTime(report.createdAt)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right 5 Cols: Attention Needed List */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="border-border overflow-hidden">
                <CardHeader className="py-3 px-4 border-b border-border/60 bg-surface-raised/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider font-mono">
                      Attention Needed
                    </CardTitle>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-text-tertiary">
                    {unremediatedFindings.length + regressionAlerts.length + failedJobs.length} Alerts
                  </span>
                </CardHeader>
                <div className="p-4 space-y-3">
                  {unremediatedFindings.length === 0 &&
                  regressionAlerts.length === 0 &&
                  failedJobs.length === 0 ? (
                    <div className="p-4 rounded-[6px] border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Zero active alerts. All reproduced vulnerabilities have candidate fixes and runner jobs are healthy.</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {/* Alert Type 1: Reproduced Findings without Verified Fix */}
                      {unremediatedFindings.map((f) => (
                        <Link
                          key={f.id}
                          href={`/app/findings/${f.id}`}
                          className="block p-2.5 rounded-[6px] border border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50 transition-colors text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400 uppercase">
                              <XCircle className="w-3 h-3" />
                              Reproduced (Unfixed)
                            </span>
                            <span className="text-[10px] font-mono text-text-tertiary">{f.ruleId}</span>
                          </div>
                          <div className="text-text font-medium truncate">{f.title}</div>
                          <div className="text-[11px] text-text-tertiary font-mono">
                            No candidate patch with FIX_VERIFIED yet.
                          </div>
                        </Link>
                      ))}

                      {/* Alert Type 2: Regression Failures */}
                      {regressionAlerts.map((rep) => (
                        <Link
                          key={rep.id}
                          href={`/app/reports/${rep.id}`}
                          className="block p-2.5 rounded-[6px] border border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 transition-colors text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 uppercase">
                              <AlertTriangle className="w-3 h-3" />
                              Regression Alert
                            </span>
                            <span className="text-[10px] font-mono text-text-tertiary">
                              {rep.baselineCommit.slice(0, 7)} → {rep.candidateCommit.slice(0, 7)}
                            </span>
                          </div>
                          <div className="text-text font-medium truncate">
                            {rep.finding?.title || "Patch introduced functional side-effects"}
                          </div>
                          <div className="text-[11px] text-text-tertiary font-mono">
                            Candidate commit failed baseline unit tests.
                          </div>
                        </Link>
                      ))}

                      {/* Alert Type 3: Failed Worker Jobs */}
                      {failedJobs.map((job) => (
                        <div
                          key={job.id}
                          className="p-2.5 rounded-[6px] border border-border bg-surface text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-text-secondary uppercase">
                              <Terminal className="w-3 h-3 text-rose-400" />
                              Job Failed ({job.type})
                            </span>
                            <span className="text-[10px] font-mono text-text-tertiary">
                              {formatRelativeTime(job.createdAt)}
                            </span>
                          </div>
                          <div className="text-text-secondary font-mono text-[11px] truncate">
                            {job.error || "Execution terminated unexpectedly."}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Execution Guard Notice */}
              <div className="p-3 rounded-[6px] border border-border bg-surface text-xs space-y-1">
                <div className="flex items-center gap-2 font-medium text-text">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                  <span>Execution Safety Guard</span>
                </div>
                <p className="text-[11px] text-text-tertiary leading-relaxed">
                  Worker executions run inside unprivileged, ephemeral sandbox containers with strict timeout limits and resource quotas.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
