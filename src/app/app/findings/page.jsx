import React from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Bug, RefreshCw, Filter, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Findings",
  description: "Discovered security flaws with reproduction status",
};

export default function FindingsPage() {
  return (
    <div className="space-y-4 font-sans w-full">
      <PageHeader
        title="Findings"
        description="Detected code weaknesses and security advisories tracked with deterministic reproduction status."
        actions={
          <Button variant="secondary" size="sm">
            <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            Trigger scan
          </Button>
        }
      />

      {/* Compact filter bar with chip-style applied filters */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-border text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] border border-border bg-surface text-text-secondary">
            <Filter className="w-3 h-3 text-text-tertiary" />
            <span className="text-[11px]">Status:</span>
            <span className="text-[11px] font-medium text-text">All active</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] border border-border bg-surface text-text-secondary">
            <span className="text-[11px]">Severity:</span>
            <span className="text-[11px] font-medium text-text">Any</span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-text-tertiary tabular-nums">
          0 findings
        </div>
      </div>

      <EmptyState
        icon={<Bug className="w-4 h-4 text-text-secondary" aria-hidden="true" />}
        title="No security findings recorded"
        description="Once your repositories are scanned, detected AST and dependency vulnerabilities will appear here with automated exploit test status."
        action={
          <Button variant="secondary" size="sm">
            Scan repository
          </Button>
        }
      />
    </div>
  );
}
