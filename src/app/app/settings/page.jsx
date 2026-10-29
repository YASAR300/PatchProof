import React from "react";
import { Settings, Save } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Settings",
  description: "Workspace configuration and execution boundaries",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace Settings"
        description="Configure organization preferences, webhook integrations, and sandbox execution resource quotas."
        actions={
          <Button variant="primary" size="sm" icon={Save}>
            Save Changes
          </Button>
        }
      />

      <EmptyState
        icon={Settings}
        title="Workspace configuration"
        description="Manage API access tokens, pull request status check requirements, and runner execution timeouts."
        action={
          <Button variant="secondary" size="sm">
            Configure Notifications
          </Button>
        }
      />
    </div>
  );
}
