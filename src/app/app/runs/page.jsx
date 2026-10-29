import React from "react";
import { Terminal, Play } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Verification Runs",
  description: "Isolated container execution logs and reproducer results",
};

export default function RunsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Verification Runs"
        description="Isolated sandbox test executions measuring exploit reproducibility and recording deterministic execution evidence."
        actions={
          <Button variant="primary" size="sm" icon={Play}>
            Run Reproducer
          </Button>
        }
      />

      <EmptyState
        icon={Terminal}
        title="No verification runs executed"
        description="Automated exploit test runs in isolated sandbox environments will record execution traces, durations, and status verdicts here."
        action={
          <Button variant="secondary" size="sm" icon={Play}>
            Execute Test Run
          </Button>
        }
      />
    </div>
  );
}
