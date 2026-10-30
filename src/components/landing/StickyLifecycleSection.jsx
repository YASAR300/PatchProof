"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Search, Play, CheckCircle2, Activity } from "lucide-react";
import { FindingsScene } from "./scenes/FindingsScene";
import { RunLogScene } from "./scenes/RunLogScene";
import { PatchMatrixScene } from "./scenes/PatchMatrixScene";
import { MonitoringScene } from "./scenes/MonitoringScene";

export function StickyLifecycleSection() {
  const [activeStage, setActiveStage] = useState("detect");
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef(null);

  const stages = [
    { id: "detect", label: "Detection", icon: Search },
    { id: "prove", label: "Reproduction", icon: Play },
    { id: "validate", label: "Patch validation", icon: CheckCircle2 },
    { id: "monitor", label: "Monitoring", icon: Activity },
  ];

  useEffect(() => {
    // 1. Sticky Sentinel Observer
    const sentinelObserver = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (sentinelRef.current) {
      sentinelObserver.observe(sentinelRef.current);
    }

    // 2. Scroll-Spy Stage Observer
    const stageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveStage(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    stages.forEach((stage) => {
      const el = document.getElementById(stage.id);
      if (el) stageObserver.observe(el);
    });

    return () => {
      sentinelObserver.disconnect();
      stageObserver.disconnect();
    };
  }, []);

  const scrollToStage = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="py-24 sm:py-32 bg-white text-text font-sans select-none relative">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-accent">
            Continuous Assurance
          </span>
          <h2 className="text-[36px] sm:text-[44px] font-bold tracking-[-0.025em] leading-[1.15] text-[#0b0b0c]">
            Verification across the whole lifecycle
          </h2>
          <p className="text-[17px] text-text-secondary">
            Integrate verification directly into your developer workflows from local edits to pull requests.
          </p>
        </div>

        {/* Sentinel for sticky calculation */}
        <div ref={sentinelRef} className="h-1 w-full" />

        {/* Sticky Pill Navigation Bar */}
        <div
          className={`sticky top-[72px] z-30 py-3 transition-all ${
            isSticky
              ? "bg-white/95 backdrop-blur-md border-b border-border shadow-xs"
              : "bg-transparent"
          }`}
        >
          <div className="flex items-center justify-center overflow-x-auto no-scrollbar py-1">
            <div className="inline-flex p-1.5 rounded-full bg-[#eef0ff] border border-[#d8dbf8]">
              {stages.map((stage) => {
                const Icon = stage.icon;
                const isSelected = activeStage === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => scrollToStage(stage.id)}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-[13px] sm:text-[14px] font-semibold transition-all whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isSelected
                        ? "bg-white text-accent shadow-xs"
                        : "text-text-secondary hover:text-text"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{stage.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Four Alternating Two-Column Sections */}
        <div className="space-y-28 sm:space-y-36 mt-16">
          {/* Stage 1: Detection (#detect) - Standard: Text 4 cols, Visual 7 cols */}
          <div
            id="detect"
            className="scroll-mt-36 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
          >
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-bold">
                01 • Discovery
              </span>
              <h3 className="text-[28px] sm:text-[34px] font-bold text-[#0b0b0c] leading-tight">
                Scan code and dependencies with multi-engine coverage
              </h3>
              <p className="text-[15px] sm:text-[16px] text-text-secondary leading-relaxed">
                Scan source code, AST hierarchies, and package lockfiles for known CVEs. Ingest existing SARIF and Semgrep JSON output effortlessly to prevent alert silos.
              </p>
              <p className="text-[14px] text-text-tertiary leading-relaxed">
                Findings are initially labeled as <strong className="text-text font-semibold">POTENTIAL</strong> until corroborated by executable test harnesses.
              </p>
              <div className="pt-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent hover:underline"
                >
                  See it in the demo <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="p-3 sm:p-5 rounded-[22px] bg-[#eef0ff] border border-[#d8dbf8]">
                <FindingsScene className="shadow-lg" />
                <div className="mt-2.5 text-center">
                  <span className="text-[11px] font-mono text-text-tertiary">
                    Illustrative, not a live scan.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stage 2: Reproduction (#prove) - REVERSED: Visual 7 cols, Text 4 cols (offset 1) */}
          <div
            id="prove"
            className="scroll-mt-36 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
          >
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="p-3 sm:p-5 rounded-[22px] bg-[#eef0ff] border border-[#d8dbf8]">
                <RunLogScene className="shadow-lg" />
                <div className="mt-2.5 text-center">
                  <span className="text-[11px] font-mono text-text-tertiary">
                    Illustrative, not a live scan.
                  </span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#f87171] font-bold">
                02 • Reproduction
              </span>
              <h3 className="text-[28px] sm:text-[34px] font-bold text-[#0b0b0c] leading-tight">
                Synthesize and execute isolated reproducers
              </h3>
              <p className="text-[15px] sm:text-[16px] text-text-secondary leading-relaxed">
                PatchProof synthesizes targeted test scripts in sandboxed environments to verify whether reported vulnerabilities trigger in real code paths.
              </p>
              <p className="text-[14px] text-text-tertiary leading-relaxed">
                Deterministic statuses include <strong className="text-text font-semibold">REPRODUCED</strong>, <strong className="text-text font-semibold">NOT_REPRODUCED</strong>, <strong className="text-text font-semibold">INCONCLUSIVE</strong>, and <strong className="text-text font-semibold">EXECUTION_ERROR</strong>. Not reproduced does not automatically mean false positive.
              </p>
              <div className="pt-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent hover:underline"
                >
                  See it in the demo <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Stage 3: Patch validation (#validate) - Standard: Text 4 cols, Visual 7 cols */}
          <div
            id="validate"
            className="scroll-mt-36 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
          >
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#16a34a] font-bold">
                03 • Patch Validation
              </span>
              <h3 className="text-[28px] sm:text-[34px] font-bold text-[#0b0b0c] leading-tight">
                Verify candidates against regressions
              </h3>
              <p className="text-[15px] sm:text-[16px] text-text-secondary leading-relaxed">
                Run the same reproducer harness against the proposed patch commit. Ensure the security threat is neutralized while non-regression tests pass cleanly.
              </p>
              <p className="text-[14px] text-text-tertiary leading-relaxed">
                Verdicts include <strong className="text-text font-semibold">FIX_VERIFIED</strong>, <strong className="text-text font-semibold">PATCH_NOT_VERIFIED</strong>, <strong className="text-text font-semibold">REGRESSION_FAILURE</strong>, and <strong className="text-text font-semibold">INCONCLUSIVE</strong>. Fix verified for tested cases.
              </p>
              <div className="pt-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent hover:underline"
                >
                  See it in the demo <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="p-3 sm:p-5 rounded-[22px] bg-[#eef0ff] border border-[#d8dbf8]">
                <PatchMatrixScene className="shadow-lg" />
                <div className="mt-2.5 text-center">
                  <span className="text-[11px] font-mono text-text-tertiary">
                    Illustrative, not a live scan.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stage 4: Monitoring (#monitor) - REVERSED: Visual 7 cols, Text 4 cols */}
          <div
            id="monitor"
            className="scroll-mt-36 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
          >
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="p-3 sm:p-5 rounded-[22px] bg-[#eef0ff] border border-[#d8dbf8]">
                <MonitoringScene className="shadow-lg" />
                <div className="mt-2.5 text-center">
                  <span className="text-[11px] font-mono text-text-tertiary">
                    Illustrative, not a live scan.
                  </span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-bold">
                04 • Continuous Monitoring
              </span>
              <h3 className="text-[28px] sm:text-[34px] font-bold text-[#0b0b0c] leading-tight">
                Pull request checks and regression prevention
              </h3>
              <p className="text-[15px] sm:text-[16px] text-text-secondary leading-relaxed">
                Maintain continuous security posture by monitoring pull requests for regressions. If future commits reintroduce a previously patched vulnerability, checks fail immediately.
              </p>
              <p className="text-[14px] text-text-tertiary leading-relaxed">
                Pull-request checks run only for allow-listed repositories where automated execution permissions have been explicitly granted.
              </p>
              <div className="pt-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent hover:underline"
                >
                  See it in the demo <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

