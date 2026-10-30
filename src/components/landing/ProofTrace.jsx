"use client";

import React, { useEffect, useState } from "react";

const MILESTONES = [
  { id: "hero", sha: "a1b2c3d", label: "found" },
  { id: "gap", sha: "e4f5a6b", label: "reproduced" },
  { id: "workflow", sha: "9c8d7e6", label: "verified" },
  { id: "product", sha: "3e9f1a0", label: "workspace" },
  { id: "evidence", sha: "5f4e3d2", label: "evidence" },
  { id: "security", sha: "7b8c9d0", label: "isolated" },
  { id: "pricing", sha: "2a3b4c5", label: "ready" },
];

export function ProofTrace() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        const progress = Math.min(1, Math.max(0, window.scrollY / total));
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <aside
      className="hidden xl:block fixed left-6 top-24 bottom-12 w-32 z-20 pointer-events-none select-none font-mono text-[11px]"
      aria-hidden="true"
    >
      {/* 1px Vertical Background Trace Line */}
      <div className="absolute left-[3px] top-0 bottom-0 w-[1px] bg-black/[0.1] dark:bg-white/[0.1]">
        {/* Dynamic Accent Fill using transform scaleY only */}
        <div
          className="w-full bg-accent origin-top transition-transform duration-75 ease-out"
          style={{ height: "100%", transform: `scaleY(${scrollProgress})` }}
        />
      </div>

      {/* Commit Milestone Nodes */}
      <div className="relative h-full flex flex-col justify-between py-2">
        {MILESTONES.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-2 group">
            {/* 8px Commit Node */}
            <div className="w-[7px] h-[7px] rounded-full border border-black/40 bg-white dark:bg-[#0b0b0c] dark:border-white/50 flex-shrink-0" />
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {item.sha}
              </span>
              <span className="text-slate-400 dark:text-slate-500">
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

