"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Terminal,
  Play,
  Search,
  GitCommit,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

function formatRelativeTime(dateStr) {
  if (!dateStr) return "—";
  const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

export function RunsClient({ initialRuns = [], projectFindings = [], activeProject = null }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [findingFilter, setFindingFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Live auto-refresh while any run is active or pending
  useEffect(() => {
    const hasActiveRun = initialRuns.some(
      (r) => r.status === "UNVERIFIED" || !r.finishedAt
    );

    if (!hasActiveRun) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 2000);

    return () => clearInterval(interval);
  }, [initialRuns, router]);

  const filteredRuns = useMemo(() => {
    return initialRuns.filter((run) => {
      // Status filter
      if (statusFilter !== "ALL") {
        const s = (run.status || "").toUpperCase();
        if (s !== statusFilter.toUpperCase()) {
          return false;
        }
      }

      // Finding filter
      if (findingFilter !== "ALL") {
        const runFindingId = run.findingId || run.finding?.id;
        if (runFindingId !== findingFilter) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesFinding = run.finding?.title?.toLowerCase().includes(q);
        const matchesCommit = run.commitSha?.toLowerCase().includes(q);
        const matchesReproducer = run.reproducerId?.toLowerCase().includes(q);
        const matchesId = run.id?.toLowerCase().includes(q);
        if (!matchesFinding && !matchesCommit && !matchesReproducer && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [initialRuns, statusFilter, findingFilter, searchQuery]);

  return (
    <div className="space-y-4 font-sans w-full max-w-[1200px] mx-auto">
      <PageHeader
        title="Verification runs"
        description="Isolated sandbox test executions measuring exploit reproducibility and recording deterministic execution evidence."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.refresh()}
              title="Refresh runs"
              aria-label="Refresh runs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            {activeProject && (
              <Link href="/app/findings">
                <Button variant="primary" size="sm">
                  <Play className="w-3.5 h-3.5 flex-shrink-0 fill-current" />
                  Select finding to verify
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-border text-xs">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[240px]">
          {/* Search Field */}
          <div className="relative min-w-[180px] max-w-xs flex-1">
            <Search className="w-3.5 h-3.5 text-text-tertiary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search finding, commit, reproducer..."
              aria-label="Search verification runs"
              className="w-full h-8 pl-8 pr-2.5 rounded-[5px] border border-border bg-surface text-xs text-text placeholder:text-text-tertiary outline-none focus:border-accent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by verdict status"
            className="h-8 px-2.5 rounded-[5px] border border-border bg-surface text-xs text-text outline-none focus:border-accent cursor-pointer"
          >
            <option value="ALL">All Verdicts</option>
            <option value="REPRODUCED">Reproduced</option>
            <option value="NOT_REPRODUCED">Not Reproduced</option>
            <option value="INCONCLUSIVE">Inconclusive</option>
            <option value="EXECUTION_ERROR">Execution Error</option>
          </select>

          {/* Finding Filter */}
          {projectFindings.length > 0 && (
            <select
              value={findingFilter}
              onChange={(e) => setFindingFilter(e.target.value)}
              aria-label="Filter by finding"
              className="h-8 px-2.5 rounded-[5px] border border-border bg-surface text-xs text-text outline-none focus:border-accent max-w-[220px] truncate cursor-pointer"
            >
              <option value="ALL">All Findings</option>
              {projectFindings.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="text-[11px] font-mono text-text-tertiary tabular-nums">
          {filteredRuns.length} of {initialRuns.length} run{initialRuns.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Linear-Style Verification Runs Table */}
      {filteredRuns.length === 0 ? (
        <EmptyState
          icon={<Terminal className="w-4 h-4 text-text-secondary" />}
          title={initialRuns.length === 0 ? "No verification runs executed yet" : "No matching verification runs"}
          description={
            initialRuns.length === 0
              ? "Open any finding and execute a verification harness in an isolated container sandbox to confirm exploitability."
              : "No verification runs match your current verdict or finding filter. Try selecting 'All Verdicts' or 'All Findings'."
          }
          action={
            initialRuns.length === 0 ? (
              <Link href="/app/findings">
                <Button variant="secondary" size="sm">
                  View findings to verify
                </Button>
              </Link>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setStatusFilter("ALL");
                  setFindingFilter("ALL");
                  setSearchQuery("");
                }}
              >
                Reset filters
              </Button>
            )
          }
        />
      ) : (
        <div className="border border-border rounded-[6px] bg-surface overflow-hidden divide-y divide-border/70">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-3.5 py-2.5 bg-surface-raised/40 text-[11px] font-mono text-text-tertiary select-none">
            <div className="col-span-3 sm:col-span-2">Verdict</div>
            <div className="col-span-5 sm:col-span-4">Finding Title</div>
            <div className="col-span-2 sm:col-span-2">Commit</div>
            <div className="col-span-2 hidden sm:block">Reproducer</div>
            <div className="col-span-1 hidden sm:block">Duration</div>
            <div className="col-span-2 sm:col-span-1 text-right">Started</div>
          </div>

          {/* Table Rows */}
          {filteredRuns.map((run) => (
            <Link
              key={run.id}
              href={`/app/runs/${run.id}`}
              className="grid grid-cols-12 gap-2 px-3.5 py-2.5 text-xs items-center hover:bg-surface-hover/60 transition-colors group outline-none focus-visible:bg-surface-hover"
            >
              {/* Status Badge */}
              <div className="col-span-3 sm:col-span-2 flex items-center gap-1.5 truncate">
                <StatusBadge status={run.status} size="sm" />
              </div>

              {/* Finding Title */}
              <div className="col-span-5 sm:col-span-4 truncate">
                <span className="font-medium text-text group-hover:text-accent transition-colors truncate block" title={run.finding?.title || "Finding"}>
                  {run.finding?.title || "Vulnerability Finding"}
                </span>
                <span className="text-[11px] font-mono text-text-tertiary truncate block">
                  {run.finding?.filePath ? `${run.finding.filePath}:${run.finding.lineStart || 1}` : run.findingId}
                </span>
              </div>

              {/* Commit SHA */}
              <div className="col-span-2 sm:col-span-2 font-mono text-xs text-text-secondary flex items-center gap-1 truncate">
                <GitCommit className="w-3 h-3 text-text-tertiary flex-shrink-0" />
                <span className="truncate">{run.commitSha ? run.commitSha.slice(0, 7) : "—"}</span>
              </div>

              {/* Reproducer */}
              <div className="col-span-2 hidden sm:block font-mono text-[11px] text-text-tertiary truncate">
                {run.reproducerId || "sqli_find_user"}
              </div>

              {/* Duration */}
              <div className="col-span-1 hidden sm:block font-mono text-text-secondary text-[11px] tabular-nums">
                {run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : "—"}
              </div>

              {/* Started Time */}
              <div
                className="col-span-2 sm:col-span-1 text-right font-mono text-[11px] text-text-tertiary truncate"
                suppressHydrationWarning
              >
                {formatRelativeTime(run.startedAt || run.createdAt)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
