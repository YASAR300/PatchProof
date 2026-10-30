"use client";

import React from "react";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileX2,
  HelpCircle,
  RotateCcw,
  ShieldCheck,
  Search,
  Bot,
} from "lucide-react";
import { PatchMatrixScene } from "./scenes";

const STATUS_ITEMS = [
  {
    name: "REPRODUCED",
    icon: ShieldAlert,
    color: "text-[#f87171] bg-[#201214] border-[#3d1a1e]",
    desc: "Exploit payload executed and matched known vulnerability condition.",
  },
  {
    name: "NOT_REPRODUCED",
    icon: CheckCircle2,
    color: "text-[#4ade80] bg-[#101e14] border-[#1a3b22]",
    desc: "Payload executed but failed to trigger exploit behavior in test harness.",
  },
  {
    name: "INCONCLUSIVE",
    icon: HelpCircle,
    color: "text-[#fbbf24] bg-[#21180f] border-[#3d2b17]",
    desc: "Harness completed but lacked decisive signals to confirm exploitability.",
  },
  {
    name: "EXECUTION_ERROR",
    icon: FileX2,
    color: "text-[#a0a0a8] bg-[#161618] border-white/10",
    desc: "Test framework crashed, dependency missing, or runtime environment failed.",
  },
  {
    name: "FIX_VERIFIED",
    icon: CheckCircle2,
    color: "text-[#4ade80] bg-[#101e14] border-[#1a3b22]",
    desc: "Target exploit neutralized on candidate commit and regression tests passed.",
  },
  {
    name: "PATCH_NOT_VERIFIED",
    icon: ShieldAlert,
    color: "text-[#f87171] bg-[#201214] border-[#3d1a1e]",
    desc: "Candidate patch still vulnerable to the reproduction test payload.",
  },
  {
    name: "REGRESSION_FAILURE",
    icon: RotateCcw,
    color: "text-[#fb923c] bg-[#25160d] border-[#422010]",
    desc: "Exploit blocked, but one or more standard unit or integration tests failed.",
  },
];

export function EvidenceSection() {
  return (
    <section
      id="evidence"
      className="py-28 lg:py-36 bg-[#fbfbfd] text-[#1d1d1f] border-t border-black/[0.06] scroll-mt-14 select-none"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-wider text-[#6e6e73] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Verification Semantics
          </div>
          <h2 className="text-[34px] sm:text-[48px] lg:text-[64px] font-semibold tracking-[-0.025em] leading-[1.05] text-[#1d1d1f]">
            Every result shows where it came from.
          </h2>
          <p className="text-[20px] sm:text-[22px] text-[#6e6e73] leading-[1.45] max-w-[60ch]">
            Clear semantic states replace ambiguity with reproducible proof across every pull request.
          </p>
        </div>

        {/* PatchMatrixScene Centerpiece at Full Width */}
        <div className="w-full">
          <PatchMatrixScene className="min-h-[400px]" />
        </div>

        {/* Status Legend as Two-Column List */}
        <div className="p-8 rounded-[16px] bg-[#0b0b0c] text-white border border-white/[0.08] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
            <h3 className="text-[18px] font-semibold text-white">
              Status Definitions
            </h3>
            <span className="text-[13px] text-slate-400 italic">
              Not reproduced does not automatically mean false positive.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {STATUS_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name} className="flex items-start gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-semibold border ${item.color} flex-shrink-0 mt-0.5`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.name}
                  </span>
                  <p className="text-[13px] text-slate-300 leading-snug">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Slim row of three provenance tags */}
        <div className="pt-8 border-t border-black/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-[12px] bg-white border border-black/[0.08] space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-accent">
              <Search className="w-4 h-4" />
              <span className="font-semibold text-[14px]">From the scanner</span>
            </div>
            <p className="text-[13px] text-[#6e6e73] leading-relaxed">
              Rules, AST patterns, and CVE feeds indicating potential risk.
            </p>
          </div>

          <div className="p-5 rounded-[12px] bg-white border border-black/[0.08] space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-[#166534]">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-semibold text-[14px]">Verified by a test</span>
            </div>
            <p className="text-[13px] text-[#6e6e73] leading-relaxed">
              Reproducer code executed in a disposable worker with captured logs.
            </p>
          </div>

          <div className="p-5 rounded-[12px] bg-white border border-black/[0.08] space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-[#9333ea]">
              <Bot className="w-4 h-4" />
              <span className="font-semibold text-[14px]">Written by AI</span>
            </div>
            <p className="text-[13px] text-[#6e6e73] leading-relaxed">
              Synthesized pytest scripts and suggested patches reviewed by an engineer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

