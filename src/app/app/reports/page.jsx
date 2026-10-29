import React from "react";
import { FileCheck2, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Patch Reports",
  description: "Pull request verification verdicts and before/after matrices",
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Patch Reports"
        description="Candidate fix verifications, side-effect regression checks, and tamper-evident PR artifacts."
      />

      <EmptyState
        icon={FileCheck2}
        title="No patch reports generated"
        description="When a proposed fix or pull request is submitted, PatchProof validates that the exploit is neutralized without breaking any normal behavior."
        action={
          <Button variant="secondary" size="sm">
            Verify Proposed Patch
          </Button>
        }
      />
    </div>
  );
}
