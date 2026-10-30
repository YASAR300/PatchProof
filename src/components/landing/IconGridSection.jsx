"use client";

import React from "react";
import { ShieldCheck, PlayCircle, GitCompare, Archive } from "lucide-react";

export function IconGridSection() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Evidence, not alerts",
      description: "Every finding links directly to the deterministic test harness that supports or disproves it.",
    },
    {
      icon: PlayCircle,
      title: "Reproduce before you trust",
      description: "Run controlled, network-isolated exploit tests in disposable worker sandboxes with resource limits.",
    },
    {
      icon: GitCompare,
      title: "Verify the fix, not just the finding",
      description: "Execute the identical test suite against vulnerable and patched commits alongside regression checks.",
    },
    {
      icon: Archive,
      title: "Proof that stays",
      description: "Immutable verification reports with commit SHAs, stdout logs, and tamper-evident hashes you can audit anytime.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-t border-border/60 text-text font-sans select-none">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="space-y-3">
                <div className="w-10 h-10 rounded-[10px] bg-[#eef0ff] border border-[#d8dbf8] flex items-center justify-center text-accent">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-[17px] font-bold text-[#0b0b0c] leading-snug">
                  {item.title}
                </h3>
                <p className="text-[14px] text-text-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

