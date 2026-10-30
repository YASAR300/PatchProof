"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FolderGit2,
  Bug,
  Terminal,
  FileCheck2,
  Package,
  Bot,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Search,
  Sun,
  Moon,
  LogOut,
  Plus,
} from "lucide-react";
import { Kbd } from "@/components/ui/Kbd";
import { Tooltip } from "@/components/ui/Tooltip";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { CommandPalette } from "./CommandPalette";
import { ShortcutManager } from "./ShortcutManager";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { label: "Overview", href: "/app", icon: LayoutDashboard },
    ],
  },
  {
    label: "Workflow",
    items: [
      { label: "Findings", href: "/app/findings", icon: Bug },
      { label: "Verification Runs", href: "/app/runs", icon: Terminal },
      { label: "Patch Reports", href: "/app/reports", icon: FileCheck2 },
    ],
  },
  {
    label: "Project",
    items: [
      { label: "Repositories", href: "/app/repositories", icon: FolderGit2 },
      { label: "Dependencies", href: "/app/dependencies", icon: Package },
      { label: "AI Assistant", href: "/app/assistant", icon: Bot },
    ],
  },
  {
    label: null,
    items: [
      { label: "History & Audit", href: "/app/audit", icon: History },
      { label: "Settings", href: "/app/settings", icon: Settings },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export function AppShell({ children, user, activeProject, userProjects = [] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState("dark");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const searchTriggerRef = useRef(null);

  useEffect(() => {
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator?.userAgent || ""));
  }, []);

  const handleSelectProject = async (projectId) => {
    if (activeProject?.id === projectId) return;
    try {
      await fetch("/api/projects/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      router.refresh();
    } catch (e) {
      console.error("Failed to switch project:", e);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("patchproof_theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    const savedCollapsed = localStorage.getItem("patchproof_sidebar_collapsed") === "true";
    setIsCollapsed(savedCollapsed);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("patchproof_theme", nextTheme);
    document.cookie = `patchproof_theme=${nextTheme}; path=/; max-age=31536000`;
  };

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("patchproof_sidebar_collapsed", String(next));
  };

  const currentNav = ALL_NAV_ITEMS.find((item) =>
    item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href)
  );
  const pageTitle = currentNav?.label || "Workspace";

  // Project dropdown items
  const projectMenuItems = [
    { header: `Projects (${userProjects.length})` },
    ...userProjects.map((p) => ({
      id: p.id,
      label: p.name,
      icon: FolderGit2,
      selected: activeProject?.id === p.id,
      onClick: () => handleSelectProject(p.id),
    })),
    { divider: true },
    {
      id: "connect-repo",
      label: "Connect a repository",
      icon: Plus,
      onClick: () => router.push("/app/repositories/new"),
    },
  ];

  // User menu dropdown items
  const userMenuItems = [
    { header: user?.name ? `${user.name}` : user?.email || "admin@patchproof.dev" },
    {
      id: "theme-toggle",
      label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
      icon: theme === "dark" ? Sun : Moon,
      onClick: toggleTheme,
    },
    { divider: true },
    {
      id: "signout-action",
      label: "Sign out",
      icon: LogOut,
      destructive: true,
      onClick: () => signOut({ callbackUrl: "/login" }),
    },
  ];

  return (
    <div
      className="min-h-screen bg-background text-text font-sans flex flex-col md:flex-row"
      data-theme={theme}
    >
      {/* Keyboard Shortcuts Listener */}
      <ShortcutManager onOpenCommandPalette={() => setIsPaletteOpen(true)} />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        currentTheme={theme}
        onToggleTheme={toggleTheme}
        triggerRef={searchTriggerRef}
      />

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: 232px wide or 48px when collapsed */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-sidebar select-none transition-[width] duration-150 ease-out",
          // Mobile state
          isMobileOpen ? "translate-x-0 w-[232px]" : "-translate-x-full md:translate-x-0",
          // Desktop state
          isCollapsed ? "md:w-[48px]" : "md:w-[232px]"
        )}
      >
        {/* Top: 48px Header Row */}
        <div className="h-12 px-3 border-b border-border flex items-center justify-between">
          <Logo href="/app" variant={isCollapsed ? "mark" : "horizontal"} size="sm" />

          {/* Mobile close */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1 text-text-tertiary hover:text-text rounded-[6px]"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Project Switcher Row: 32px row, borderless, radius 6px */}
        <div className="p-2 border-b border-border">
          <DropdownMenu
            className="w-full"
            items={projectMenuItems}
            trigger={
              <button
                type="button"
                className={cn(
                  "w-full h-8 rounded-[6px] border-0 bg-transparent hover:bg-surface-hover px-2 flex items-center justify-between text-xs text-text outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  isCollapsed && "md:justify-center md:px-0"
                )}
                title={activeProject ? activeProject.name : "Select Project"}
              >
                {!isCollapsed ? (
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded-[4px] bg-surface-raised border border-border text-[11px] font-mono font-medium text-text flex items-center justify-center flex-shrink-0">
                      {activeProject ? activeProject.name.slice(0, 1).toUpperCase() : "-"}
                    </span>
                    <span className="truncate font-medium text-[13px] text-text">
                      {activeProject ? activeProject.name : "No project yet"}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0 ml-auto" />
                  </div>
                ) : (
                  <span className="w-5 h-5 rounded-[4px] bg-surface-raised border border-border text-[11px] font-mono font-medium text-text flex items-center justify-center">
                    {activeProject ? activeProject.name.slice(0, 1).toUpperCase() : "-"}
                  </span>
                )}
              </button>
            }
          />
        </div>

        {/* Navigation Groups (Linear-style dense text & status icons) */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
          {NAV_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-0.5">
              {!isCollapsed && group.label && (
                <div className="px-2 pt-1 pb-1 text-[11px] font-medium text-text-tertiary select-none">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/app"
                    ? pathname === "/app"
                    : pathname.startsWith(item.href);

                const linkContent = (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-[6px] h-7 px-2 text-[13px] font-normal transition-colors select-none outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      isCollapsed ? "justify-center w-full px-0" : "w-full",
                      isActive
                        ? "bg-surface-selected text-text font-medium"
                        : "text-text-secondary hover:text-text hover:bg-surface-hover"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 flex-shrink-0 stroke-[1.5]",
                        isActive ? "text-text" : "text-text-secondary"
                      )}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );

                if (isCollapsed) {
                  return (
                    <Tooltip key={item.href} content={item.label} position="right">
                      {linkContent}
                    </Tooltip>
                  );
                }

                return linkContent;
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer: 28px status row with flat 6px dot & collapse icon */}
        <div className="h-10 px-2 border-t border-border flex items-center justify-between bg-sidebar">
          {!isCollapsed && (
            <div className="flex items-center gap-2 px-1 text-xs text-text-tertiary truncate select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-green flex-shrink-0" />
              <span className="truncate">Local Engine Ready</span>
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={cn(
              "hidden md:flex p-1 rounded-[6px] text-text-tertiary hover:text-text hover:bg-surface-hover transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent",
              isCollapsed && "mx-auto"
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-[padding] duration-150 ease-out",
          isCollapsed ? "md:pl-[48px]" : "md:pl-[232px]"
        )}
      >
        {/* Topbar: 48px high with 1px bottom border */}
        <header className="h-12 sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
          {/* Left: Mobile hamburger & Breadcrumb (sans-serif 13px) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-1 -ml-1 text-text-tertiary hover:text-text rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-[13px] font-sans text-text-secondary">
              <span className="truncate max-w-[160px]">{activeProject?.name || "Workspace"}</span>
              <span className="text-text-tertiary">/</span>
              <span className="text-text font-medium">{pageTitle}</span>
            </div>
          </div>

          {/* Right: Search Command Palette Trigger (32px high, 10px px, 14px icon, 8px gap) & Avatar (24px) */}
          <div className="flex items-center gap-2.5">
            {/* Mobile search trigger (icon-only 36px) */}
            <button
              ref={searchTriggerRef}
              onClick={() => setIsPaletteOpen(true)}
              aria-label="Search"
              className="sm:hidden w-9 h-9 flex items-center justify-center rounded-[6px] border border-border bg-surface hover:bg-surface-hover text-text-secondary hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Search className="w-3.5 h-3.5 stroke-[1.5]" aria-hidden="true" />
            </button>

            {/* Desktop search trigger (32px high, 10px px, 14px icon, 8px gap, one combined Kbd chip) */}
            <button
              onClick={() => setIsPaletteOpen(true)}
              className="hidden sm:flex items-center h-8 px-2.5 rounded-[6px] border border-border bg-surface hover:bg-surface-hover text-xs text-text-secondary hover:text-text w-[220px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent gap-2"
              title={`Search or jump to (${isMac ? "Cmd" : "Ctrl"}+K)`}
            >
              <Search className="w-3.5 h-3.5 stroke-[1.5] text-text-tertiary flex-shrink-0" aria-hidden="true" />
              <span className="truncate text-xs">Search or jump to…</span>
              <span className="ml-auto flex items-center">
                <Kbd>{isMac ? "⌘K" : "Ctrl K"}</Kbd>
              </span>
            </button>

            {/* User Dropdown with 24px Avatar circle */}
            <DropdownMenu
              align="end"
              items={userMenuItems}
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-1.5 p-0.5 rounded-[6px] hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="User profile menu"
                >
                  <div className="w-6 h-6 rounded-full bg-surface-raised border border-border text-text font-medium text-[11px] flex items-center justify-center">
                    {user?.name ? user.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : "A"}
                  </div>
                  <ChevronDown className="w-3 h-3 text-text-tertiary" />
                </button>
              }
            />
          </div>
        </header>

        {/* Dashboard Page Body */}
        <main className="flex-1 p-4 sm:p-6 w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
