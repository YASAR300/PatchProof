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

export function CommandPalette({ isOpen, onClose, currentTheme, onToggleTheme, triggerRef }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

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

  const filteredCommands = COMMANDS.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleClose = () => {
    onClose();
    if (triggerRef?.current) {
      triggerRef.current.focus();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeSelected = () => {
    if (filteredCommands[selectedIndex]) {
      filteredCommands[selectedIndex].action();
      handleClose();
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
      handleClose();
    } else if (e.key === "Tab") {
      // Focus trapping inside the palette
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  if (!isOpen) return null;

  // Group commands by category
  const categories = Array.from(new Set(filteredCommands.map((c) => c.category)));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-100"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Palette Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-xl rounded-[12px] border border-border bg-surface text-text shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 z-10 font-sans"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-3 border-b border-border h-11 gap-2">
          <Search className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or jump to..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-text placeholder:text-text-tertiary outline-none border-none focus:outline-none ring-0 focus:ring-0"
            aria-label="Command search query"
          />
          <button
            onClick={handleClose}
            className="p-1 text-text-tertiary hover:text-text rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close command palette"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-1 divide-y divide-border/20">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-secondary">
              No matching commands found.
            </div>
          ) : (
            categories.map((category) => {
              const categoryCommands = filteredCommands.filter((c) => c.category === category);
              return (
                <div key={category} className="py-1">
                  <div className="px-2 py-1 text-[11px] font-medium text-text-tertiary select-none">
                    {category}
                  </div>
                  {categoryCommands.map((cmd) => {
                    const globalIdx = filteredCommands.indexOf(cmd);
                    const isSelected = globalIdx === selectedIndex;
                    const Icon = cmd.icon;

                    return (
                      <button
                        key={cmd.id}
                        type="button"
                        onClick={() => {
                          cmd.action();
                          handleClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={cn(
                          "w-full h-8 px-2 rounded-[6px] flex items-center justify-between text-xs cursor-pointer select-none transition-colors outline-none",
                          isSelected
                            ? "bg-surface-selected text-text font-medium"
                            : "text-text-secondary hover:bg-surface-hover hover:text-text"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                            <Icon className="w-4 h-4" aria-hidden="true" />
                          </span>
                          <span className="truncate">{cmd.title}</span>
                        </div>
                        {cmd.shortcut ? (
                          <div className="flex items-center gap-1 font-mono text-2xs text-text-muted flex-shrink-0 ml-2">
                            {cmd.shortcut.split(" ").map((k) => (
                              <Kbd key={k}>{k}</Kbd>
                            ))}
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-3 py-2 border-t border-border/50 bg-surface-raised/40 text-2xs text-text-muted flex items-center justify-between">
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
