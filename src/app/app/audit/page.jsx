import React from "react";
import { History, Shield } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "History & Audit",
  description: "Append-only security log of all events and verification runs",
};

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="History & Audit Logs"
        description="Append-only cryptographic timeline of all user actions, repository scans, and verification events."
      />

      <EmptyState
        icon={History}
        title="Audit log active"
        description="All user registrations, sign-ins, repository scans, and verification verdicts are immutably logged to the database for compliance and traceability."
        action={
          <Button variant="secondary" size="sm" icon={Shield}>
            View Audit Log Protocol
          </Button>
        }
      />
    </div>
  );
}
