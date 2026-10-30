import React from "react";
import { Package, Upload, Filter } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Dependencies",
  description: "Software bill of materials and reachability analysis",
};

export default function DependenciesPage() {
  return (
    <div className="space-y-4 font-sans w-full">
      <PageHeader
        title="Dependencies"
        description="Software bill of materials (SBOM) and call-graph reachability distinguishing actual vulnerability vectors from unused code."
        actions={
          <Button variant="secondary" size="sm">
            <Upload className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            Import lockfile
          </Button>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-border text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] border border-border bg-surface text-text-secondary">
            <Filter className="w-3 h-3 text-text-tertiary" />
            <span className="text-[11px]">Ecosystem:</span>
            <span className="text-[11px] font-medium text-text">All manifests</span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-text-tertiary tabular-nums">
          0 packages
        </div>
      </div>

      <EmptyState
        icon={<Package className="w-4 h-4 text-text-secondary" aria-hidden="true" />}
        title="No dependency manifests parsed"
        description="Scan lockfiles (package-lock.json, poetry.lock, requirements.txt) to identify vulnerable transitive dependencies and call-graph reachability."
        action={
          <Button variant="secondary" size="sm">
            Scan project dependencies
          </Button>
        }
      />
    </div>
  );
}
