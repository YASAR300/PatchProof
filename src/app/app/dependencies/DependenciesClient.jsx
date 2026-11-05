"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Search,
  Filter,
  ArrowRight,
  Layers,
  FileCode,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { isMajorBump } from "@/lib/version-utils";

export function DependenciesClient({
  initialDependencies = [],
  summary = {
    packagesScanned: 0,
    packagesWithAdvisories: 0,
    directCount: 0,
    transitiveCount: 0,
  },
  activeProject = null,
}) {
  const [dependencies] = useState(initialDependencies);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL"); // ALL, DIRECT, TRANSITIVE
  const [advisoryOnly, setAdvisoryOnly] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return dependencies.filter((dep) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = dep.name.toLowerCase().includes(q);
        const matchesAdvisory = dep.advisoryId?.toLowerCase().includes(q);
        const matchesLockfile = dep.lockfile?.toLowerCase().includes(q);
        if (!matchesName && !matchesAdvisory && !matchesLockfile) {
          return false;
        }
      }

      // Severity filter
      if (severityFilter !== "ALL") {
        if (severityFilter === "UNKNOWN") {
          if (dep.severity !== null && dep.severity !== undefined) return false;
        } else if (dep.severity !== severityFilter) {
          return false;
        }
      }

      // Direct / Transitive filter
      if (typeFilter === "DIRECT" && !dep.isDirect) return false;
      if (typeFilter === "TRANSITIVE" && dep.isDirect) return false;

      // Advisory only
      if (advisoryOnly && !dep.advisoryId) return false;

      return true;
    });
  }, [dependencies, searchQuery, severityFilter, typeFilter, advisoryOnly]);

  return (
    <div className="space-y-4 font-sans w-full max-w-[1200px] mx-auto">
      <PageHeader
        title="Dependencies"
        description="Software bill of materials (SBOM) and reachability analysis distinguishing actual vulnerability vectors from unused code."
        actions={
          activeProject ? (
            <Link href={`/app/repositories/${activeProject.id}`}>
              <Button variant="primary" size="sm">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Scan dependencies
              </Button>
            </Link>
          ) : null
        }
      />

      {/* Small Summary Bar Above Table */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-[6px] border border-border bg-surface">
          <div className="text-[11px] font-mono text-text-tertiary">Packages scanned</div>
          <div className="text-lg font-semibold text-text mt-0.5 tabular-nums">
            {summary.packagesScanned}
          </div>
        </div>

        <div className="p-3 rounded-[6px] border border-border bg-surface">
          <div className="text-[11px] font-mono text-text-tertiary">With advisories</div>
          <div className="text-lg font-semibold text-rose-500 mt-0.5 tabular-nums flex items-center gap-1.5">
            {summary.packagesWithAdvisories}
            {summary.packagesWithAdvisories > 0 && (
              <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-rose-500/10 text-rose-400 font-normal">
                Action required
              </span>
            )}
          </div>
        </div>

        <div className="p-3 rounded-[6px] border border-border bg-surface">
          <div className="text-[11px] font-mono text-text-tertiary">Direct dependencies</div>
          <div className="text-lg font-semibold text-text mt-0.5 tabular-nums">
            {summary.directCount}
          </div>
        </div>

        <div className="p-3 rounded-[6px] border border-border bg-surface">
          <div className="text-[11px] font-mono text-text-tertiary">Transitive dependencies</div>
          <div className="text-lg font-semibold text-text mt-0.5 tabular-nums">
            {summary.transitiveCount}
          </div>
        </div>
      </div>

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
              placeholder="Search package, advisory, lockfile..."
              className="w-full h-8 pl-8 pr-2.5 rounded-[5px] border border-border bg-surface text-xs text-text placeholder:text-text-tertiary outline-none focus:border-accent"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-8 px-2.5 rounded-[5px] border border-border bg-surface text-xs text-text outline-none focus:border-accent"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="UNKNOWN">Unknown / None</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 px-2.5 rounded-[5px] border border-border bg-surface text-xs text-text outline-none focus:border-accent"
          >
            <option value="ALL">All Types</option>
            <option value="DIRECT">Direct Only</option>
            <option value="TRANSITIVE">Transitive Only</option>
          </select>

          {/* Vulnerable Only Toggle */}
          <button
            type="button"
            onClick={() => setAdvisoryOnly(!advisoryOnly)}
            className={`h-8 px-2.5 rounded-[5px] border text-xs transition-colors ${
              advisoryOnly
                ? "border-rose-500/40 bg-rose-500/10 text-rose-300 font-medium"
                : "border-border bg-surface text-text-secondary hover:text-text"
            }`}
          >
            {advisoryOnly ? "Showing Advisories Only" : "Show All Packages"}
          </button>
        </div>

        <div className="text-[11px] font-mono text-text-tertiary tabular-nums">
          {filtered.length} row{filtered.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Linear-Style Dependencies Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="w-5 h-5 text-text-secondary" />}
          title={dependencies.length === 0 ? "No dependencies scanned yet" : "No matching dependencies"}
          description={
            dependencies.length === 0
              ? "Trigger a dependency scan on your connected repository to inspect package lockfiles and discover vulnerability advisories."
              : "Try adjusting your search query or severity filters."
          }
          action={
            dependencies.length === 0 && activeProject ? (
              <Link href={`/app/repositories/${activeProject.id}`}>
                <Button variant="secondary" size="sm">
                  Go to repository & scan
                </Button>
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="border border-border rounded-[6px] bg-surface overflow-hidden divide-y divide-border/70">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-3.5 py-2.5 bg-surface-raised/40 text-[11px] font-mono text-text-tertiary select-none">
            <div className="col-span-4 sm:col-span-3 flex items-center gap-2">Package</div>
            <div className="col-span-2 text-left">Installed</div>
            <div className="col-span-2 hidden sm:block">Type</div>
            <div className="col-span-2">Severity</div>
            <div className="col-span-2 sm:col-span-2">Advisory</div>
            <div className="col-span-2 sm:col-span-1 text-right">Fixed</div>
          </div>

          {/* Table Rows */}
          {filtered.map((dep) => {
            const isExpanded = expandedRows.has(dep.id);
            const majorBumpRisk = dep.fixedVersion ? isMajorBump(dep.installedVersion, dep.fixedVersion) : false;
            const pathArr = Array.isArray(dep.dependencyPath) ? dep.dependencyPath : [dep.name];

            return (
              <div key={dep.id} className="transition-colors hover:bg-surface-hover/50">
                {/* Main Row */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleRow(dep.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleRow(dep.id);
                    }
                  }}
                  className="grid grid-cols-12 gap-2 px-3.5 py-2.5 text-xs items-center cursor-pointer outline-none focus-visible:bg-surface-hover"
                >
                  {/* Package & Caret */}
                  <div className="col-span-4 sm:col-span-3 flex items-center gap-2 truncate">
                    <button
                      type="button"
                      aria-label={isExpanded ? "Collapse row" : "Expand row"}
                      className="text-text-tertiary hover:text-text p-0.5 flex-shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className="font-medium text-text truncate" title={dep.name}>
                      {dep.name}
                    </span>
                    <span className="text-[10px] font-mono text-text-tertiary uppercase flex-shrink-0">
                      {dep.ecosystem}
                    </span>
                  </div>

                  {/* Installed Version */}
                  <div className="col-span-2 font-mono text-text-secondary truncate">
                    {dep.installedVersion}
                  </div>

                  {/* Direct / Transitive */}
                  <div className="col-span-2 hidden sm:block">
                    {dep.isDirect ? (
                      <span className="inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded border border-accent/30 bg-accent/10 text-accent font-medium">
                        direct
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-surface-raised text-text-tertiary">
                        transitive
                      </span>
                    )}
                  </div>

                  {/* Severity */}
                  <div className="col-span-2">
                    {dep.severity ? (
                      <SeverityBadge severity={dep.severity} />
                    ) : dep.advisoryId ? (
                      <span className="inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded border border-border text-text-tertiary">
                        UNKNOWN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                        <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                        Clean
                      </span>
                    )}
                  </div>

                  {/* Advisory ID */}
                  <div className="col-span-2 sm:col-span-2 truncate">
                    {dep.advisoryId ? (
                      <a
                        href={dep.advisoryUrl || `https://osv.dev/vulnerability/${dep.advisoryId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-accent hover:underline truncate max-w-full"
                        title="View advisory on OSV.dev"
                      >
                        <span className="truncate">{dep.advisoryId}</span>
                        <ExternalLink className="w-2.5 h-2.5 flex-shrink-0 opacity-70" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-text-tertiary font-mono">—</span>
                    )}
                  </div>

                  {/* Fixed Version */}
                  <div className="col-span-2 sm:col-span-1 text-right font-mono truncate">
                    {dep.fixedVersion ? (
                      <span
                        className={`text-xs font-medium ${
                          majorBumpRisk ? "text-amber-400" : "text-emerald-400"
                        }`}
                        title={majorBumpRisk ? "Major version bump required" : "Fixed version available"}
                      >
                        {dep.fixedVersion}
                      </span>
                    ) : (
                      <span className="text-[11px] text-text-tertiary">—</span>
                    )}
                  </div>
                </div>

                {/* Expanded Details Row */}
                {isExpanded && (
                  <div className="px-5 py-4 bg-[#0a0a0c]/80 border-t border-border/60 space-y-3.5 text-xs">
                    {/* 1. Dependency Path Breadcrumbs */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-mono text-text-tertiary flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-text-tertiary" />
                        <span>Dependency path</span>
                      </div>
                      <div className="flex items-center flex-wrap gap-1 font-mono text-xs bg-surface-raised/40 p-2 rounded-[5px] border border-border/60">
                        {pathArr.map((seg, idx) => (
                          <React.Fragment key={idx}>
                            {idx > 0 && <span className="text-text-tertiary">›</span>}
                            <span
                              className={
                                idx === pathArr.length - 1
                                  ? "text-text font-semibold px-1 py-0.5 rounded bg-surface border border-border/80"
                                  : "text-text-secondary"
                              }
                            >
                              {seg}
                            </span>
                          </React.Fragment>
                        ))}
                        {dep.lockfile && (
                          <span className="ml-auto text-[11px] text-text-tertiary font-normal flex items-center gap-1">
                            <FileCode className="w-3 h-3" />
                            {dep.lockfile}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 2. Advisory Summary */}
                    {dep.advisorySummary && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-mono text-text-tertiary">Advisory summary</div>
                        <p className="text-text leading-relaxed bg-surface-raised/20 p-2.5 rounded-[5px] border border-border/40">
                          {dep.advisorySummary}
                        </p>
                      </div>
                    )}

                    {/* 3. Upgrade-Risk Note if Major Bump */}
                    {majorBumpRisk && (
                      <div className="p-2.5 rounded-[5px] border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-medium text-amber-300">Major version change:</strong> compatibility risk, review the changelog.
                          <div className="text-[11px] text-amber-300/80 mt-0.5">
                            Upgrading from <code className="font-mono">{dep.installedVersion}</code> to <code className="font-mono">{dep.fixedVersion}</code> involves a major breaking change boundary.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. Suggested Next Step */}
                    <div className="p-2.5 rounded-[5px] border border-accent/20 bg-accent/5 text-xs text-text-secondary flex items-start gap-2">
                      <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-text font-medium">Suggested next step:</strong> Review the advisory&apos;s affected range and fixed versions, update to an appropriate version, and run regression tests.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

