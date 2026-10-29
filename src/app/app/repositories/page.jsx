import React from "react";
import { FolderGit2, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Repositories",
  description: "Monitored repositories with automated verification harnesses",
};

export default function RepositoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Repositories"
        description="Connected GitHub and Git repositories monitored for automated reproduction tests and patch verification."
        actions={
          <Button variant="primary" size="sm" icon={Plus}>
            Connect Repository
          </Button>
        }
      />

      <EmptyState
        icon={FolderGit2}
        title="No repositories connected"
        description="Connect a repository to automatically discover vulnerabilities, run reproducer jobs, and check incoming pull requests for regressions."
        action={
          <Button variant="secondary" size="sm" icon={Plus}>
            Add First Repository
          </Button>
        }
      />
    </div>
  );
}
