"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Search,
  LayoutDashboard,
  FolderGit2,
  Bug,
  Terminal,
  FileCheck2,
  Package,
  Bot,
  History,
  Settings,
  Sun,
  Moon,
  LogOut,
  X,
} from "lucide-react";
import { Kbd } from "@/components/ui/Kbd";
import { cn } from "@/lib/cn";

export function CommandPalette({ isOpen, onClose, currentTheme, onToggleTheme }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const COMMANDS = [
    {
      id: "nav-overview",
      title: "Go to Overview",
      category: "Navigation",
      icon: LayoutDashboard,
      shortcut: "G O",
      action: () => router.push("/app"),
    },
    {
      id: "nav-repos",
      title: "Go to Repositories",
      category: "Navigation",
      icon: FolderGit2,
      shortcut: "G R",
      action: () => router.push("/app/repositories"),
    },
    {
      id: "nav-findings",
      title: "Go to Findings",
      category: "Navigation",
      icon: Bug,
      shortcut: "G F",
      action: () => router.push("/app/findings"),
    },
    {
      id: "nav-runs",
      title: "Go to Verification Runs",
      category: "Navigation",
      icon: Terminal,
      shortcut: "G V",
      action: () => router.push("/app/runs"),
    },
    {
      id: "nav-reports",
      title: "Go to Patch Reports",
      category: "Navigation",
      icon: FileCheck2,
      shortcut: "G P",
      action: () => router.push("/app/reports"),
    },
    {
      id: "nav-deps",
      title: "Go to Dependencies",
      category: "Navigation",
      icon: Package,
      shortcut: "G D",
      action: () => router.push("/app/dependencies"),
    },
    {
      id: "nav-ai",
      title: "Go to AI Assistant",
      category: "Navigation",
      icon: Bot,
      shortcut: "G A",
      action: () => router.push("/app/assistant"),
    },
    {
      id: "nav-audit",
      title: "Go to History & Audit",
      category: "Navigation",
      icon: History,
      shortcut: "G H",
      action: () => router.push("/app/audit"),
    },
    {
      id: "nav-settings",
      title: "Go to Settings",
      category: "Navigation",
      icon: Settings,
      shortcut: "G S",
      action: () => router.push("/app/settings"),
    },
    {
      id: "act-theme",
      title: `Switch to ${currentTheme === "dark" ? "Light" : "Dark"} Mode`,
      category: "Preferences",
      icon: currentTheme === "dark" ? Sun : Moon,
      action: () => onToggleTheme(),
    },
    {
      id: "act-logout",
      title: "Sign Out",
      category: "Account",
      icon: LogOut,
      action: () => signOut({ callbackUrl: "/login" }),
    },
  ];

  const filteredCommands = COMMANDS.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeSelected = () => {
    if (filteredCommands[selectedIndex]) {
      filteredCommands[selectedIndex].action();
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      executeSelected();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-100"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette Modal */}
      <div className="relative w-full max-w-xl rounded-xl border border-border bg-surface text-text shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 z-10 font-sans">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-border">
          <Search className="w-4 h-4 text-text-muted mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or jump to..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-12 bg-transparent text-xs text-text placeholder:text-text-muted/60 outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text rounded"
            aria-label="Close command palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border/40">
          {filteredCommands.length === 0 ? (
            <div className="p-6 text-center text-xs text-text-muted">
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer select-none transition-colors",
                    isSelected ? "bg-accent/15 text-accent font-medium" : "text-text hover:bg-surface-raised"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{cmd.title}</span>
                  </div>
                  {cmd.shortcut ? (
                    <div className="flex items-center gap-1 font-mono text-2xs text-text-muted">
                      {cmd.shortcut.split(" ").map((k) => (
                        <Kbd key={k}>{k}</Kbd>
                      ))}
                    </div>
                  ) : (
                    <span className="text-2xs font-mono text-text-muted/60">{cmd.category}</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-border/50 bg-surface-raised/40 text-2xs text-text-muted flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Use</span>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <span>to navigate</span>
            <Kbd>↵</Kbd>
            <span>to select</span>
          </div>
          <div className="flex items-center gap-1">
            <Kbd>Esc</Kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
