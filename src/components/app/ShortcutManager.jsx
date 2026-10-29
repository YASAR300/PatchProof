"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";

export function ShortcutManager({ onOpenCommandPalette }) {
  const router = useRouter();
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const waitingForSecondKey = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing inside input, textarea, or contentEditable
      const target = e.target;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (isInput) return;

      // Cmd+K or Ctrl+K -> Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenCommandPalette?.();
        return;
      }

      // '?' (Shift + '/') -> Cheat sheet dialog
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsCheatSheetOpen(true);
        return;
      }

      // Check for two-step G-shortcut
      const key = e.key.toLowerCase();
      if (!waitingForSecondKey.current) {
        if (key === "g") {
          waitingForSecondKey.current = true;
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            waitingForSecondKey.current = false;
          }, 1500);
        }
      } else {
        // Second key pressed
        waitingForSecondKey.current = false;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        const routeMap = {
          o: "/app",
          r: "/app/repositories",
          f: "/app/findings",
          v: "/app/runs",
          p: "/app/reports",
          d: "/app/dependencies",
          a: "/app/assistant",
          h: "/app/audit",
          s: "/app/settings",
        };

        if (routeMap[key]) {
          e.preventDefault();
          router.push(routeMap[key]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router, onOpenCommandPalette]);

  return (
    <Dialog
      isOpen={isCheatSheetOpen}
      onClose={() => setIsCheatSheetOpen(false)}
      title="Keyboard Shortcuts"
      description="Quick navigation and command triggers throughout PatchProof"
    >
      <div className="space-y-4 py-2 font-sans text-xs">
        {/* Navigation Section */}
        <div className="space-y-2">
          <div className="text-2xs font-mono uppercase tracking-wider text-text-muted font-semibold">
            Two-Key Navigation (Press G then key)
          </div>
          <div className="grid grid-cols-2 gap-2 text-text">
            <div className="flex items-center justify-between p-2 rounded bg-surface-raised border border-border/50">
              <span>Overview</span>
              <div className="flex items-center gap-1 font-mono">
                <Kbd>G</Kbd>
                <Kbd>O</Kbd>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-raised border border-border/50">
              <span>Repositories</span>
              <div className="flex items-center gap-1 font-mono">
                <Kbd>G</Kbd>
                <Kbd>R</Kbd>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-raised border border-border/50">
              <span>Findings</span>
              <div className="flex items-center gap-1 font-mono">
                <Kbd>G</Kbd>
                <Kbd>F</Kbd>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-raised border border-border/50">
              <span>Verification Runs</span>
              <div className="flex items-center gap-1 font-mono">
                <Kbd>G</Kbd>
                <Kbd>V</Kbd>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-raised border border-border/50">
              <span>Patch Reports</span>
              <div className="flex items-center gap-1 font-mono">
                <Kbd>G</Kbd>
                <Kbd>P</Kbd>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-raised border border-border/50">
              <span>Dependencies</span>
              <div className="flex items-center gap-1 font-mono">
                <Kbd>G</Kbd>
                <Kbd>D</Kbd>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-raised border border-border/50">
              <span>AI Assistant</span>
              <div className="flex items-center gap-1 font-mono">
                <Kbd>G</Kbd>
                <Kbd>A</Kbd>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-raised border border-border/50">
              <span>History & Audit</span>
              <div className="flex items-center gap-1 font-mono">
                <Kbd>G</Kbd>
                <Kbd>H</Kbd>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-raised border border-border/50 col-span-2">
              <span>Settings</span>
              <div className="flex items-center gap-1 font-mono">
                <Kbd>G</Kbd>
                <Kbd>S</Kbd>
              </div>
            </div>
          </div>
        </div>

        {/* General Section */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="text-2xs font-mono uppercase tracking-wider text-text-muted font-semibold">
            General
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-2 rounded bg-surface-raised border border-border/50">
              <span>Open Command Palette</span>
              <div className="flex items-center gap-1 font-mono">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-raised border border-border/50">
              <span>Open Shortcut Cheat-Sheet</span>
              <Kbd>?</Kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-surface-raised border border-border/50">
              <span>Close Active Modal</span>
              <Kbd>Esc</Kbd>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="secondary" size="sm" onClick={() => setIsCheatSheetOpen(false)}>
          Got it
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
