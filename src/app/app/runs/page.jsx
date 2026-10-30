import React from "react";
import { Terminal, Play, Filter } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Verification Runs",
  description: "Isolated container execution logs and reproducer results",
};

export default function RunsPage() {
  return (
    <div className="space-y-4 font-sans w-full">
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
            <span className="text-[11px] font-medium text-text font-mono">main</span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-text-tertiary tabular-nums">
          0 runs
        </div>
      </div>

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
    </div>
  );
}
