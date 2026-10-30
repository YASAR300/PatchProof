"use client";

import React from "react";
import {
  FileCode2,
  FileCheck,
  ShieldAlert,
  GitPullRequest,
  FileText,
  Package,
  Boxes,
  History,
} from "lucide-react";

export function ToolingStrip() {
  const tools = [
    { label: "Semgrep rules", icon: FileCode2 },
    { label: "SARIF import", icon: FileCheck },
    { label: "OSV advisories", icon: ShieldAlert },
    { label: "GitHub pull requests", icon: GitPullRequest },
    { label: "requirements.txt", icon: FileText },
    { label: "package-lock.json", icon: Package },
    { label: "pnpm-lock.yaml", icon: Boxes },
    { label: "Git history", icon: History },
  ];

  return (
    <section className="py-12 bg-[#eef0ff] border-y border-[#d8dbf8] text-text font-sans select-none">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-accent">
            Works with the tools you already use
          </span>
        </div>

        {/* 8 Plain-Text Chips with Icons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.label}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[8px] bg-white border border-[#d8dbf8] shadow-xs text-[13px] font-mono text-text font-medium"
              >
                <Icon className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                <span>{t.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

