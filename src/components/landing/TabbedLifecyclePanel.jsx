"use client";

import React, { useState, useRef } from "react";
import { Search, Play, CheckCircle2 } from "lucide-react";
import { FindingsScene } from "./scenes/FindingsScene";
import { RunLogScene } from "./scenes/RunLogScene";
import { PatchMatrixScene } from "./scenes/PatchMatrixScene";

export function TabbedLifecyclePanel() {
  const [activeTab, setActiveTab] = useState("find");
  const tabRefs = useRef({});

  const tabs = [
    { id: "find", label: "1. Find", icon: Search },
    { id: "prove", label: "2. Prove", icon: Play },
    { id: "fix", label: "3. Fix", icon: CheckCircle2 },
  ];

  const handleKeyDown = (e, index) => {
    let newIndex = index;
    if (e.key === "ArrowRight") {
      newIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      newIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      newIndex = 0;
    } else if (e.key === "End") {
      newIndex = tabs.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    const nextTab = tabs[newIndex].id;
    setActiveTab(nextTab);
    tabRefs.current[nextTab]?.focus();
  };

  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-[#eef0ff] to-[#fbfbfd] border-t border-[#d8dbf8] text-text font-sans select-none">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-accent">
            Interactive Verification Flow
          </span>
          <h2 className="text-[36px] sm:text-[44px] font-bold tracking-[-0.025em] leading-[1.15] text-[#0b0b0c]">
            From alert to evidence, end to end
          </h2>
          <p className="text-[17px] text-text-secondary">
            Experience how speculative security alerts are systematically verified into reproducible evidence.
          </p>
        </div>

        {/* White Rounded Panel */}
        <div className="rounded-[24px] bg-white border border-[#d8dbf8] p-6 sm:p-10 shadow-xl space-y-8">
          {/* Centered Pill Tabs */}
          <div className="flex justify-center">
            <div
              role="tablist"
              aria-label="Verification lifecycle stages"
              className="inline-flex p-1.5 rounded-full bg-[#eef0ff] border border-[#d8dbf8]"
            >
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    ref={(el) => (tabRefs.current[tab.id] = el)}
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-controls={`panel-${tab.id}`}
                    aria-selected={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isSelected
                        ? "bg-white text-accent shadow-sm"
                        : "text-text-secondary hover:text-text"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Panel Content: 2 Columns */}
          <div className="pt-4">
            {/* Panel 1: Find */}
            <div
              role="tabpanel"
              id="panel-find"
              aria-labelledby="tab-find"
              hidden={activeTab !== "find"}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                activeTab === "find" ? "block" : "hidden"
              }`}
            >
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-bold">
                  Step 1 • Discovery & Triage
                </span>
                <h3 className="text-[26px] sm:text-[30px] font-bold text-[#0b0b0c] leading-snug">
                  Automated scanning and SARIF ingestion
                </h3>
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  Run targeted SAST AST rules on git commits, parse third-party SARIF reports, and inspect open-source lockfiles for unverified dependency vulnerabilities.
                </p>
                <div className="pt-2 font-mono text-[12px] text-text-tertiary">
                  * Findings remain labeled as "POTENTIAL" until substantiated by a reproducer.
                </div>
              </div>
              <div className="lg:col-span-7">
                <FindingsScene className="shadow-lg" />
              </div>
            </div>

            {/* Panel 2: Prove */}
            <div
              role="tabpanel"
              id="panel-prove"
              aria-labelledby="tab-prove"
              hidden={activeTab !== "prove"}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                activeTab === "prove" ? "block" : "hidden"
              }`}
            >
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#f87171] font-bold">
                  Step 2 • Active Reproduction
                </span>
                <h3 className="text-[26px] sm:text-[30px] font-bold text-[#0b0b0c] leading-snug">
                  Controlled tests in isolated workers
                </h3>
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  Execute deterministic reproducer scripts inside dedicated worker micro-VMs without external network access. If the exploit succeeds, PatchProof logs the trace and marks it REPRODUCED.
                </p>
                <div className="pt-2 font-mono text-[12px] text-text-tertiary">
                  * Not reproduced does not automatically mean false positive.
                </div>
              </div>
              <div className="lg:col-span-7">
                <RunLogScene className="shadow-lg" />
              </div>
            </div>

            {/* Panel 3: Fix */}
            <div
              role="tabpanel"
              id="panel-fix"
              aria-labelledby="tab-fix"
              hidden={activeTab !== "fix"}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                activeTab === "fix" ? "block" : "hidden"
              }`}
            >
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#16a34a] font-bold">
                  Step 3 • Patch Verification
                </span>
                <h3 className="text-[26px] sm:text-[30px] font-bold text-[#0b0b0c] leading-snug">
                  Baseline vs candidate comparison
                </h3>
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  Re-run the exact reproducer suite against your proposed fix commit. Ensure the vulnerability is neutralized while all baseline regression tests pass without unexpected side effects.
                </p>
                <div className="pt-2 font-mono text-[12px] text-[#16a34a] font-semibold">
                  * Safe to merge for tested cases.
                </div>
              </div>
              <div className="lg:col-span-7">
                <PatchMatrixScene className="shadow-lg" />
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <span className="text-[11px] font-mono text-text-tertiary">
              Illustrative, not a live scan.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

