"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Filter,
  Search,
  ArrowRight,
  GitCompare,
  RotateCcw,
  Shield,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

function formatDate(isoStr) {
  if (!isoStr) return "—";
  try {
    return new Date(isoStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoStr;
  }
}

export function ReviewDecisionBadge({ decision }) {
  if (decision === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" />
        <span>Approved</span>
      </span>
    );
  }
  if (decision === "CHANGES_REQUESTED") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <AlertTriangle className="w-3 h-3" />
        <span>Changes requested</span>
      </span>
    );
  }
  if (decision === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <XCircle className="w-3 h-3" />
        <span>Rejected</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-text-tertiary bg-surface-raised border border-border/80">
      Pending
    </span>
  );
}

export function ReportsClient({ reports = [] }) {
  const [verdictFilter, setVerdictFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      if (verdictFilter !== "ALL" && rep.verdict !== verdictFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const findingTitle = rep.finding?.title?.toLowerCase() || "";
        const ruleId = rep.finding?.ruleId?.toLowerCase() || "";
        const baseline = rep.baselineCommit?.toLowerCase() || "";
        const candidate = rep.candidateCommit?.toLowerCase() || "";
        const repId = rep.id?.toLowerCase() || "";
        return (
          findingTitle.includes(q) ||
          ruleId.includes(q) ||
          baseline.includes(q) ||
          candidate.includes(q) ||
          repId.includes(q)
        );
      }
      return true;
    });
  }, [reports, verdictFilter, searchQuery]);

  const hasActiveFilters = verdictFilter !== "ALL" || Boolean(searchQuery.trim());

  return (
    <div className="space-y-4 font-sans w-full max-w-[1200px] mx-auto">
      <PageHeader
        title="Patch reports"
        description="Candidate fix verifications, side-effect regression checks, and tamper-evident PR verification artifacts."
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border text-xs">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {/* Search Input */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search by title, rule, or commit SHA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-2.5 rounded-[6px] border border-border bg-surface text-xs font-sans text-text placeholder:text-text-tertiary outline-none focus:border-accent"
            />
          </div>

          {/* Verdict Filter */}
          <div className="flex items-center gap-1.5 px-2.5 h-8 rounded-[6px] border border-border bg-surface text-text-secondary">
            <Filter className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
            <span className="text-[11px] text-text-tertiary">Verdict:</span>
            <select
              value={verdictFilter}
              onChange={(e) => setVerdictFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-text outline-none cursor-pointer pr-1"
            >
              <option value="ALL">All verdicts</option>
              <option value="FIX_VERIFIED">Fix Verified</option>
              <option value="PATCH_NOT_VERIFIED">Patch Not Verified</option>
              <option value="REGRESSION_FAILURE">Regression Failure</option>
              <option value="INCONCLUSIVE">Inconclusive</option>
              <option value="EXECUTION_ERROR">Execution Error</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setVerdictFilter("ALL");
                setSearchQuery("");
              }}
              className="text-[11px] text-text-tertiary hover:text-accent flex items-center gap-1 transition-colors px-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset filters
            </button>
          )}
        </div>

        <div className="text-[11px] font-mono text-text-tertiary tabular-nums self-end sm:self-center">
          {filteredReports.length} of {reports.length} {reports.length === 1 ? "report" : "reports"}
        </div>
      </div>

      {/* Reports Table or Empty State */}
      {filteredReports.length === 0 ? (
        <EmptyState
          icon={<FileCheck2 className="w-5 h-5 text-text-secondary" aria-hidden="true" />}
          title={hasActiveFilters ? "No matching patch reports" : "No patch reports generated"}
          description={
            hasActiveFilters
              ? "No reports match your current filter and search criteria."
              : "When a proposed fix is validated, PatchProof proves exploit neutralization and verifies regression test suites."
          }
          action={
            hasActiveFilters ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setVerdictFilter("ALL");
                  setSearchQuery("");
                }}
              >
                Reset filters
              </Button>
            ) : (
              <Link href="/app/findings">
                <Button variant="primary" size="sm">
                  <GitCompare className="w-3.5 h-3.5 mr-1.5" />
                  Validate a finding fix
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <Card className="overflow-hidden border-border divide-y divide-border">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-3 p-3 px-4 bg-surface-raised/40 text-[11px] font-semibold text-text-secondary uppercase tracking-wider select-none">
            <div className="col-span-3 sm:col-span-2">Verdict</div>
            <div className="col-span-6 sm:col-span-4">Finding</div>
            <div className="hidden sm:block sm:col-span-2">Comparison</div>
            <div className="hidden sm:block sm:col-span-2">Created</div>
            <div className="col-span-3 sm:col-span-2 text-right">Reviewer Decision</div>
          </div>

          {/* Report Rows */}
          {filteredReports.map((rep) => {
            const reviewerDecision = rep.decisions?.[0]?.decision;

            return (
              <Link
                key={rep.id}
                href={`/app/reports/${rep.id}`}
                className="grid grid-cols-12 gap-3 p-3.5 px-4 items-center hover:bg-surface-hover/80 transition-colors text-xs group"
              >
                {/* Verdict Badge */}
                <div className="col-span-3 sm:col-span-2 flex items-center">
                  <StatusBadge status={rep.verdict} size="sm" />
                </div>

                {/* Finding Title & Rule */}
                <div className="col-span-6 sm:col-span-4 min-w-0 pr-2">
                  <div
                    className="font-medium text-text group-hover:text-accent transition-colors truncate"
                    title={rep.finding?.title || "Security Finding"}
                  >
                    {rep.finding?.title || "Security Finding"}
                  </div>
                  <div className="text-[11px] text-text-tertiary font-mono truncate">
                    {rep.finding?.ruleId || "rule"}
                  </div>
                </div>

                {/* Comparison Baseline -> Candidate */}
                <div className="hidden sm:flex sm:col-span-2 items-center gap-1.5 font-mono text-[11px] text-text-secondary">
                  <span className="px-1.5 py-0.5 rounded bg-surface border border-border text-text">
                    {rep.baselineCommit.slice(0, 7)}
                  </span>
                  <span className="text-text-tertiary">→</span>
                  <span className="px-1.5 py-0.5 rounded bg-surface border border-border text-accent font-medium">
                    {rep.candidateCommit.slice(0, 7)}
                  </span>
                </div>

                {/* Created Timestamp */}
                <div className="hidden sm:block sm:col-span-2 text-[11px] text-text-tertiary font-mono">
                  {formatDate(rep.createdAt)}
                </div>

                {/* Reviewer Decision */}
                <div className="col-span-3 sm:col-span-2 text-right flex items-center justify-end gap-2">
                  <ReviewDecisionBadge decision={reviewerDecision} />
                  <ArrowRight className="w-3.5 h-3.5 text-text-tertiary group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </Card>
      )}
    </div>
  );
}

