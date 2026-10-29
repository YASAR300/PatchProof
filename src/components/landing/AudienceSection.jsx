"use client";

import React from "react";
import { Cloud, Building2, Code2, ShieldAlert } from "lucide-react";

export function AudienceSection() {
  const audiences = [
    {
      title: "SaaS engineering teams",
      description: "Ship fast with continuous PR regression monitoring so critical customer data vulnerabilities never silently return.",
      icon: Cloud,
    },
    {
      title: "Software companies",
      description: "Replace unverified vendor vulnerability spreadsheets with deterministic cryptographic test proof.",
      icon: Building2,
    },
    {
      title: "Open-source maintainers",
      description: "Filter out noisy, automated triage reports and focus exclusively on bug reports accompanied by a reproducible test.",
      icon: Code2,
    },
    {
      title: "Application-security teams",
      description: "Empower developers with automated reproducers and patch verification rather than throwing PDF reports over the fence.",
      icon: ShieldAlert,
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#ffffff] text-[#1d1d1f] border-b border-black/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#0071e3] mb-3 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
            Target Teams
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.1] text-[#1d1d1f]">
            Built for teams that require evidence.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#86868b] leading-relaxed">
            Engineered for organizations that refuse to accept security alerts without executable proof.
          </p>
        </div>

        {/* 4 Small Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-6 space-y-4 hover:border-black/[0.15] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-black/[0.04] border border-black/[0.06] flex items-center justify-center text-[#1d1d1f]">
                  <Icon className="w-5 h-5 text-[#0071e3]" />
                </div>
                <h3 className="text-base font-semibold text-[#1d1d1f] tracking-tight">{item.title}</h3>
                <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
