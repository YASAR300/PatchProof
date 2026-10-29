import React from "react";
import Link from "next/link";
import { LayoutDashboard, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Overview",
  description: "PatchProof verification posture overview",
};

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Overview"
        description="Consolidated metrics, active verification jobs, and vulnerability resolution posture across your projects."
        actions={
          <Link href="/app/repositories">
            <Button variant="primary" size="sm" icon={Plus}>
              Connect Repository
            </Button>
          </Link>
        }
      />

      <EmptyState
        icon={LayoutDashboard}
        title="No verification activity yet"
        description="Connect your first Git repository to begin scanning for vulnerabilities, synthesizing deterministic exploit tests, and monitoring pull requests."
        action={
          <Link href="/app/repositories">
            <Button variant="secondary" size="sm" icon={Plus}>
              Add Repository
            </Button>
          </Link>
        }
      />
    </div>
  );
}
