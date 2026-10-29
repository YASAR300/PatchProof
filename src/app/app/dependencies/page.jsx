import React from "react";
import { Package, Upload } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Dependencies",
  description: "Software bill of materials and reachability analysis",
};

export default function DependenciesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dependencies & Reachability"
        description="Software bill of materials (SBOM) and call-graph reachability distinguishing actual vulnerability vectors from unused code."
        actions={
          <Button variant="secondary" size="sm" icon={Upload}>
            Import Lockfile
          </Button>
        }
      />

      <EmptyState
        icon={Package}
        title="No dependency manifests parsed"
        description="Scan lockfiles (package-lock.json, poetry.lock, requirements.txt) to identify vulnerable transitive dependencies and call-graph reachability."
        action={
          <Button variant="secondary" size="sm">
            Scan Project Dependencies
          </Button>
        }
      />
    </div>
  );
}
