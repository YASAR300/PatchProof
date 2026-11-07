"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User as UserIcon,
  Sliders,
  Users,
  Webhook,
  Server,
  AlertTriangle,
  Save,
  Check,
  Shield,
  Trash2,
  Plus,
  Key,
  Terminal,
  Lock,
  GitBranch,
  FolderGit2,
  ExternalLink,
  Code2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { WebhookIntegrationsSection } from "@/components/app/WebhookIntegrationsSection";
import { WorkerSettingsSection } from "@/components/app/WorkerSettingsSection";

export function SettingsClient({
  user,
  project,
  initialMembers = [],
  currentUserRole = "VIEWER",
  isAllowListed = false,
  allowedRepos = [],
  deliveries = [],
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile"); // profile | project | members | integrations | worker | danger

  // --- Profile State ---
  const [name, setName] = useState(user?.name || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // --- Project State ---
  const [projectName, setProjectName] = useState(project?.name || "");
  const [defaultBranch, setDefaultBranch] = useState(project?.defaultBranch || "main");
  const [language, setLanguage] = useState(project?.language || "python");
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [projectSuccess, setProjectSuccess] = useState(null);
  const [projectError, setProjectError] = useState(null);

  // --- Members State ---
  const [members, setMembers] = useState(initialMembers);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("MEMBER");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberActionError, setMemberActionError] = useState(null);
  const [memberActionSuccess, setMemberActionSuccess] = useState(null);

  // --- Danger Zone State ---
  const [typedConfirmation, setTypedConfirmation] = useState("");
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const isOwner = currentUserRole === "OWNER";

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      setProfileSuccess("Profile name updated successfully.");
      router.refresh();
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setIsChangingPassword(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle Save Project Details
  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!project) return;
    setIsSavingProject(true);
    setProjectSuccess(null);
    setProjectError(null);

    try {
      const res = await fetch(`/api/repositories/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          defaultBranch,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update project");
      setProjectSuccess("Project settings updated successfully.");
      router.refresh();
    } catch (err) {
      setProjectError(err.message);
    } finally {
      setIsSavingProject(false);
    }
  };

  // Handle Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!project) return;
    setIsAddingMember(true);
    setMemberActionError(null);
    setMemberActionSuccess(null);

    try {
      const res = await fetch(`/api/repositories/${project.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newMemberEmail,
          role: newMemberRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add member");
      setMembers([...members, data.member]);
      setNewMemberEmail("");
      setMemberActionSuccess(`Added ${data.member.user?.email || "user"} as ${data.member.role}.`);
      router.refresh();
    } catch (err) {
      setMemberActionError(err.message);
    } finally {
      setIsAddingMember(false);
    }
  };

  // Handle Role Change
  const handleRoleChange = async (memberId, newRole) => {
    if (!project) return;
    setMemberActionError(null);
    setMemberActionSuccess(null);

    try {
      const res = await fetch(`/api/repositories/${project.id}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update member role");
      setMembers(members.map((m) => (m.id === memberId ? data.member : m)));
      setMemberActionSuccess("Member role updated.");
      router.refresh();
    } catch (err) {
      setMemberActionError(err.message);
    }
  };

  // Handle Remove Member
  const handleRemoveMember = async (memberId) => {
    if (!project) return;
    if (!window.confirm("Are you sure you want to remove this member from the project?")) return;
    setMemberActionError(null);
    setMemberActionSuccess(null);

    try {
      const res = await fetch(`/api/repositories/${project.id}/members?memberId=${memberId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove member");
      setMembers(members.filter((m) => m.id !== memberId));
      setMemberActionSuccess("Member removed from project.");
      router.refresh();
    } catch (err) {
      setMemberActionError(err.message);
    }
  };

  // Handle Delete Project
  const handleDeleteProject = async (e) => {
    e.preventDefault();
    if (!project) return;
    setIsDeletingProject(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/repositories/${project.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationName: typedConfirmation }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete project");
      router.push("/app");
      router.refresh();
    } catch (err) {
      setDeleteError(err.message);
      setIsDeletingProject(false);
    }
  };

  const isDeleteConfirmationMatch =
    project && (typedConfirmation === project.slug || typedConfirmation === project.name || typedConfirmation === project.repoName);

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start font-sans">
      {/* Left Sub-navigation Tabs */}
      <aside className="w-full md:w-52 flex-shrink-0 space-y-1 text-xs select-none">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`w-full h-8 px-2.5 rounded-[6px] flex items-center gap-2 font-medium text-left transition-colors cursor-pointer ${
            activeTab === "profile"
              ? "bg-surface-raised text-text shadow-sm"
              : "text-text-secondary hover:text-text hover:bg-surface-hover"
          }`}
          data-testid="tab-settings-profile"
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>Profile & Account</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("project")}
          className={`w-full h-8 px-2.5 rounded-[6px] flex items-center gap-2 font-medium text-left transition-colors cursor-pointer ${
            activeTab === "project"
              ? "bg-surface-raised text-text shadow-sm"
              : "text-text-secondary hover:text-text hover:bg-surface-hover"
          }`}
          data-testid="tab-settings-project"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Project & Repository</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`w-full h-8 px-2.5 rounded-[6px] flex items-center gap-2 font-medium text-left transition-colors cursor-pointer ${
            activeTab === "members"
              ? "bg-surface-raised text-text shadow-sm"
              : "text-text-secondary hover:text-text hover:bg-surface-hover"
          }`}
          data-testid="tab-settings-members"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Members & Roles</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("integrations")}
          className={`w-full h-8 px-2.5 rounded-[6px] flex items-center gap-2 font-medium text-left transition-colors cursor-pointer ${
            activeTab === "integrations"
              ? "bg-surface-raised text-text shadow-sm"
              : "text-text-secondary hover:text-text hover:bg-surface-hover"
          }`}
          data-testid="tab-settings-integrations"
        >
          <Webhook className="w-3.5 h-3.5 text-purple-400" />
          <span>Integrations & Webhooks</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("worker")}
          className={`w-full h-8 px-2.5 rounded-[6px] flex items-center gap-2 font-medium text-left transition-colors cursor-pointer ${
            activeTab === "worker"
              ? "bg-surface-raised text-text shadow-sm"
              : "text-text-secondary hover:text-text hover:bg-surface-hover"
          }`}
          data-testid="tab-settings-worker"
        >
          <Server className="w-3.5 h-3.5 text-accent" />
          <span>Worker & Runner</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("danger")}
          className={`w-full h-8 px-2.5 rounded-[6px] flex items-center gap-2 font-medium text-left transition-colors cursor-pointer ${
            activeTab === "danger"
              ? "bg-rose-500/15 text-rose-300 shadow-sm"
              : "text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10"
          }`}
          data-testid="tab-settings-danger"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Danger Zone</span>
        </button>
      </aside>

      {/* Main Tab Content Panels */}
      <div className="flex-1 w-full space-y-5">
        {/* ===================== TAB 1: PROFILE ===================== */}
        {activeTab === "profile" && (
          <div className="space-y-5">
            <Card className="border-border">
              <CardHeader className="py-3 px-4 border-b border-border/60 bg-surface-raised/30">
                <CardTitle className="text-sm font-semibold">User Profile</CardTitle>
                <CardDescription className="text-xs">
                  Your identity visible on audit logs and reviewer sign-off reports.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Avatar Display */}
                <div className="flex items-center gap-3">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name || user.email}
                      className="w-12 h-12 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-surface-raised border border-border flex items-center justify-center text-sm font-bold text-accent">
                      {(user?.name || user?.email || "U").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-semibold text-text">{user?.name || "No name set"}</div>
                    <div className="text-[11px] font-mono text-text-tertiary">{user?.email}</div>
                    {user?.avatarUrl && (
                      <span className="text-[10px] font-mono text-emerald-400">Synced from GitHub</span>
                    )}
                  </div>
                </div>

                {/* Edit Name Form */}
                <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 border-t border-border/60">
                  <div className="max-w-md space-y-1">
                    <label className="text-[11px] font-mono text-text-tertiary block font-semibold">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full h-8 px-2.5 rounded-[5px] border border-border bg-surface text-xs text-text outline-none focus:border-accent"
                      data-testid="profile-name-input"
                    />
                  </div>

                  {profileSuccess && (
                    <div className="p-2.5 rounded text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                      {profileSuccess}
                    </div>
                  )}
                  {profileError && (
                    <div className="p-2.5 rounded text-xs border border-rose-500/30 bg-rose-500/10 text-rose-400">
                      {profileError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSavingProfile}
                    data-testid="save-profile-btn"
                  >
                    <span>{isSavingProfile ? "Saving..." : "Save Profile"}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card className="border-border">
              <CardHeader className="py-3 px-4 border-b border-border/60 bg-surface-raised/30">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-accent" />
                  <CardTitle className="text-sm font-semibold">Change Password</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Update your authentication credentials for local email login.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {user?.passwordHash ? (
                  <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-text-tertiary block font-semibold">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-8 px-2.5 rounded-[5px] border border-border bg-surface text-xs text-text outline-none focus:border-accent font-mono"
                        required
                        data-testid="current-password-input"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-text-tertiary block font-semibold">
                        New Password (min 8 chars)
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-8 px-2.5 rounded-[5px] border border-border bg-surface text-xs text-text outline-none focus:border-accent font-mono"
                        required
                        data-testid="new-password-input"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-text-tertiary block font-semibold">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-8 px-2.5 rounded-[5px] border border-border bg-surface text-xs text-text outline-none focus:border-accent font-mono"
                        required
                        data-testid="confirm-password-input"
                      />
                    </div>

                    {passwordSuccess && (
                      <div className="p-2.5 rounded text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                        {passwordSuccess}
                      </div>
                    )}
                    {passwordError && (
                      <div className="p-2.5 rounded text-xs border border-rose-500/30 bg-rose-500/10 text-rose-400">
                        {passwordError}
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isChangingPassword}
                      data-testid="change-password-btn"
                    >
                      <span>{isChangingPassword ? "Updating..." : "Update Password"}</span>
                    </Button>
                  </form>
                ) : (
                  <div className="p-3 rounded border border-border bg-surface text-xs text-text-secondary flex items-center gap-2">
                    <Shield className="w-4 h-4 text-text-tertiary shrink-0" />
                    <span>Signed in via GitHub OAuth. Password authentication is disabled for this account.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===================== TAB 2: PROJECT ===================== */}
        {activeTab === "project" && (
          <div className="space-y-5">
            <Card className="border-border">
              <CardHeader className="py-3 px-4 border-b border-border/60 bg-surface-raised/30 flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Project Details</CardTitle>
                  <CardDescription className="text-xs">
                    Workspace identification and git branch targets.
                  </CardDescription>
                </div>
                {project?.isDemo && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Demo Project
                  </span>
                )}
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <form onSubmit={handleSaveProject} className="space-y-3 max-w-md">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-text-tertiary block font-semibold">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-[5px] border border-border bg-surface text-xs text-text outline-none focus:border-accent"
                      required
                      data-testid="project-name-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-text-tertiary block font-semibold">
                      Default Monitored Branch
                    </label>
                    <input
                      type="text"
                      value={defaultBranch}
                      onChange={(e) => setDefaultBranch(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-[5px] border border-border bg-surface text-xs text-text outline-none focus:border-accent font-mono"
                      required
                      data-testid="project-branch-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-text-tertiary block font-semibold">
                      Primary Language
                    </label>
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      placeholder="python, javascript, etc."
                      className="w-full h-8 px-2.5 rounded-[5px] border border-border bg-surface text-xs text-text outline-none focus:border-accent font-mono"
                      data-testid="project-language-input"
                    />
                  </div>

                  {projectSuccess && (
                    <div className="p-2.5 rounded text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                      {projectSuccess}
                    </div>
                  )}
                  {projectError && (
                    <div className="p-2.5 rounded text-xs border border-rose-500/30 bg-rose-500/10 text-rose-400">
                      {projectError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSavingProject || !isOwner}
                    data-testid="save-project-btn"
                  >
                    <span>{isSavingProject ? "Saving..." : "Save Project Settings"}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Read-Only Test Commands for Demo Project */}
            {project?.isDemo && (
              <Card className="border-border">
                <CardHeader className="py-3 px-4 border-b border-border/60 bg-surface-raised/30">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <CardTitle className="text-sm font-semibold">Test Commands (Read-only)</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Configured by the demonstration manifest. Executed inside isolated container sandboxes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[11px] text-text-tertiary block font-semibold mb-1">
                      Security Reproducer Command:
                    </span>
                    <pre className="p-2.5 rounded bg-[#080809] border border-border text-emerald-300 text-[11px]">
                      python security/reproducers/sqli_find_user.py
                    </pre>
                  </div>

                  <div>
                    <span className="text-[11px] text-text-tertiary block font-semibold mb-1">
                      Regression Test Suite Command:
                    </span>
                    <pre className="p-2.5 rounded bg-[#080809] border border-border text-emerald-300 text-[11px]">
                      python -m unittest discover -v tests
                    </pre>
                  </div>

                  <div>
                    <span className="text-[11px] text-text-tertiary block font-semibold mb-1">
                      Sandbox Docker Image:
                    </span>
                    <pre className="p-2.5 rounded bg-[#080809] border border-border text-text-secondary text-[11px]">
                      docker.io/library/python:3.12-slim (sha256:emulated-sandbox-python-3.12)
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ===================== TAB 3: MEMBERS ===================== */}
        {activeTab === "members" && (
          <div className="space-y-5">
            <Card className="border-border">
              <CardHeader className="py-3 px-4 border-b border-border/60 bg-surface-raised/30 flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Project Members & Access Control</CardTitle>
                  <CardDescription className="text-xs">
                    Manage collaborators, reviewers, and access permissions for this workspace.
                  </CardDescription>
                </div>
                <span className="text-[11px] font-mono text-text-tertiary">
                  Your Role: <strong className="text-text">{currentUserRole}</strong>
                </span>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {memberActionSuccess && (
                  <div className="p-2.5 rounded text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    {memberActionSuccess}
                  </div>
                )}
                {memberActionError && (
                  <div className="p-2.5 rounded text-xs border border-rose-500/30 bg-rose-500/10 text-rose-400">
                    {memberActionError}
                  </div>
                )}

                {/* Add Member Form (OWNER only) */}
                {isOwner ? (
                  <form onSubmit={handleAddMember} className="p-3 rounded border border-border bg-[#080809] space-y-3">
                    <span className="text-[11px] font-mono text-text-tertiary block font-semibold uppercase">
                      Add Existing User by Email
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="flex-1 h-8 px-2.5 rounded-[5px] border border-border bg-surface text-xs text-text outline-none focus:border-accent"
                        required
                        data-testid="add-member-email-input"
                      />
                      <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        className="h-8 px-2 rounded-[5px] border border-border bg-surface text-xs text-text outline-none focus:border-accent cursor-pointer"
                        data-testid="add-member-role-select"
                      >
                        <option value="MEMBER">MEMBER (Can verify & review)</option>
                        <option value="VIEWER">VIEWER (Read-only)</option>
                        <option value="OWNER">OWNER (Full administrative access)</option>
                      </select>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={isAddingMember || !newMemberEmail.trim()}
                        className="gap-1 flex-shrink-0"
                        data-testid="add-member-submit-btn"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Member</span>
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="p-2.5 rounded border border-border bg-surface text-xs text-text-secondary">
                    Only project <strong>OWNER</strong>s can invite collaborators or update member permissions.
                  </div>
                )}

                {/* Members List Table */}
                <div className="rounded border border-border overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 p-2.5 px-3 bg-surface-raised/40 text-[11px] font-semibold text-text-secondary uppercase tracking-wider select-none">
                    <div className="col-span-5 sm:col-span-4">User</div>
                    <div className="col-span-4 sm:col-span-4">Role</div>
                    <div className="hidden sm:block sm:col-span-2">Joined</div>
                    <div className="col-span-3 sm:col-span-2 text-right">Actions</div>
                  </div>

                  <div className="divide-y divide-border text-xs">
                    {members.map((m) => {
                      const isTargetUserSelf = m.user?.id === user?.id;

                      return (
                        <div
                          key={m.id}
                          className="grid grid-cols-12 gap-2 p-3 px-3 items-center hover:bg-surface-hover/60 transition-colors"
                          data-testid={`member-row-${m.id}`}
                        >
                          {/* User info */}
                          <div className="col-span-5 sm:col-span-4 min-w-0 flex items-center gap-2">
                            {m.user?.avatarUrl ? (
                              <img
                                src={m.user.avatarUrl}
                                alt={m.user.name || m.user.email}
                                className="w-6 h-6 rounded-full border border-border object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-surface-raised border border-border flex items-center justify-center text-[10px] font-bold text-accent shrink-0">
                                {(m.user?.name || m.user?.email || "U").slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-medium text-text truncate">
                                {m.user?.name || m.user?.email}
                                {isTargetUserSelf && (
                                  <span className="ml-1 text-[10px] font-mono text-accent">(You)</span>
                                )}
                              </div>
                              <div className="text-[11px] text-text-tertiary font-mono truncate">
                                {m.user?.email}
                              </div>
                            </div>
                          </div>

                          {/* Role selector */}
                          <div className="col-span-4 sm:col-span-4">
                            {isOwner ? (
                              <select
                                value={m.role}
                                onChange={(e) => handleRoleChange(m.id, e.target.value)}
                                className="h-7 px-2 rounded-[4px] border border-border bg-surface text-xs font-mono text-text outline-none focus:border-accent cursor-pointer"
                                data-testid={`member-role-select-${m.id}`}
                              >
                                <option value="OWNER">OWNER</option>
                                <option value="MEMBER">MEMBER</option>
                                <option value="VIEWER">VIEWER</option>
                              </select>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium border bg-surface-raised text-text">
                                {m.role}
                              </span>
                            )}
                          </div>

                          {/* Joined date */}
                          <div className="hidden sm:block sm:col-span-2 text-[11px] font-mono text-text-tertiary">
                            {new Date(m.createdAt).toLocaleDateString()}
                          </div>

                          {/* Action remove */}
                          <div className="col-span-3 sm:col-span-2 text-right">
                            {isOwner && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(m.id)}
                                className="p-1 px-2 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-mono transition-colors cursor-pointer"
                                data-testid={`remove-member-btn-${m.id}`}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===================== TAB 4: INTEGRATIONS ===================== */}
        {activeTab === "integrations" && (
          <div className="space-y-5">
            <WebhookIntegrationsSection
              project={project}
              initialHasSecret={Boolean(project?.webhookSecretEncrypted)}
              initialExecutionEnabled={Boolean(project?.executionEnabled)}
              initialIsAllowListed={isAllowListed}
              initialAllowedRepos={allowedRepos}
              initialDeliveries={deliveries}
            />
          </div>
        )}

        {/* ===================== TAB 5: WORKER ===================== */}
        {activeTab === "worker" && (
          <div className="space-y-5">
            <WorkerSettingsSection />
          </div>
        )}

        {/* ===================== TAB 6: DANGER ZONE ===================== */}
        {activeTab === "danger" && (
          <div className="space-y-5">
            <Card className="border-rose-500/40 bg-rose-500/5">
              <CardHeader className="py-3 px-4 border-b border-rose-500/20 bg-rose-500/10">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <CardTitle className="text-sm font-semibold text-rose-300">Danger Zone — Delete Project</CardTitle>
                </div>
                <CardDescription className="text-xs text-rose-300/80">
                  Irreversible destruction of workspace records, verification histories, artifacts, and reports.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                <p className="text-text-secondary leading-relaxed">
                  Deleting this project will immediately purge all static analysis findings, container verification runs, patch reports, and dependency inventories. This action <strong>cannot</strong> be undone.
                </p>

                {isOwner ? (
                  <form onSubmit={handleDeleteProject} className="space-y-3 max-w-md pt-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-text-tertiary block font-semibold">
                        Type <code className="text-rose-300 font-bold">{project?.slug || project?.name}</code> to confirm deletion:
                      </label>
                      <input
                        type="text"
                        value={typedConfirmation}
                        onChange={(e) => setTypedConfirmation(e.target.value)}
                        placeholder={project?.slug || project?.name}
                        className="w-full h-8 px-2.5 rounded-[5px] border border-rose-500/40 bg-[#080809] text-xs font-mono text-rose-200 outline-none focus:border-rose-400"
                        required
                        data-testid="delete-project-confirmation-input"
                      />
                    </div>

                    {deleteError && (
                      <div className="p-2.5 rounded text-xs border border-rose-500/40 bg-rose-500/20 text-rose-300">
                        {deleteError}
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="danger"
                      size="sm"
                      disabled={!isDeleteConfirmationMatch || isDeletingProject}
                      className="gap-1.5"
                      data-testid="delete-project-confirm-btn"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isDeletingProject ? "Deleting..." : "Permanently Delete Project"}</span>
                    </Button>
                  </form>
                ) : (
                  <div className="p-3 rounded border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
                    Permission denied: only project <strong>OWNER</strong>s can delete this workspace.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
