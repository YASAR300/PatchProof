import React from "react";
import { Bug, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Findings",
  description: "Discovered security flaws with reproduction status",
};

export default function FindingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vulnerability Findings"
        description="Detected code weaknesses and security advisories tracked with deterministic reproduction status."
        actions={
          <Button variant="secondary" size="sm" icon={RefreshCw}>
            Trigger Scan
          </Button>
        }
      />

      <EmptyState
        icon={Bug}
        title="No security findings recorded"
        description="Once your repositories are scanned, detected AST and dependency vulnerabilities will appear here with automated exploit test status."
        action={
          <Button variant="secondary" size="sm">
            Scan Repositories
          </Button>
        }
      />
    </div>
  );
}
