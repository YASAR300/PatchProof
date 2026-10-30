"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderGit2,
  GitBranch,
  GitCommit,
  ExternalLink,
  ShieldAlert,
  FileCode,
  Calendar,
  Clock,
  Trash2,
  Check,
  AlertTriangle,
  ChevronLeft,
  User,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export function RepositoryDetailClient({ project, initialCommits = [], memberRole }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Edit states
  const [name, setName] = useState(project.name);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState("");

  const [branch, setBranch] = useState(project.defaultBranch);
  const [isSavingBranch, setIsSavingBranch] = useState(false);
  const [branchSuccess, setBranchSuccess] = useState(false);
  const [branchError, setBranchError] = useState("");

  // Delete state
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const isViewer = memberRole === "VIEWER";
  const manifests = Array.isArray(project.detectedManifests) ? project.detectedManifests : [];

  const handleRename = async (e) => {
    e.preventDefault();
    if (isViewer) return;
    setNameError("");
    setNameSuccess(false);

    if (!name.trim()) {
      setNameError("Repository display name cannot be empty.");
      return;
    }

    setIsSavingName(true);
    try {
      const res = await fetch(`/api/repositories/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to rename repository.");
      setNameSuccess(true);
      router.refresh();
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err) {
      setNameError(err.message);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleBranchChange = async (e) => {
    e.preventDefault();
    if (isViewer) return;
    setBranchError("");
    setBranchSuccess(false);

    if (!branch.trim()) {
      setBranchError("Default branch cannot be empty.");
      return;
    }

    setIsSavingBranch(true);
    try {
      const res = await fetch(`/api/repositories/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultBranch: branch.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update default branch.");
      setBranchSuccess(true);
      router.refresh();
      setTimeout(() => setBranchSuccess(false), 3000);
    } catch (err) {
      setBranchError(err.message);
    } finally {
      setIsSavingBranch(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (isViewer) return;
    setDeleteError("");

    if (deleteConfirmation !== project.name && deleteConfirmation !== project.repoName) {
      setDeleteError("Confirmation name does not match repository name.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/repositories/${project.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationName: deleteConfirmation.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete repository.");

      router.push("/app/repositories");
      router.refresh();
    } catch (err) {
      setDeleteError(err.message);
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4 max-w-5xl font-sans">
      {/* Back button */}
      <div>
        <Link
          href="/app/repositories"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to repositories</span>
        </Link>
      </div>

      {/* Header with repo name, link to GitHub, branch and language */}
      <div className="border border-border rounded-[8px] bg-surface p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="w-5 h-5 rounded-[4px] bg-surface-raised border border-border text-[11px] font-mono text-text flex items-center justify-center font-medium">
                {project.name.slice(0, 1).toUpperCase()}
              </span>
              <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-text">{project.name}</h1>
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-text-secondary hover:text-text font-medium px-1.5 py-0.5 rounded-[4px] border border-border bg-surface-raised transition-colors"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="text-xs text-text-secondary flex items-center gap-2 flex-wrap">
              <span>{project.repoOwner}/{project.repoName}</span>
              <span className="text-text-tertiary">•</span>
              <span>Role: <strong className="text-text font-medium">{memberRole}</strong></span>
            </div>
          </div>

          {/* Badges for branch and language */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] border border-border bg-surface-raised text-xs font-mono text-text">
              <GitBranch className="w-3 h-3 text-text-tertiary" />
              <span>{project.defaultBranch}</span>
            </div>
            <Badge variant="default">
              {project.language || "Unknown"}
            </Badge>
          </div>
        </div>

        {/* Execution Mode Notice */}
        <div className="h-8 px-2.5 rounded-[6px] border border-border bg-surface-raised/40 text-text-secondary text-xs flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-text-tertiary" />
          {project.executionEnabled ? (
            <span>Safe to merge for tested cases. Containers alone are not treated as a complete security boundary.</span>
          ) : (
            <span>Static analysis only. Test execution is disabled for this repository.</span>
          )}
        </div>
      </div>

      {/* Tabs: Overview, Commits, Settings */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="commits">Commits ({initialCommits.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Metadata Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Repository Metadata</CardTitle>
                <CardDescription className="text-xs">
                  Target configuration and branch tracking information.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="text-[11px] text-text-tertiary font-normal">Repository URL</div>
                  <div className="font-mono text-text truncate">
                    {project.repoUrl?.startsWith("local:") ? (
                      <span>{project.repoUrl}</span>
                    ) : (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-text"
                      >
                        {project.repoUrl}
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[11px] text-text-tertiary font-normal">Owner / Repo</div>
                  <div className="font-mono text-text">{project.repoOwner} / {project.repoName}</div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[11px] text-text-tertiary font-normal">Default Branch</div>
                  <div className="font-mono text-text flex items-center gap-1">
                    <GitBranch className="w-3.5 h-3.5 text-text-tertiary" />
                    <span>{project.defaultBranch}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[11px] text-text-tertiary font-normal">Primary Language</div>
                  <div className="text-text font-medium">{project.language || "Not specified"}</div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[11px] text-text-tertiary font-normal">Latest Commit SHA</div>
                  <div className="font-mono text-text flex items-center gap-1">
                    <GitCommit className="w-3.5 h-3.5 text-text-tertiary" />
                    <span>{project.latestCommitSha ? project.latestCommitSha.slice(0, 7) : "—"}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[11px] text-text-tertiary font-normal">Connected On</div>
                  <div className="text-text flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-text-tertiary" />
                    <span>{formatDate(project.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detected Manifests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-accent" />
                  <span>Detected Package Manifests</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Manifests detected at repository root or one level down using the Git Trees API.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {manifests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {manifests.map((manifestPath) => (
                      <div
                        key={manifestPath}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-surface-raised/40 font-mono text-xs text-text"
                      >
                        <FileCode className="w-3.5 h-3.5 text-accent" />
                        <span>{manifestPath}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-text-muted italic">
                    No matching package manifests (requirements.txt, package-lock.json, pnpm-lock.yaml, package.json, pyproject.toml) were found at the root or one level down.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scan History Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Scan History</CardTitle>
                <CardDescription className="text-xs">
                  Vulnerability scans and automated harness runs recorded for this repository.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center border border-dashed border-border/80 rounded-lg space-y-2">
                  <Clock className="w-6 h-6 mx-auto text-text-muted" />
                  <div className="text-xs font-semibold text-text">Never scanned</div>
                  <div className="text-2xs text-text-muted max-w-sm mx-auto">
                    No scans have been initiated for this repository yet. Scanner integration will discover and triage findings in upcoming steps.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Commits Tab */}
        <TabsContent value="commits">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Latest Commits</CardTitle>
              <CardDescription className="text-xs">
                Recent 15 commits on branch <code className="font-mono text-accent">{project.defaultBranch}</code> retrieved via GitHub REST API (cached 60s).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {initialCommits.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-muted">
                  No commit history available for this branch.
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {initialCommits.map((commit) => (
                    <div
                      key={commit.sha}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-surface-raised/30 px-2 rounded-md transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <a
                            href={commit.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-2xs text-accent hover:underline font-semibold flex items-center gap-1"
                          >
                            <GitCommit className="w-3.5 h-3.5" />
                            <span>{commit.shortSha}</span>
                          </a>
                          <span className="font-medium text-text truncate">{commit.message}</span>
                        </div>
                        <div className="flex items-center gap-2 text-2xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{commit.author}</span>
                          </span>
                          <span>•</span>
                          <span>{formatDate(commit.date)}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {project.isDemo || project.repoUrl?.startsWith("local:") ? (
                          <span className="text-2xs text-text-muted px-2 py-1 rounded border border-border bg-surface-raised/40 font-mono">
                            Deterministic Git Tag
                          </span>
                        ) : (
                          <a
                            href={commit.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-2xs text-text-muted hover:text-text flex items-center gap-1 px-2 py-1 rounded border border-border bg-surface-raised/40"
                          >
                            <span>View on GitHub</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="space-y-6">
            {isViewer && (
              <div className="p-3 rounded-lg border border-border bg-surface text-text-muted text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-accent" />
                <span>You are a VIEWER on this project. Editing and deletion are restricted to OWNER and MEMBER roles.</span>
              </div>
            )}

            {/* Rename Project */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Rename Repository</CardTitle>
                <CardDescription className="text-xs">
                  Change the internal display name for this repository in PatchProof.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRename} className="space-y-4">
                  <div className="max-w-md">
                    <Input
                      label="Repository Display Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isViewer || isSavingName}
                      required
                    />
                  </div>

                  {nameError && (
                    <div className="text-xs text-text flex items-center gap-1.5 p-2 rounded-md bg-surface-raised border border-border">
                      <AlertCircle className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span>{nameError}</span>
                    </div>
                  )}
                  {nameSuccess && (
                    <div className="text-xs text-text flex items-center gap-1.5 p-2 rounded-md bg-surface-raised border border-border">
                      <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span>Name updated successfully.</span>
                    </div>
                  )}

                  {!isViewer && (
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={isSavingName}
                      disabled={name.trim() === project.name || !name.trim()}
                    >
                      Save Name
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Change Default Branch */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Change Default Branch</CardTitle>
                <CardDescription className="text-xs">
                  Specify the target branch tracked for commits, manifest detection, and security evaluations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBranchChange} className="space-y-4">
                  <div className="max-w-md">
                    <Input
                      label="Target Branch"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      disabled={isViewer || isSavingBranch}
                      helperText="Must match an existing branch on the GitHub repository"
                      required
                    />
                  </div>

                  {branchError && (
                    <div className="text-xs text-text flex items-center gap-1.5 p-2 rounded-md bg-surface-raised border border-border">
                      <AlertCircle className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span>{branchError}</span>
                    </div>
                  )}
                  {branchSuccess && (
                    <div className="text-xs text-text flex items-center gap-1.5 p-2 rounded-md bg-surface-raised border border-border">
                      <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span>Default branch updated successfully.</span>
                    </div>
                  )}

                  {!isViewer && (
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={isSavingBranch}
                      disabled={branch.trim() === project.defaultBranch || !branch.trim()}
                    >
                      Save Branch
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Danger Zone: Delete Repository */}
            {!isViewer && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-sm text-text flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-danger" />
                    <span>Danger Zone: Delete Repository</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Permanently delete this repository and all associated metadata. This operation writes a permanent audit record and cannot be undone.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDelete} className="space-y-4">
                    <div className="max-w-md space-y-1.5">
                      <label className="block text-xs text-text">
                        Please type <strong className="font-mono text-accent">{project.name}</strong> to confirm:
                      </label>
                      <Input
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder={project.name}
                        disabled={isDeleting}
                      />
                    </div>

                    {deleteError && (
                      <div className="text-xs text-text flex items-center gap-1.5 p-2 rounded-md bg-surface-raised border border-border">
                        <AlertCircle className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span>{deleteError}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="danger"
                      size="sm"
                      loading={isDeleting}
                      disabled={
                        deleteConfirmation !== project.name &&
                        deleteConfirmation !== project.repoName
                      }
                    >
                      <Trash2 className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                      Permanently Delete Repository
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

