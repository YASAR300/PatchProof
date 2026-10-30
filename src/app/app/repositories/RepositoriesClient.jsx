"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FolderGit2, Plus, GitBranch, GitCommit, Clock, MoreHorizontal, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SearchField } from "@/components/ui/SearchField";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { ConnectRepositoryDialog } from "@/components/app/ConnectRepositoryDialog";

export function RepositoriesClient({ initialProjects = [] }) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingDemo, setIsAddingDemo] = useState(false);

  const handleAddDemo = async () => {
    try {
      setIsAddingDemo(true);
      const res = await fetch("/api/repositories/demo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add demo repo");
      router.push(`/app/repositories/${data.project.id}`);
      router.refresh();
    } catch (err) {
      alert(err.message || "Failed to add demo repository");
    } finally {
      setIsAddingDemo(false);
    }
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return initialProjects;
    const q = searchQuery.toLowerCase();
    return initialProjects.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.repoOwner?.toLowerCase().includes(q) ||
        p.repoName?.toLowerCase().includes(q) ||
        p.language?.toLowerCase().includes(q)
    );
  }, [initialProjects, searchQuery]);

  const handleRowClick = (id) => {
    router.push(`/app/repositories/${id}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Just now";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4 font-sans w-full">
      <PageHeader
        title="Repositories"
        description="Connected GitHub repositories monitored for automated vulnerability analysis and verification harnesses."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddDemo}
              disabled={isAddingDemo}
            >
              {isAddingDemo ? "Adding demo..." : "Add the demo project"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              Connect repository
            </Button>
          </div>
        }
      />

      {/* Connect Repository Dialog */}
      <ConnectRepositoryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={(project) => {
          setIsDialogOpen(false);
          router.push(`/app/repositories/${project.id}`);
          router.refresh();
        }}
      />

      {/* Search and Action Bar */}
      {initialProjects.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-72">
            <SearchField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
              placeholder="Filter repositories..."
              size="sm"
            />
          </div>
          <div className="text-[11px] text-text-tertiary self-end sm:self-center font-mono tabular-nums">
            {filteredProjects.length} of {initialProjects.length} repositories
          </div>
        </div>
      )}

      {initialProjects.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 className="w-4 h-4 text-text-secondary" aria-hidden="true" />}
          title="No repositories connected"
          description="Connect your GitHub repositories to track vulnerabilities, reproduction harnesses, and verified security patches."
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddDemo}
                disabled={isAddingDemo}
              >
                {isAddingDemo ? "Adding demo..." : "Add the demo project"}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                Connect a repository
              </Button>
            </div>
          }
        />
      ) : (
        <div className="border border-border rounded-[8px] bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-raised/40 text-text-tertiary text-[11px] font-normal select-none h-8">
                  <th className="py-2 px-3.5 font-normal">Repository</th>
                  <th className="py-2 px-3 font-normal">Language</th>
                  <th className="py-2 px-3 font-normal">Default branch</th>
                  <th className="py-2 px-3 font-normal">Last scan</th>
                  <th className="py-2 px-3 font-normal">Latest commit</th>
                  <th className="py-2 px-3 text-right font-normal">Updated</th>
                  <th className="py-2 px-3 text-right w-10 font-normal"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProjects.map((project) => {
                  const shortSha = project.latestCommitSha
                    ? project.latestCommitSha.slice(0, 7)
                    : "—";

                  return (
                    <tr
                      key={project.id}
                      tabIndex={0}
                      onClick={() => handleRowClick(project.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleRowClick(project.id);
                        }
                      }}
                      className="h-10 hover:bg-surface-hover cursor-pointer transition-colors outline-none focus-visible:bg-surface-hover group"
                    >
                      {/* Name & Owner */}
                      <td className="py-2 px-3.5">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 text-text-secondary flex-shrink-0">
                            <FolderGit2 className="w-4 h-4" />
                          </span>
                          <span className="font-medium text-text group-hover:text-accent transition-colors truncate">
                            {project.name}
                          </span>
                          <span className="text-[11px] text-text-tertiary truncate">
                            {project.repoOwner}/{project.repoName}
                          </span>
                        </div>
                      </td>

                      {/* Language */}
                      <td className="py-2 px-3">
                        <Badge variant="default">
                          {project.language || "Unknown"}
                        </Badge>
                      </td>

                      {/* Default Branch */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5 text-text-secondary font-mono text-[11px]">
                          <GitBranch className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
                          <span>{project.defaultBranch}</span>
                        </div>
                      </td>

                      {/* Last Scan */}
                      <td className="py-2 px-3">
                        <span className="text-text-secondary text-[11px]">Never scanned</span>
                      </td>

                      {/* Latest Commit Short SHA */}
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1 font-mono text-[11px] text-text-secondary">
                          <GitCommit className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
                          <span>{shortSha}</span>
                        </div>
                      </td>

                      {/* Updated Time */}
                      <td className="py-2 px-3 text-right text-text-tertiary text-[11px] whitespace-nowrap font-mono tabular-nums">
                        {formatDate(project.updatedAt)}
                      </td>

                      {/* Actions Menu */}
                      <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu
                          align="end"
                          trigger={
                            <button
                              type="button"
                              aria-label={`Actions for ${project.name}`}
                              className="p-1 rounded-[4px] text-text-tertiary hover:text-text hover:bg-surface-hover transition-colors outline-none focus-visible:ring-1 focus-visible:ring-accent"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          }
                          items={[
                            {
                              id: "open",
                              label: "View repository",
                              icon: FolderGit2,
                              onClick: () => router.push(`/app/repositories/${project.id}`),
                            },
                            {
                              id: "github",
                              label: "Open on GitHub",
                              icon: ExternalLink,
                              onClick: () => window.open(project.repoUrl, "_blank"),
                            },
                            { divider: true },
                            {
                              id: "settings",
                              label: "Settings",
                              onClick: () => router.push(`/app/repositories/${project.id}?tab=settings`),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
