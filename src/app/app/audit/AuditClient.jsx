"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  History,
  Shield,
  Activity,
  Search,
  Filter,
  Download,
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User as UserIcon,
  Layers,
  FileCode,
  Tag,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

const ROWS_PER_PAGE = 50;

function formatTimestamp(date) {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

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

function getActionColor(action) {
  if (action.includes("FAILED") || action.includes("DELETED") || action.includes("REJECTED")) {
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  }
  if (action.includes("ALERT") || action.includes("REGRESSION") || action.includes("CHANGES_REQUESTED")) {
    return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  }
  if (action.includes("COMPLETED") || action.includes("CREATED") || action.includes("VERIFIED") || action.includes("APPROVED")) {
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  }
  return "text-accent bg-accent/10 border-accent/20";
}

function getEventSummary(evt) {
  const m = evt.metadata || {};
  if (evt.action === "PROJECT_CREATED") return `Repository connected: ${evt.project?.name || m.name || evt.entityId}`;
  if (evt.action === "PROJECT_UPDATED") return `Repository settings updated`;
  if (evt.action === "PROJECT_DELETED") return `Repository deleted: ${m.name || evt.entityId}`;
  if (evt.action === "MEMBER_ADDED") return `Added ${m.memberEmail || "member"} as ${m.role || "MEMBER"}`;
  if (evt.action === "MEMBER_ROLE_UPDATED") return `Updated ${m.memberEmail || "member"} role to ${m.newRole || "role"}`;
  if (evt.action === "MEMBER_REMOVED") return `Removed member ${m.memberEmail || evt.entityId}`;
  if (evt.action === "FINDINGS_IMPORTED") return `Imported ${m.importedCount ?? "external"} findings from ${m.scannerName || "scanner"}`;
  if (evt.action === "FINDING_TRIAGE_UPDATED") return `Finding status updated to ${m.triageStatus || "new status"}`;
  if (evt.action === "VERIFICATION_STARTED") return `Sandbox verification run started for finding #${String(m.findingId || evt.entityId).slice(-6)}`;
  if (evt.action === "VERIFICATION_COMPLETED") return `Verification finished: verdict is ${m.verdict || m.status || "COMPLETE"}`;
  if (evt.action === "PATCH_VALIDATION_STARTED") return `Patch validation started (${String(m.baselineCommit || "").slice(0, 7)} → ${String(m.candidateCommit || "").slice(0, 7)})`;
  if (evt.action === "PATCH_VALIDATION_COMPLETED") return `Patch validation finished: verdict is ${m.verdict || "COMPLETE"}`;
  if (evt.action === "REVIEWER_DECISION") return `Reviewer decision: ${m.decision || "DECIDED"} by ${m.reviewerEmail || "reviewer"}`;
  if (evt.action === "PR_CHECK_STARTED") return `GitHub PR #${m.prNumber || ""} check started on ${String(m.headSha || "").slice(0, 7)}`;
  if (evt.action === "PR_CHECK_COMPLETED") return `GitHub PR #${m.prNumber || ""} check finished: ${m.verdict || "OK"}`;
  if (evt.action === "REGRESSION_ALERT_RAISED") return `REGRESSION ALERT raised on commit ${String(m.headSha || "").slice(0, 7)}`;
  if (evt.action === "DEPENDENCY_SCAN_STARTED") return `Dependency lockfile analysis initiated`;
  if (evt.action === "DEPENDENCY_SCAN_COMPLETED") return `Dependency scan completed: ${m.dependencyCount || 0} packages analyzed`;
  if (evt.action === "WEBHOOK_SECRET_ROTATED") return `GitHub webhook secret rotated`;
  if (evt.action === "GITHUB_WEBHOOK_RECEIVED") return `Received GitHub webhook delivery #${m.deliveryId || ""}`;
  if (evt.action === "REPOSITORY_EXECUTION_TOGGLED") return `Execution safety toggled to ${m.executionEnabled ? "ENABLED" : "DISABLED"}`;
  if (evt.action === "REPORT_INTEGRITY_VERIFIED") return `Report integrity verified: ${m.valid ? "PASS" : "FAIL"} (${m.verifiedCount}/${m.totalCount} artifacts valid)`;
  if (evt.action === "USER_SIGNED_UP") return `New user account created: ${m.email || ""}`;
  if (evt.action === "USER_LOGGED_IN") return `User authentication session established`;
  if (evt.action === "USER_PROFILE_UPDATED") return `User profile settings updated`;
  if (evt.action === "USER_PASSWORD_CHANGED") return `Account password updated`;
  if (evt.action === "AI_EXPLANATION_CREATED") return `AI explanation synthesized for ${evt.entityType}`;

  return JSON.stringify(m) === "{}" ? evt.action : JSON.stringify(m).slice(0, 80);
}

export function AuditClient({ initialEvents = [], activeProject = null }) {
  const [events] = useState(initialEvents);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [actorFilter, setActorFilter] = useState("ALL");
  const [entityTypeFilter, setEntityTypeFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDrawerEvent, setSelectedDrawerEvent] = useState(null);
  const [copiedMetadata, setCopiedMetadata] = useState(false);

  // Extract unique actions, actors, and entity types for dropdown filters
  const uniqueActions = useMemo(() => {
    const set = new Set();
    for (const e of events) if (e.action) set.add(e.action);
    return Array.from(set).sort();
  }, [events]);

  const uniqueActors = useMemo(() => {
    const map = new Map();
    for (const e of events) {
      if (e.actor) {
        map.set(e.actor.id, e.actor.name || e.actor.email);
      }
    }
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [events]);

  const uniqueEntityTypes = useMemo(() => {
    const set = new Set();
    for (const e of events) if (e.entityType) set.add(e.entityType);
    return Array.from(set).sort();
  }, [events]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // 1. Action filter
      if (actionFilter !== "ALL" && evt.action !== actionFilter) return false;

      // 2. Actor filter
      if (actorFilter !== "ALL" && evt.actorId !== actorFilter) return false;

      // 3. Entity type filter
      if (entityTypeFilter !== "ALL" && evt.entityType !== entityTypeFilter) return false;

      // 4. Date range filter
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (new Date(evt.createdAt) < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(evt.createdAt) > end) return false;
      }

      // 5. Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesAction = (evt.action || "").toLowerCase().includes(q);
        const matchesEntity = (evt.entityType || "").toLowerCase().includes(q) || (evt.entityId || "").toLowerCase().includes(q);
        const matchesActor = (evt.actor?.name || "").toLowerCase().includes(q) || (evt.actor?.email || "").toLowerCase().includes(q);
        const matchesMetadata = JSON.stringify(evt.metadata || {}).toLowerCase().includes(q);
        if (!matchesAction && !matchesEntity && !matchesActor && !matchesMetadata) return false;
      }

      return true;
    });
  }, [events, actionFilter, actorFilter, entityTypeFilter, startDate, endDate, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / ROWS_PER_PAGE));
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredEvents.slice(start, start + ROWS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setActionFilter("ALL");
    setActorFilter("ALL");
    setEntityTypeFilter("ALL");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // CSV Export
  const handleExportCsv = () => {
    if (filteredEvents.length === 0) return;

    const headers = ["Timestamp (ISO)", "Actor Email", "Actor Name", "Action", "Entity Type", "Entity ID", "Summary", "Metadata JSON"];
    const rows = filteredEvents.map((e) => {
      const summary = getEventSummary(e);
      const metadataStr = JSON.stringify(e.metadata || {});
      return [
        new Date(e.createdAt).toISOString(),
        e.actor?.email || "system",
        e.actor?.name || "System",
        e.action,
        e.entityType,
        e.entityId,
        summary.replace(/"/g, '""'),
        metadataStr.replace(/"/g, '""'),
      ].map((cell) => `"${cell}"`).join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `patchproof-audit-${activeProject?.slug || "events"}-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyDrawerJson = () => {
    if (!selectedDrawerEvent) return;
    navigator.clipboard.writeText(JSON.stringify(selectedDrawerEvent.metadata, null, 2));
    setCopiedMetadata(true);
    setTimeout(() => setCopiedMetadata(false), 2000);
  };

  return (
    <div className="space-y-4 font-sans w-full max-w-[1200px] mx-auto pb-16">
      {/* Top Header */}
      <PageHeader
        title="History & Audit Log"
        description="Append-only cryptographic timeline of all user actions, security scans, verification runs, reviewer decisions, and worker events."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredEvents.length === 0}
            className="gap-1.5 cursor-pointer"
            data-testid="export-audit-csv-btn"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        }
      />

      {/* Filter Toolbar Card */}
      <Card className="p-3 bg-surface border-border space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 items-center">
          {/* 1. Text Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 text-text-tertiary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search action, actor, entity, metadata..."
              className="w-full h-8 pl-8 pr-2.5 rounded-[5px] border border-border bg-[#080809] text-xs text-text placeholder:text-text-tertiary outline-none focus:border-accent"
              data-testid="audit-search-input"
            />
          </div>

          {/* 2. Action Filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-8 px-2 rounded-[5px] border border-border bg-[#080809] text-xs text-text outline-none focus:border-accent cursor-pointer"
              data-testid="audit-action-filter"
            >
              <option value="ALL">All Actions</option>
              {uniqueActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Entity Type Filter */}
          <div>
            <select
              value={entityTypeFilter}
              onChange={(e) => {
                setEntityTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-8 px-2 rounded-[5px] border border-border bg-[#080809] text-xs text-text outline-none focus:border-accent cursor-pointer"
              data-testid="audit-entity-filter"
            >
              <option value="ALL">All Entity Types</option>
              {uniqueEntityTypes.map((ent) => (
                <option key={ent} value={ent}>
                  {ent}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Actor Filter */}
          <div>
            <select
              value={actorFilter}
              onChange={(e) => {
                setActorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-8 px-2 rounded-[5px] border border-border bg-[#080809] text-xs text-text outline-none focus:border-accent cursor-pointer"
              data-testid="audit-actor-filter"
            >
              <option value="ALL">All Actors</option>
              {uniqueActors.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.label}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Date Range Controls */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-8 px-1.5 rounded-[5px] border border-border bg-[#080809] text-[11px] font-mono text-text outline-none focus:border-accent cursor-pointer"
              data-testid="audit-start-date"
              title="Start date"
            />
            <span className="text-text-tertiary font-mono text-[10px]">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-8 px-1.5 rounded-[5px] border border-border bg-[#080809] text-[11px] font-mono text-text outline-none focus:border-accent cursor-pointer"
              data-testid="audit-end-date"
              title="End date"
            />
          </div>
        </div>

        {/* Counter & Reset Filter */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-text-tertiary font-mono">
          <div>
            Showing {filteredEvents.length} of {events.length} audit events logged
            {activeProject ? ` for ${activeProject.name}` : ""}
          </div>
          {(searchQuery || actionFilter !== "ALL" || actorFilter !== "ALL" || entityTypeFilter !== "ALL" || startDate || endDate) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-accent hover:underline cursor-pointer"
              data-testid="audit-reset-filters-btn"
            >
              Reset filters
            </button>
          )}
        </div>
      </Card>

      {/* Main Events Table */}
      {paginatedEvents.length === 0 ? (
        <EmptyState
          icon={<History className="w-4 h-4 text-text-secondary" />}
          title="No audit events match current criteria"
          description="Try broadening your filter criteria, resetting date ranges, or clearing search keywords."
          action={
            <Button variant="secondary" size="sm" onClick={handleResetFilters}>
              Reset all filters
            </Button>
          }
        />
      ) : (
        <Card className="border-border overflow-hidden divide-y divide-border">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 p-3 px-4 bg-surface-raised/40 text-[11px] font-semibold text-text-secondary uppercase tracking-wider select-none">
            <div className="col-span-2 sm:col-span-2">Time</div>
            <div className="col-span-3 sm:col-span-3">Action</div>
            <div className="hidden sm:block sm:col-span-2">Actor</div>
            <div className="hidden sm:block sm:col-span-2">Entity</div>
            <div className="col-span-7 sm:col-span-3">Summary</div>
          </div>

          {/* Table Rows */}
          {paginatedEvents.map((evt) => {
            const isSelected = selectedDrawerEvent?.id === evt.id;
            const actionStyle = getActionColor(evt.action);

            return (
              <div
                key={evt.id}
                data-testid={`audit-row-${evt.id}`}
                onClick={() => setSelectedDrawerEvent(evt)}
                className={`grid grid-cols-12 gap-2 p-3 px-4 items-center text-xs cursor-pointer transition-colors ${
                  isSelected ? "bg-purple-500/10" : "hover:bg-surface-hover/80"
                }`}
              >
                {/* 1. Time */}
                <div className="col-span-2 sm:col-span-2 font-mono text-[11px] text-text-tertiary">
                  <div className="text-text font-medium">{formatRelativeTime(evt.createdAt)}</div>
                  <div className="text-[10px] hidden sm:block truncate" title={new Date(evt.createdAt).toISOString()}>
                    {new Date(evt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                {/* 2. Action Badge */}
                <div className="col-span-3 sm:col-span-3 min-w-0 pr-1">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border truncate max-w-full ${actionStyle}`}
                    title={evt.action}
                  >
                    {evt.action}
                  </span>
                </div>

                {/* 3. Actor */}
                <div className="hidden sm:flex sm:col-span-2 items-center gap-1.5 text-text-secondary truncate">
                  <UserIcon className="w-3 h-3 text-text-tertiary shrink-0" />
                  <span className="truncate" title={evt.actor?.email || "System"}>
                    {evt.actor?.name || evt.actor?.email || "System"}
                  </span>
                </div>

                {/* 4. Entity */}
                <div className="hidden sm:block sm:col-span-2 font-mono text-[11px] text-text-secondary truncate">
                  <span className="text-text font-medium">{evt.entityType}</span>
                  <span className="text-text-tertiary ml-1 text-[10px]">#{String(evt.entityId).slice(-6)}</span>
                </div>

                {/* 5. Summary */}
                <div className="col-span-7 sm:col-span-3 text-text-secondary text-[11px] truncate flex items-center justify-between gap-1">
                  <span className="truncate">{getEventSummary(evt)}</span>
                  <span className="text-[10px] font-mono text-accent hover:underline shrink-0">
                    inspect →
                  </span>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* Pagination Controls (50 rows per page) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1 text-xs font-mono text-text-tertiary">
          <div>
            Page <span className="text-text font-semibold">{currentPage}</span> of{" "}
            <span className="text-text font-semibold">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="gap-1 px-2.5 h-7 text-xs"
              data-testid="audit-prev-page-btn"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="gap-1 px-2.5 h-7 text-xs"
              data-testid="audit-next-page-btn"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Slide-over Side Drawer for Full JSON Metadata */}
      {selectedDrawerEvent && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedDrawerEvent(null)}
          />

          {/* Drawer Content */}
          <div
            data-testid="audit-drawer-panel"
            className="relative w-full max-w-lg bg-surface border-l border-border h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-border bg-surface-raised/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold text-text">Audit Event Record</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDrawerEvent(null)}
                className="p-1 rounded text-text-tertiary hover:text-text hover:bg-surface transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
              {/* Event Attributes */}
              <div className="p-3 rounded-[6px] border border-border bg-[#080809] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary text-[11px] font-mono">Action</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${getActionColor(selectedDrawerEvent.action)}`}>
                    {selectedDrawerEvent.action}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-1.5">
                  <span className="text-text-tertiary text-[11px] font-mono">Timestamp (ISO)</span>
                  <span className="text-text font-mono text-[11px]">
                    {new Date(selectedDrawerEvent.createdAt).toISOString()}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-1.5">
                  <span className="text-text-tertiary text-[11px] font-mono">Actor</span>
                  <span className="text-text">
                    {selectedDrawerEvent.actor?.name || selectedDrawerEvent.actor?.email || "System"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-1.5">
                  <span className="text-text-tertiary text-[11px] font-mono">Entity Reference</span>
                  <span className="text-accent font-mono text-[11px]">
                    {selectedDrawerEvent.entityType} #{String(selectedDrawerEvent.entityId).slice(-8)}
                  </span>
                </div>
              </div>

              {/* Formatted Summary */}
              <div>
                <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider block font-mono mb-1">
                  Event Summary
                </span>
                <p className="p-2.5 rounded bg-surface border border-border text-text leading-relaxed">
                  {getEventSummary(selectedDrawerEvent)}
                </p>
              </div>

              {/* Full JSON Metadata */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider font-mono">
                    Structured Metadata JSON
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyDrawerJson}
                    className="h-6 text-[10px] gap-1 px-2"
                  >
                    {copiedMetadata ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </Button>
                </div>
                <pre className="p-3 rounded-[6px] border border-border bg-[#080809] text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-72 whitespace-pre leading-relaxed">
                  {JSON.stringify(selectedDrawerEvent.metadata, null, 2) || "{}"}
                </pre>
              </div>

              <div className="p-2.5 rounded border border-border/80 bg-surface-raised/20 text-[11px] text-text-tertiary flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Immutably logged in append-only storage. Editing or deleting audit records is strictly prohibited.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

