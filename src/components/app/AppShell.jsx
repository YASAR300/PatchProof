"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ShieldCheck,
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
  User as UserIcon,
} from "lucide-react";
import { Kbd } from "@/components/ui/Kbd";
import { Tooltip } from "@/components/ui/Tooltip";
import { CommandPalette } from "./CommandPalette";
import { ShortcutManager } from "./ShortcutManager";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { label: "Overview", href: "/app", icon: LayoutDashboard },
  { label: "Repositories", href: "/app/repositories", icon: FolderGit2 },
  { label: "Findings", href: "/app/findings", icon: Bug },
  { label: "Verification Runs", href: "/app/runs", icon: Terminal },
  { label: "Patch Reports", href: "/app/reports", icon: FileCheck2 },
  { label: "Dependencies", href: "/app/dependencies", icon: Package },
  { label: "AI Assistant", href: "/app/assistant", icon: Bot },
  { label: "History & Audit", href: "/app/audit", icon: History },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

export function AppShell({ children, user }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState("dark");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  // Sync theme with localStorage, cookie and html data-theme
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

  // Determine current page title for breadcrumb
  const currentNav = NAV_ITEMS.find((item) =>
    item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href)
  );
  const pageTitle = currentNav?.label || "Workspace";

  return (
    <div
      className="min-h-screen bg-background text-text font-sans flex flex-col md:flex-row transition-colors duration-150"
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
      />

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: 240px wide or 56px when collapsed */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface transition-all duration-200 select-none",
          // Mobile state
          isMobileOpen ? "translate-x-0 w-60" : "-translate-x-full md:translate-x-0",
          // Desktop state
          isCollapsed ? "md:w-14" : "md:w-60"
        )}
      >
        {/* Top: Logo & Project Switcher */}
        <div className="h-14 px-3.5 border-b border-border flex items-center justify-between">
          <Link
            href="/app"
            className={cn(
              "flex items-center gap-2.5 overflow-hidden",
              isCollapsed && "md:justify-center md:w-full"
            )}
          >
            <div className="w-7 h-7 rounded-lg bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-xs tracking-tight text-text truncate">
                PatchProof
              </span>
            )}
          </Link>

          {/* Mobile close */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1 text-text-muted hover:text-text rounded"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Project Switcher Dropdown */}
        <div className="p-2 border-b border-border/60 relative">
          <button
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className={cn(
              "w-full h-8.5 rounded-lg border border-border/70 bg-surface-raised/40 hover:bg-surface-raised px-2.5 flex items-center justify-between text-2xs text-text transition-colors",
              isCollapsed && "md:justify-center md:px-0"
            )}
            title="Project Switcher"
          >
            {!isCollapsed ? (
              <>
                <span className="truncate font-medium text-text-muted">No project yet</span>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted flex-shrink-0 ml-1" />
              </>
            ) : (
              <span className="font-mono text-2xs text-text-muted">--</span>
            )}
          </button>

          {isProjectDropdownOpen && !isCollapsed && (
            <div className="absolute left-2 right-2 top-11 p-3 rounded-lg border border-border bg-surface shadow-xl z-20 text-2xs space-y-2 animate-in fade-in duration-100">
              <div className="text-text-muted">No projects created yet.</div>
              <Link
                href="/app/repositories"
                onClick={() => setIsProjectDropdownOpen(false)}
                className="block text-accent hover:underline font-medium"
              >
                + Connect a repository
              </Link>
            </div>
          )}
        </div>

        {/* Navigation Items (Linear-style dense text & status icons) */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
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
                  "flex items-center gap-2.5 rounded-md text-xs font-medium transition-colors select-none",
                  isCollapsed ? "justify-center h-8.5 w-full px-0" : "px-2.5 py-1.5",
                  isActive
                    ? "bg-accent/15 text-accent font-semibold"
                    : "text-text-muted hover:text-text hover:bg-surface-raised"
                )}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-accent" : "text-text-muted")} />
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
        </nav>

        {/* Bottom Sidebar Footer & Collapse Toggle */}
        <div className="p-2 border-t border-border flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2 px-1 text-2xs text-text-muted truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="truncate">Local Engine Ready</span>
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={cn(
              "hidden md:flex p-1.5 rounded-md text-text-muted hover:text-text hover:bg-surface-raised transition-colors",
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
          "flex-1 flex flex-col min-w-0 transition-all duration-200",
          isCollapsed ? "md:pl-14" : "md:pl-60"
        )}
      >
        {/* Topbar */}
        <header className="h-14 sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
          {/* Left: Mobile hamburger & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-1.5 -ml-1 text-text-muted hover:text-text rounded-md"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted">
              <Link href="/app" className="hover:text-text transition-colors">
                app
              </Link>
              <span>/</span>
              <span className="text-text font-medium">{pageTitle.toLowerCase()}</span>
            </div>
          </div>

          {/* Right: Search Command Palette Trigger & User Menu */}
          <div className="flex items-center gap-3">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setIsPaletteOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border/80 bg-surface-raised/40 hover:bg-surface-raised text-2xs text-text-muted transition-colors"
              title="Search or jump to (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search or jump to…</span>
              <div className="flex items-center gap-0.5 ml-1">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </div>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-raised transition-colors"
                aria-expanded={isUserMenuOpen}
                aria-label="User profile menu"
              >
                <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 text-accent flex items-center justify-center font-semibold text-2xs">
                  {user?.name ? user.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : "U"}
                </div>
                <ChevronDown className="w-3 h-3 text-text-muted" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-10 w-56 rounded-xl border border-border bg-surface p-2 shadow-xl z-50 text-xs animate-in zoom-in-95 duration-100 space-y-1">
                  <div className="px-2.5 py-2 border-b border-border/50">
                    <div className="font-semibold text-text truncate">{user?.name || "Administrator"}</div>
                    <div className="text-2xs text-text-muted font-mono truncate">{user?.email || "admin@patchproof.dev"}</div>
                  </div>

                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-text hover:bg-surface-raised text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                      <span>Theme: {theme === "dark" ? "Dark" : "Light"}</span>
                    </div>
                  </button>

                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-rose-500 hover:bg-rose-500/10 text-xs transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
