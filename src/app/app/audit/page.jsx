import React from "react";
import { History, Shield, Activity } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { prisma } from "@/lib/db";
import { requireUser } from "@/auth";

export const metadata = {
  title: "History & Audit",
  description: "Append-only security log of all events and verification runs",
};

function formatRelativeTime(date) {
  if (!date) return "Recently";
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function AuditPage() {
  const user = await requireUser();
  const events = await prisma.auditEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 25,
    include: { actor: true, project: true },
  });

  return (
    <div className="space-y-4 font-sans w-full">
      <PageHeader
        title="History & audit"
        description="Append-only cryptographic timeline of all user actions, repository scans, and verification events."
      />

      {events.length === 0 ? (
        <EmptyState
          icon={<History className="w-4 h-4 text-text-secondary" aria-hidden="true" />}
          title="No audit events recorded"
          description="All user registrations, sign-ins, repository scans, and verification verdicts are immutably logged to the database."
          action={
            <Button variant="secondary" size="sm">
              <Shield className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              Audit protocol active
            </Button>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Audit events</CardTitle>
            <span className="text-[11px] font-mono text-text-tertiary tabular-nums">
              {events.length} events logged
            </span>
          </CardHeader>
          <div className="divide-y divide-border">
            {events.map((evt) => (
              <div
                key={evt.id}
                tabIndex={0}
                className="h-10 px-3.5 flex items-center justify-between text-xs hover:bg-surface-hover transition-colors outline-none focus-visible:bg-surface-hover group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Activity className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
                  <span className="font-medium text-text">
                    {evt.action === "PROJECT_CREATED"
                      ? `Project repository ${evt.project?.name || ""} connected`
                      : evt.action === "PROJECT_UPDATED"
                      ? `Repository ${evt.project?.name || ""} settings updated`
                      : evt.action}
                  </span>
                  {evt.actor && (
                    <span className="text-[11px] text-text-tertiary truncate">
                      by {evt.actor.name || evt.actor.email}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 font-mono text-[11px] text-text-tertiary tabular-nums">
                  <span title={new Date(evt.createdAt).toISOString()}>
                    {formatRelativeTime(evt.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
