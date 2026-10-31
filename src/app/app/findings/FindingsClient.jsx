"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bug,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
  Shield,
  FileCode,
  Layers,
  ArrowUpDown,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";

// Format relative date
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

export function FindingsClient({ initialFindings = [], initialProjectId = null }) {
  const router = useRouter();
  const [findings, setFindings] = useState(initialFindings);
  const [loading, setLoading] = useState(false);

  // Grouping mode: 'severity' or 'verificationState'
  const [groupBy, setGroupBy] = useState("severity");

  // Filters & search
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState("ALL");
  const [triageFilter, setTriageFilter] = useState("ALL");

  // Keyboard navigation state
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Refetch findings on filter change
  const fetchFindings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (initialProjectId) params.set("projectId", initialProjectId);
      if (severityFilter !== "ALL") params.set("severity", severityFilter);
      if (sourceFilter !== "ALL") params.set("source", sourceFilter);
      if (verificationFilter !== "ALL") params.set("verificationState", verificationFilter);
      if (triageFilter !== "ALL") params.set("triageStatus", triageFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/findings?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.ok && Array.isArray(data.findings)) {
        setFindings(data.findings);
      }
    } catch {
      // transient network error
    } finally {
      setLoading(false);
    }
  }, [initialProjectId, severityFilter, sourceFilter, verificationFilter, triageFilter, search]);

  // Filter in memory for instantaneous keystroke responsiveness
  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      if (severityFilter !== "ALL" && f.severity !== severityFilter) return false;
      if (sourceFilter !== "ALL" && f.source !== sourceFilter) return false;
      if (verificationFilter !== "ALL" && f.verificationState !== verificationFilter) return false;
      if (triageFilter !== "ALL" && f.triageStatus !== triageFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = f.title.toLowerCase().includes(q);
        const matchesRule = f.ruleId.toLowerCase().includes(q);
        const matchesFile = f.filePath.toLowerCase().includes(q);
        const matchesCwe = f.cwe ? f.cwe.toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesRule && !matchesFile && !matchesCwe) return false;
      }
      return true;
    });
  }, [findings, severityFilter, sourceFilter, verificationFilter, triageFilter, search]);

  // Grouped findings mapping
  const groupedFindings = useMemo(() => {
    if (groupBy === "severity") {
      const order = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
      const map = new Map();
      order.forEach((sev) => map.set(sev, []));
      filteredFindings.forEach((f) => {
        const arr = map.get(f.severity) || [];
        arr.push(f);
        map.set(f.severity, arr);
      });
      return Array.from(map.entries()).filter(([_, items]) => items.length > 0);
    } else {
      // Group by verificationState
      const order = ["UNVERIFIED", "REPRODUCED", "NOT_REPRODUCED", "INCONCLUSIVE", "EXECUTION_ERROR"];
      const map = new Map();
      order.forEach((state) => map.set(state, []));
      filteredFindings.forEach((f) => {
        const arr = map.get(f.verificationState) || [];
        arr.push(f);
        map.set(f.verificationState, arr);
      });
      return Array.from(map.entries()).filter(([_, items]) => items.length > 0);
    }
  }, [filteredFindings, groupBy]);

  // Flat list of visible findings for index navigation
  const flatVisible = useMemo(() => {
    return groupedFindings.flatMap(([_, items]) => items);
  }, [groupedFindings]);

  // Keyboard navigation (J / K / Enter / X)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is currently typing in an input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) {
        return;
      }

      if (e.key === "j" || e.key === "J" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatVisible.length - 1));
      } else if (e.key === "k" || e.key === "K" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const active = flatVisible[selectedIndex];
        if (active) {
          router.push(`/app/findings/${active.id}`);
        }
      } else if (e.key === "x" || e.key === "X") {
        e.preventDefault();
        const active = flatVisible[selectedIndex];
        if (active) {
          setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(active.id)) next.delete(active.id);
            else next.add(active.id);
            return next;
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flatVisible, selectedIndex, router]);

  return (
    <div className="space-y-4 font-sans w-full max-w-[1400px] mx-auto">
      <PageHeader
        title="Findings"
        description="Detected code weaknesses and security advisories tracked with deterministic reproduction status."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchFindings}
              disabled={loading}
              title="Refresh findings"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <div className="flex items-center border border-border rounded-[6px] p-0.5 bg-surface text-xs font-mono">
              <button
                type="button"
                onClick={() => setGroupBy("severity")}
                className={`px-2 py-0.5 rounded-[4px] transition-colors ${
                  groupBy === "severity"
                    ? "bg-surface-selected text-text font-medium"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                Severity
              </button>
              <button
                type="button"
                onClick={() => setGroupBy("verificationState")}
                className={`px-2 py-0.5 rounded-[4px] transition-colors ${
                  groupBy === "verificationState"
                    ? "bg-surface-selected text-text font-medium"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                Verification
              </button>
            </div>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-[8px] bg-surface border border-border text-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-3.5 h-3.5 text-text-tertiary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, rule ID, file, or CWE..."
            className="w-full h-8 pl-8 pr-3 rounded-[6px] border border-border bg-surface-raised/40 text-text text-xs placeholder:text-text-tertiary outline-none focus:border-accent"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-8 px-2 rounded-[6px] border border-border bg-surface text-text text-xs outline-none focus:border-accent"
          >
            <option value="ALL">Severity: All</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="INFO">Info</option>
          </select>

          {/* Verification Status Filter */}
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="h-8 px-2 rounded-[6px] border border-border bg-surface text-text text-xs outline-none focus:border-accent"
          >
            <option value="ALL">Verification: All</option>
            <option value="UNVERIFIED">Unverified</option>
            <option value="REPRODUCED">Reproduced</option>
            <option value="NOT_REPRODUCED">Not Reproduced</option>
            <option value="INCONCLUSIVE">Inconclusive</option>
            <option value="EXECUTION_ERROR">Execution Error</option>
          </select>

          {/* Triage Status Filter */}
          <select
            value={triageFilter}
            onChange={(e) => setTriageFilter(e.target.value)}
            className="h-8 px-2 rounded-[6px] border border-border bg-surface text-text text-xs outline-none focus:border-accent"
          >
            <option value="ALL">Triage: All</option>
            <option value="OPEN">Open</option>
            <option value="IGNORED">Ignored</option>
            <option value="FIXED">Fixed</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="h-8 px-2 rounded-[6px] border border-border bg-surface text-text text-xs outline-none focus:border-accent"
          >
            <option value="ALL">Source: All</option>
            <option value="SCANNER">Scanner</option>
            <option value="IMPORT">Import</option>
          </select>
        </div>

        {/* Count & Keyboard Tip */}
        <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
          <span className="font-mono tabular-nums">
            {filteredFindings.length} {filteredFindings.length === 1 ? "finding" : "findings"}
          </span>
          <span className="hidden md:inline-block border-l border-border pl-3">
            <kbd className="px-1 py-0.5 rounded bg-surface-raised border border-border font-mono text-[10px]">J</kbd> /{" "}
            <kbd className="px-1 py-0.5 rounded bg-surface-raised border border-border font-mono text-[10px]">K</kbd> to move,{" "}
            <kbd className="px-1 py-0.5 rounded bg-surface-raised border border-border font-mono text-[10px]">↵</kbd> to open
          </span>
        </div>
      </div>

      {/* Main Table / Grouped List */}
      {filteredFindings.length === 0 ? (
        <EmptyState
          icon={<Bug className="w-5 h-5 text-text-secondary" />}
          title={search || severityFilter !== "ALL" ? "No matching findings" : "No security findings recorded"}
          description={
            search || severityFilter !== "ALL"
              ? "Try adjusting your filters or search terms."
              : "Once your repositories are scanned, detected AST and dependency vulnerabilities will appear here with automated exploit test status."
          }
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch("");
                setSeverityFilter("ALL");
                setVerificationFilter("ALL");
                setTriageFilter("ALL");
                setSourceFilter("ALL");
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {groupedFindings.map(([groupKey, items]) => (
            <div key={groupKey} className="border border-border rounded-[8px] overflow-hidden bg-surface">
              {/* Group Header */}
              <div className="px-4 py-2.5 bg-surface-raised/60 border-b border-border/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {groupBy === "severity" ? (
                    <SeverityBadge severity={groupKey} size="sm" />
                  ) : (
                    <StatusBadge status={groupKey} size="sm" />
                  )}
                  <span className="font-medium text-text">
                    {groupKey}
                  </span>
                  <span className="text-text-tertiary font-mono text-[11px]">
                    ({items.length})
                  </span>
                </div>
              </div>

              {/* Items List (Linear-style dense table) */}
              <div className="divide-y divide-border/60">
                {items.map((finding) => {
                  const globalIdx = flatVisible.findIndex((f) => f.id === finding.id);
                  const isHighlighted = globalIdx === selectedIndex;
                  const isChecked = selectedIds.has(finding.id);

                  return (
                    <div
                      key={finding.id}
                      onClick={() => setSelectedIndex(globalIdx)}
                      className={`group flex items-center justify-between gap-3 p-3 text-xs transition-colors cursor-pointer ${
                        isHighlighted
                          ? "bg-surface-selected border-l-2 border-l-accent"
                          : "hover:bg-surface-hover"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Checkbox for X selection */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(finding.id)) next.delete(finding.id);
                              else next.add(finding.id);
                              return next;
                            });
                          }}
                          className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition-colors flex-shrink-0 ${
                            isChecked
                              ? "bg-accent border-accent text-white"
                              : "border-border-strong group-hover:border-text-secondary"
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3 h-3" />}
                        </button>

                        {/* Severity Badge */}
                        <div className="flex-shrink-0">
                          <SeverityBadge severity={finding.severity} size="sm" />
                        </div>

                        {/* Title & File:Line */}
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/app/findings/${finding.id}`}
                            className="font-medium text-text hover:text-accent truncate block"
                          >
                            {finding.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-tertiary font-mono">
                            <span className="text-text-secondary">{finding.filePath}:{finding.lineStart || 1}</span>
                            <span>•</span>
                            <span className="truncate max-w-[220px]">{finding.ruleId}</span>
                            {finding.cwe && (
                              <>
                                <span>•</span>
                                <span className="text-accent">{finding.cwe.split(":")[0]}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Columns: Source, Verification Status, Triage, Age */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] bg-surface-raised border border-border text-text-secondary hidden sm:inline-block">
                          {finding.source}
                        </span>

                        <StatusBadge status={finding.verificationState} size="sm" />

                        {finding.triageStatus === "IGNORED" && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] bg-surface-raised border border-border text-text-tertiary">
                            IGNORED
                          </span>
                        )}

                        <span className="text-[11px] font-mono text-text-tertiary tabular-nums hidden md:inline-block w-16 text-right">
                          {formatRelativeTime(finding.createdAt)}
                        </span>

                        <Link
                          href={`/app/findings/${finding.id}`}
                          className="p-1 text-text-tertiary group-hover:text-text transition-colors"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

