"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem("patchproof_announcement_dismissed");
      if (!isDismissed) {
        setDismissed(false);
      }
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("patchproof_announcement_dismissed", "true");
    } catch {
      // sessionStorage unavailable
    }
  };

  if (dismissed) return null;

  return (
    <aside
      aria-label="Announcement"
      className="w-full bg-[#eef0ff] border-b border-[#d8dbf8] text-[#1e234d] text-xs font-sans transition-all select-none"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-9 flex items-center justify-between">
        {/* Center / Left: Early access announcement */}
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="font-semibold text-accent uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
            Early Access
          </span>
          <span className="text-text font-medium truncate">
            PatchProof is in early access. Try the demo project and verify a fix in minutes.
          </span>
          <a
            href="#workflow"
            className="text-accent hover:underline font-semibold flex items-center gap-1 shrink-0 ml-1"
          >
            How it works <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>

        {/* Secondary Utility Links (Desktop) & Dismiss button */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden lg:flex items-center gap-3 text-[12px] text-text-secondary border-r border-[#d8dbf8] pr-4">
            <Link href="/login" className="hover:text-text transition-colors">
              Sign in
            </Link>
            <span>•</span>
            <a href="#pricing" className="hover:text-text transition-colors">
              Pricing
            </a>
            <span>•</span>
            <a href="#faq" className="hover:text-text transition-colors">
              FAQ
            </a>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
            className="p-1 rounded hover:bg-black/5 text-text-tertiary hover:text-text transition-colors"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}

