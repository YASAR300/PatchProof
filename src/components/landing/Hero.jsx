"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldAlert, CheckCircle2, Check, Shield } from "lucide-react";
import { FindingsScene } from "./scenes";

export function Hero() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Settle transition on mount
    const timer = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleScrollToWorkflow = (e) => {
    e.preventDefault();
    const target = document.getElementById("workflow");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-[100vh] min-h-[820px] pt-8 pb-20 sm:pt-14 sm:pb-28 overflow-hidden bg-[#fbfbfd] text-[#1d1d1f] select-none flex flex-col justify-between"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 w-full">
        {/* Top Header & Copy */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
          {/* Centered Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[13px] font-medium text-[#1d1d1f] bg-black/[0.04] border border-black/[0.08]">
            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
            <span>Evidence-first security verification</span>
          </div>

          {/* H1 (clamp 48 to 96px, weight 600, leading 0.98, tracking -0.035em) */}
          <h1 className="text-[48px] sm:text-[72px] lg:text-[96px] font-semibold tracking-[-0.035em] leading-[0.98] text-[#1d1d1f]">
            Don't just find vulnerabilities.{" "}
            <span className="relative inline-block text-accent">
              Prove they're fixed.
              <svg
                className="absolute left-0 -bottom-1 sm:-bottom-2 w-full h-[8px] text-accent fill-none overflow-visible"
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M0 6C30 1 70 1 100 6"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Lead text: 22px, line-height 1.45, secondary color, max 60ch */}
          <p className="text-[20px] sm:text-[22px] leading-[1.45] text-[#6e6e73] max-w-[60ch]">
            PatchProof reproduces the issue, tests your fix and keeps the evidence, on every pull request.
          </p>

          {/* CTAs: Primary 52px high */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2 w-full sm:w-auto">
            <Link
              href="/signup"
              className="w-full sm:w-auto h-[52px] px-8 rounded-[10px] text-[15px] font-semibold bg-accent text-accent-foreground hover:bg-accent-hover transition-colors inline-flex items-center justify-center gap-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Start verifying
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <a
              href="#workflow"
              onClick={handleScrollToWorkflow}
              className="w-full sm:w-auto h-[52px] px-8 rounded-[10px] text-[15px] font-semibold text-[#1d1d1f] bg-white hover:bg-black/[0.02] border border-black/[0.12] transition-colors inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Hero Product Frame: 1280px breakout frame settling in on load */}
        <div
          className="mt-12 sm:mt-16 w-full max-w-[1280px] mx-auto transition-all duration-700 ease-out"
          style={{
            transform: loaded ? "translateY(0) scale(1)" : "translateY(30px) scale(0.97)",
            opacity: loaded ? 1 : 0.85,
          }}
        >
          {/* FindingsScene as the large hero frame */}
          <div className="relative">
            <FindingsScene isHero className="min-h-[420px]" />
            {/* Subtle bottom fade to blend with surface */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#fbfbfd] to-transparent pointer-events-none opacity-40" />
          </div>

          {/* Verification Event Strip (4 chips on a connecting line) */}
          <div className="mt-8 pt-6 border-t border-black/[0.08] flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[13px] font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/[0.08] shadow-sm text-slate-700">
              <span className="w-2 h-2 rounded-full bg-[#f87171]" />
              <span>Finding detected</span>
            </div>
            <span className="text-slate-300 hidden sm:inline">———</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/[0.08] shadow-sm text-[#f87171] font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Exploit reproduced</span>
            </div>
            <span className="text-slate-300 hidden sm:inline">———</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/[0.08] shadow-sm text-[#166534] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Patch verified</span>
            </div>
            <span className="text-slate-300 hidden sm:inline">———</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101e14] border border-[#1a3b22] text-[#4ade80] font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>Safe to merge (for tested cases)</span>
            </div>
          </div>

          {/* Caption */}
          <p className="mt-3 text-center text-[13px] text-[#6e6e73]">
            Illustrative sequence, not a live scan.
          </p>

          {/* One quiet line */}
          <p className="mt-6 text-center text-[15px] font-medium text-[#1d1d1f]">
            Works with Semgrep, OSV, GitHub and Git.
          </p>
        </div>
      </div>
    </section>
  );
}
