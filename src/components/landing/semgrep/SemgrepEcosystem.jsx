"use client";

import React from "react";

export function SemgrepEcosystem() {
  const logos = [
    { name: "GitHub", tag: "Actions CI" },
    { name: "GitLab", tag: "Pipelines" },
    { name: "Docker", tag: "Containers" },
    { name: "Pytest", tag: "Reproducers" },
    { name: "Semgrep", tag: "AST Rules" },
    { name: "OSV", tag: "CVE Feeds" },
    { name: "Jira", tag: "Tickets" },
    { name: "Slack", tag: "Alerts" },
  ];

  return (
    <section className="py-14 bg-[#e2efe7] border-b border-[#c8e2d4] select-none text-center">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-6">
        <label className="text-[13px] font-mono uppercase tracking-widest text-[#2c4d3e] font-bold">
          Loved by leading engineering teams
        </label>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-7">
          {logos.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#b8dec9] text-[#0e261d] font-bold text-[14px] shadow-2xs hover:border-[#008456] transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-[#008456]" />
              <span>{item.name}</span>
              <span className="text-[11px] font-mono text-[#64748b]">({item.tag})</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
