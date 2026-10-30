"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShieldAlert, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { EvidenceScene } from "./scenes/EvidenceScene";

export function EvidenceSwitcher() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const blocks = [
    {
      id: "reproduced",
      status: "REPRODUCED",
      badgeColor: "text-[#f87171] bg-[#fef2f2] border-[#fecaca]",
      icon: ShieldAlert,
      title: "Exploit Active in Baseline",
      description: "Tautology payload returned all table rows. Vulnerability confirmed via standard library reproducer.",
    },
    {
      id: "fix-verified",
      status: "FIX_VERIFIED",
      badgeColor: "text-[#16a34a] bg-[#ecfdf5] border-[#a7f3d0]",
      icon: CheckCircle2,
      title: "Fix Verified for Tested Cases",
      description: "Parameterized query neutralized the injection. All 5 regression tests passed with zero errors.",
    },
    {
      id: "patch-not-verified",
      status: "PATCH_NOT_VERIFIED",
      badgeColor: "text-[#ea580c] bg-[#fff7ed] border-[#fed7aa]",
      icon: XCircle,
      title: "Incomplete Fix Bypass Detected",
      description: "Uppercase filter bypassed with lowercase 'or'. Exploit continues to trigger in test harness.",
    },
  ];

  // Auto-advance timer (7 seconds per block)
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || isPaused) return;

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % blocks.length);
    }, 7000);

    return () => clearInterval(intervalRef.current);
  }, [isPaused, blocks.length]);

  return (
    <section id="evidence" className="py-24 sm:py-32 bg-[#eef0ff] border-y border-[#d8dbf8] text-text font-sans select-none">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-accent">
            Factual Verification
          </span>
          <h2 className="text-[36px] sm:text-[44px] font-bold tracking-[-0.025em] leading-[1.15] text-[#0b0b0c]">
            What a verification report shows
          </h2>
          <p className="text-[17px] text-text-secondary">
            Concrete evidence with commit hashes, test oracle logs, and reproduction verdicts.
          </p>
        </div>

        {/* 3 Factual Numerals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <div className="p-6 rounded-[16px] bg-white border border-[#d8dbf8] shadow-sm text-center">
            <div className="text-[44px] sm:text-[52px] font-bold text-accent font-mono">4</div>
            <div className="text-[14px] font-semibold text-[#0b0b0c] mt-1">Verification Statuses</div>
            <div className="text-[12px] text-text-secondary mt-0.5">REPRODUCED • NOT_REPRODUCED • INCONCLUSIVE • ERROR</div>
          </div>
          <div className="p-6 rounded-[16px] bg-white border border-[#d8dbf8] shadow-sm text-center">
            <div className="text-[44px] sm:text-[52px] font-bold text-accent font-mono">3</div>
            <div className="text-[14px] font-semibold text-[#0b0b0c] mt-1">Labeled Sources</div>
            <div className="text-[12px] text-text-secondary mt-0.5">Static Scanner • Test Harness • AI Assistant</div>
          </div>
          <div className="p-6 rounded-[16px] bg-white border border-[#d8dbf8] shadow-sm text-center">
            <div className="text-[44px] sm:text-[52px] font-bold text-accent font-mono">1</div>
            <div className="text-[14px] font-semibold text-[#0b0b0c] mt-1">Evidence Report Per Fix</div>
            <div className="text-[12px] text-text-secondary mt-0.5">Cryptographic integrity hash on baseline and candidate</div>
          </div>
        </div>

        {/* Interactive Switcher with Progress Bars */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
        >
          {/* Left Column: 3 Selectable Blocks with Progress Bars (5 cols) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              {blocks.map((block, idx) => {
                const isSelected = activeIndex === idx;
                const Icon = block.icon;

                return (
                  <div
                    key={block.id}
                    tabIndex={0}
                    role="button"
                    aria-selected={isSelected}
                    onClick={() => setActiveIndex(idx)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveIndex(idx);
                      }
                    }}
                    onFocus={() => setIsPaused(true)}
                    onBlur={() => setIsPaused(false)}
                    className={`p-5 rounded-[16px] border text-left cursor-pointer transition-all relative overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isSelected
                        ? "bg-white border-accent shadow-md"
                        : "bg-white/60 hover:bg-white border-[#d8dbf8]"
                    }`}
                  >
                    {/* Progress Bar (Runs when active and not paused) */}
                    {isSelected && !isPaused && (
                      <div
                        className="absolute bottom-0 left-0 h-[3px] bg-accent animate-pulse"
                        style={{ width: "100%", transition: "width 7s linear" }}
                      />
                    )}

                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${block.badgeColor}`}>
                        {block.status}
                      </span>
                      <Icon className="w-4 h-4 text-accent" />
                    </div>
                    <div className="text-[16px] font-bold text-[#0b0b0c] mt-2">
                      {block.title}
                    </div>
                    <div className="text-[13px] text-text-secondary mt-1 leading-snug">
                      {block.description}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <a
                href="#prove"
                className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent hover:underline"
              >
                See how results are classified <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: EvidenceScene (7 cols) */}
          <div className="lg:col-span-7">
            <EvidenceScene className="h-full shadow-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}

