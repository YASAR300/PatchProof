import React from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  FolderGit2,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  FileCode,
  ShieldCheck,
  Activity,
  History,
} from "lucide-react";
import { requireUser } from "@/auth";
import { getActiveProject } from "@/lib/projects";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/app/PageHeader";
import {
  ConnectRepositoryButton,
  AddDemoProjectButton,
  OverviewHeaderActions,
} from "@/components/app/OverviewActions";
import { CopyButton } from "@/components/app/CopyButton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Overview",
  description: "PatchProof verification posture overview",
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

function getManifestType(fileName) {
  if (fileName.endsWith(".txt") || fileName.endsWith(".toml")) return "Python";
  if (fileName.includes("pnpm")) return "pnpm";
  if (fileName.includes("yarn")) return "Yarn";
  if (fileName.includes("package")) return "npm";
  return "Package";
}

export default async function OverviewPage() {
  const user = await requireUser();
  const cookieStore = await cookies();
  const { activeProject, userProjects } = await getActiveProject(
    cookieStore,
    user.id
  );

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

  // Active project scoped overview
  const manifests = Array.isArray(activeProject.detectedManifests)
    ? activeProject.detectedManifests
    : [];

  const [auditEvents, findingsCount, runsCount] = await Promise.all([
    prisma.auditEvent.findMany({
      where: { projectId: activeProject.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: true },
    }),
    prisma.finding.count({ where: { projectId: activeProject.id } }),
    prisma.verificationRun.count({ where: { projectId: activeProject.id } }),
  ]);

  const shortSha = activeProject.latestCommitSha
    ? activeProject.latestCommitSha.slice(0, 7)
    : "—";

  return (
    <div className="max-w-[1200px] mx-auto w-full space-y-5 font-sans">
      <PageHeader
        title={activeProject.name}
        description={`Scoped workspace for ${activeProject.repoOwner}/${activeProject.repoName} on branch ${activeProject.defaultBranch}.`}
        actions={<OverviewHeaderActions repositoryId={activeProject.id} />}
      />

      {/* Main & Aside layout (stacked below 1024px) */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Main Column (Flexible) */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* a) Execution restriction notice */}
          <div className="h-9 px-3 rounded-[6px] border border-border bg-surface text-text-secondary text-xs flex items-center gap-2 select-none">
            <ShieldAlert className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" aria-hidden="true" />
            <span className="truncate">Static analysis only. Test execution is disabled for this repository.</span>
          </div>

          {/* b) 'Get started' checklist panel */}
          <Card>
            <CardHeader>
              <CardTitle>Get started</CardTitle>
              <span className="text-[11px] font-mono text-text-tertiary">
                {findingsCount > 0 ? "1 of 4 completed" : "0 of 4 completed"}
              </span>
            </CardHeader>
            <div className="divide-y divide-border">
              {/* Step 1: Run a scan */}
              <div className="h-10 px-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <Circle className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium text-text">1. Run a scan</span>
                  <span className="text-[11px] text-text-tertiary hidden sm:inline truncate">
                    — Trigger static analysis on {activeProject.defaultBranch}
                  </span>
                </div>
                <Link
                  href={`/app/repositories/${activeProject.id}`}
                  className="text-xs text-accent hover:underline flex-shrink-0 ml-2"
                >
                  Scan repository
                </Link>
              </div>

              {/* Step 2: Review findings */}
              <div className="h-10 px-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <Circle className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium text-text">2. Review findings</span>
                  <span className="text-[11px] text-text-tertiary hidden sm:inline truncate">
                    — Inspect detected weaknesses and vulnerabilities
                  </span>
                </div>
                <Link
                  href="/app/findings"
                  className="text-xs text-text-secondary hover:text-text flex-shrink-0 ml-2"
                >
                  View findings
                </Link>
              </div>

              {/* Step 3: Verify a finding */}
              <div className="h-10 px-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <Circle className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium text-text-secondary">3. Verify a finding</span>
                  <span className="text-[11px] text-text-tertiary hidden sm:inline truncate">
                    — Reproduce in disposable isolated container
                  </span>
                </div>
                <span className="text-[11px] text-text-tertiary flex-shrink-0 ml-2 italic">
                  Not available: test execution is disabled for this repository
                </span>
              </div>

              {/* Step 4: Validate a patch */}
              <div className="h-10 px-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <Circle className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium text-text-secondary">4. Validate a patch</span>
                  <span className="text-[11px] text-text-tertiary hidden sm:inline truncate">
                    — Prove fix works without regression
                  </span>
                </div>
                <span className="text-[11px] text-text-tertiary flex-shrink-0 ml-2 italic">
                  Not available: test execution is disabled for this repository
                </span>
              </div>
            </div>
          </Card>

          {/* c) 'Recent activity' panel */}
          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <Link
                href="/app/audit"
                className="text-[11px] text-text-secondary hover:text-text transition-colors flex items-center gap-1"
              >
                <span>View audit log</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            {auditEvents.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-secondary">
                No activity yet. Run a scan to get started.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {auditEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="h-9 px-3.5 flex items-center justify-between text-xs hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Activity className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
                      <span className="text-text font-normal truncate">
                        {evt.action === "PROJECT_CREATED"
                          ? `Project repository ${activeProject.name} connected`
                          : evt.action === "PROJECT_UPDATED"
                          ? `Repository settings updated`
                          : evt.action}
                      </span>
                    </div>
                    <span
                      className="text-[11px] font-mono text-text-tertiary flex-shrink-0 ml-3 tabular-nums"
                      title={new Date(evt.createdAt).toISOString()}
                    >
                      {formatRelativeTime(evt.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Aside Column (320px fixed on desktop) */}
        <div className="w-full lg:w-[320px] lg:flex-shrink-0 space-y-4">
          {/* d) 'Properties' panel */}
          <Card>
            <CardHeader>
              <CardTitle>Properties</CardTitle>
              <Link
                href={`/app/repositories/${activeProject.id}`}
                className="text-[11px] text-text-secondary hover:text-text transition-colors"
              >
                Manage repository
              </Link>
            </CardHeader>
            <div className="divide-y divide-border/60">
              {/* Repository */}
              <div className="h-8 px-3.5 flex items-center justify-between text-xs">
                <span className="text-text-tertiary text-[11px]">Repository</span>
                <a
                  href={activeProject.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-text hover:text-accent flex items-center gap-1 group truncate max-w-[180px]"
                  title="Open on GitHub"
                >
                  <span className="truncate">{activeProject.repoOwner}/{activeProject.repoName}</span>
                  <ExternalLink className="w-3 h-3 text-text-tertiary group-hover:text-accent flex-shrink-0" />
                </a>
              </div>

              {/* Branch */}
              <div className="h-8 px-3.5 flex items-center justify-between text-xs">
                <span className="text-text-tertiary text-[11px]">Branch</span>
                <span className="font-mono text-xs text-text">{activeProject.defaultBranch}</span>
              </div>

              {/* Language */}
              <div className="h-8 px-3.5 flex items-center justify-between text-xs">
                <span className="text-text-tertiary text-[11px]">Language</span>
                <span className="text-xs text-text font-medium">{activeProject.language || "Python"}</span>
              </div>

              {/* Latest commit */}
              <div className="h-8 px-3.5 flex items-center justify-between text-xs group">
                <span className="text-text-tertiary text-[11px]">Latest commit</span>
                <div className="flex items-center gap-1 font-mono text-xs text-text">
                  <span>{shortSha}</span>
                  {activeProject.latestCommitSha && (
                    <CopyButton text={activeProject.latestCommitSha} />
                  )}
                </div>
              </div>

              {/* Last scan */}
              <div className="h-8 px-3.5 flex items-center justify-between text-xs">
                <span className="text-text-tertiary text-[11px]">Last scan</span>
                <span className="text-xs text-text-secondary">Never scanned</span>
              </div>

              {/* Execution mode */}
              <div className="h-8 px-3.5 flex items-center justify-between text-xs">
                <span className="text-text-tertiary text-[11px]">Execution mode</span>
                <span className="text-xs text-text">Static Analysis Only</span>
              </div>
            </div>
          </Card>

          {/* e) 'Detected manifests' panel */}
          <Card>
            <CardHeader>
              <CardTitle>Detected manifests</CardTitle>
              <span className="text-[11px] font-mono text-text-tertiary tabular-nums">
                {manifests.length}
              </span>
            </CardHeader>
            {manifests.length === 0 ? (
              <div className="p-4 text-xs text-text-tertiary italic">
                No manifests detected at root or one level down.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {manifests.map((manifest) => (
                  <div
                    key={manifest}
                    className="h-8 px-3.5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-xs text-text truncate">{manifest}</span>
                      <span className="text-[11px] text-text-tertiary">
                        ({getManifestType(manifest)})
                      </span>
                    </div>
                    <Link
                      href="/app/dependencies"
                      className="text-[11px] text-text-secondary hover:text-text transition-colors flex-shrink-0 ml-2"
                    >
                      Scan dependencies
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
