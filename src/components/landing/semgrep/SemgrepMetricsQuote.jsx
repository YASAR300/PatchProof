"use client";

import React, { useState } from "react";
import { Quote } from "lucide-react";

export function SemgrepMetricsQuote() {
  const [activeTab, setActiveTab] = useState(0);

  const testimonials = [
    {
      company: "CloudScale Platform",
      quote:
        "Before PatchProof, our security queue was a sea of thousands of speculative alerts that nobody wanted to review. Now, every flagged issue comes with a deterministic pytest reproducer that proves whether an attacker can exploit it, and verifies our fix on PR checkout.",
      author: "Sarah Lin",
      role: "Head of Application Security, CloudScale",
      avatar: "SL",
    },
    {
      company: "FinTech Core",
      quote:
        "PatchProof eliminated our entire manual triage backlog. By proving whether a CVE is actually reachable in our codebase, we reduced triage noise by 86% and stopped regressions from ever shipping to production.",
      author: "David Chen",
      role: "VP of Engineering, FinTech Core",
      avatar: "DC",
    },
    {
      company: "SaaS Systems",
      quote:
        "The cryptographic proof bundles alone saved us hundreds of audit hours during our SOC2 Type II certification. Auditors loved having tamper-evident git commit verification on every pull request.",
      author: "Elena Rostova",
      role: "Principal Security Architect, SaaS Systems",
      avatar: "ER",
    },
  ];

  const current = testimonials[activeTab];

  return (
    <section className="py-24 sm:py-32 bg-[#e2efe7] text-[#0e261d] select-none border-t border-[#c8e2d4]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-20">
        {/* Big Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-8 rounded-[24px] bg-white border border-[#cde4d6] shadow-sm space-y-2">
            <p className="text-[52px] sm:text-[64px] font-extrabold text-[#008456] font-mono leading-none">
              3.5x
            </p>
            <p className="text-[17px] font-bold text-[#0e261d]">More issues fixed</p>
            <p className="text-[14px] text-[#475569]">
              Developers fix verified vulnerabilities immediately when accompanied by a real reproducer
            </p>
          </div>

          <div className="p-8 rounded-[24px] bg-white border border-[#cde4d6] shadow-sm space-y-2">
            <p className="text-[52px] sm:text-[64px] font-extrabold text-[#008456] font-mono leading-none">
              86%
            </p>
            <p className="text-[17px] font-bold text-[#0e261d]">Less false positives</p>
            <p className="text-[14px] text-[#475569]">
              Reachable AST call-graph filtering eliminates dead code and harmless devDependency warnings
            </p>
          </div>

          <div className="p-8 rounded-[24px] bg-white border border-[#cde4d6] shadow-sm space-y-2">
            <p className="text-[52px] sm:text-[64px] font-extrabold text-[#008456] font-mono leading-none">
              90%
            </p>
            <p className="text-[17px] font-bold text-[#0e261d]">Developer adoption</p>
            <p className="text-[14px] text-[#475569]">
              Native GitHub pull request comments that fit seamlessly into regular code reviews
            </p>
          </div>
        </div>

        {/* Testimonial Banner (Tabs on Left + Big White Quote Card on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Company Switcher (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            {testimonials.map((t, idx) => {
              const isActive = idx === activeTab;
              return (
                <button
                  key={t.company}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`w-full text-left p-4 rounded-[16px] transition-all font-bold text-[15px] border ${
                    isActive
                      ? "bg-white border-[#008456] text-[#008456] shadow-sm"
                      : "bg-[#d3e8dc]/70 border-transparent hover:bg-white/60 text-[#2c4d3e]"
                  }`}
                >
                  {t.company}
                </button>
              );
            })}
          </div>

          {/* Right White Card (8 cols) */}
          <div className="lg:col-span-8 p-8 sm:p-12 rounded-[28px] bg-white border border-[#cde4d6] shadow-xl relative">
            <Quote className="w-12 h-12 text-[#008456]/15 absolute top-8 right-8" />
            <p className="text-[18px] sm:text-[22px] text-[#0e261d] leading-relaxed font-medium">
              &quot;{current.quote}&quot;
            </p>

            <div className="mt-8 pt-6 border-t border-[#f1f5f9] flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#008456] text-white flex items-center justify-center font-bold text-[17px]">
                {current.avatar}
              </div>
              <div>
                <p className="text-[16px] font-bold text-[#0e261d]">{current.author}</p>
                <p className="text-[13px] text-[#64748b]">{current.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
