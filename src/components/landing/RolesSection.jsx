"use client";

import React from "react";
import { Terminal, ShieldAlert, GitMerge, Check } from "lucide-react";

export function RolesSection() {
  const roles = [
    {
      icon: Terminal,
      title: "For developers",
      points: [
        "Clear findings with accurate source code context",
        "Re-run the exact same test harness against your fix",
        "Deterministic evidence reports you can paste directly into a pull request",
      ],
    },
    {
      icon: ShieldAlert,
      title: "For AppSec teams",
      points: [
        "Unified findings from multiple scanners in one dashboard",
        "Empirical reproducer results instead of speculative severity debates",
        "Immutable audit history of reviewer approvals and verified diffs",
      ],
    },
    {
      icon: GitMerge,
      title: "For maintainers",
      points: [
        "Quickly reproduce external security researcher bug reports",
        "Verify community contributor patches without manual exploit staging",
        "Preserve historical regression suites across major releases",
      ],
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-white border-t border-border/60 text-text font-sans select-none">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-accent">
            Role-Based Workflows
          </span>
          <h2 className="text-[36px] sm:text-[44px] font-bold tracking-[-0.025em] leading-[1.15] text-[#0b0b0c]">
            Built for every role in modern software
          </h2>
          <p className="text-[17px] text-text-secondary">
            Whether you write code, triage vulnerabilities, or maintain critical dependencies.
          </p>
        </div>

        {/* 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                className="p-7 rounded-[18px] bg-[#fbfbfd] border border-border/80 flex flex-col justify-between space-y-6 shadow-xs"
              >
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-[10px] bg-[#eef0ff] border border-[#d8dbf8] flex items-center justify-center text-accent">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-[20px] font-bold text-[#0b0b0c]">{role.title}</h3>
                  <ul className="space-y-3 pt-2">
                    {role.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-[14px] text-text-secondary leading-snug">
                        <div className="w-4 h-4 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

