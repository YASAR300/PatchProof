import React from "react";
import { FileCheck2, Plus, Filter } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Patch Reports",
  description: "Pull request verification verdicts and before/after matrices",
};

export default function ReportsPage() {
  return (
    <div className="space-y-4 font-sans w-full">
      <PageHeader
        title="Patch reports"
        description="Candidate fix verifications, side-effect regression checks, and tamper-evident PR artifacts."
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-border text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] border border-border bg-surface text-text-secondary">
            <Filter className="w-3 h-3 text-text-tertiary" />
            <span className="text-[11px]">Verdict:</span>
            <span className="text-[11px] font-medium text-text">All verdicts</span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-text-tertiary tabular-nums">
          0 reports
        </div>
      </div>

      <EmptyState
        icon={<FileCheck2 className="w-4 h-4 text-text-secondary" aria-hidden="true" />}
        title="No patch reports generated"
        description="When a proposed fix or pull request is submitted, PatchProof validates that the exploit is neutralized without breaking any normal behavior."
        action={
          <Button variant="secondary" size="sm">
            <Plus className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            Verify proposed patch
          </Button>
        }
      />
    </div>
  );
}
