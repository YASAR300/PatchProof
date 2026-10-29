"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Bug,
  Terminal,
  Search,
  CheckCircle2,
  GitPullRequest,
  Check,
  Flame,
  Layers,
  ChevronRight,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SeverityBadge } from "@/components/ui/SeverityBadge";

export function Hero() {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollY } = useScroll();
  // Slight perspective tilt that flattens as the user scrolls
  const rotateX = useTransform(scrollY, [0, 500], [8, 0]);
  const scale = useTransform(scrollY, [0, 500], [0.96, 1]);

  const handleScrollToWorkflow = (e) => {
    e.preventDefault();
    const target = document.getElementById("workflow");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden bg-white text-[#1d1d1f]"
    >
      {/* Background radial gradient glow (soft Apple-inspired) */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center -z-10"
        aria-hidden="true"
      >
        <div className="w-[800px] h-[450px] bg-gradient-to-tr from-blue-100/60 via-indigo-50/40 to-transparent blur-3xl rounded-full opacity-70" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Copy */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-[#1d1d1f] bg-black/[0.04] border border-black/[0.08] shadow-sm select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
            <span>Evidence-first security verification</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[80px] font-semibold tracking-[-0.035em] leading-[1.04] text-[#1d1d1f]">
            Don't just find vulnerabilities.{" "}
            <span className="bg-gradient-to-r from-[#0071e3] via-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
              Prove they're fixed.
            </span>
          </h1>

          {/* Subheadline: At most two lines */}
          <p className="text-lg sm:text-xl text-[#86868b] max-w-2xl font-normal leading-relaxed tracking-tight">
            PatchProof finds issues, reproduces them, verifies fixes and watches every pull request.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm transition-all active:scale-95"
            >
              <span>Start verifying</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#workflow"
              onClick={handleScrollToWorkflow}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-[#1d1d1f] hover:bg-black/5 border border-black/10 transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Dashboard Mockup in Window Frame with Perspective Tilt */}
        <div className="relative mt-14 sm:mt-20 [perspective:1200px]">
          {/* Floating Chip 1: REPRODUCED on a1b2c3d */}
          <motion.div
            animate={shouldReduceMotion ? {} : { y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-5 left-4 sm:-top-7 sm:left-10 z-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-red-200/80 shadow-lg text-xs font-mono text-red-600 select-none">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-semibold uppercase tracking-wider">REPRODUCED</span>
              <span className="text-black/40">on</span>
              <span className="text-[#1d1d1f] font-semibold">a1b2c3d</span>
            </div>
          </motion.div>

          {/* Floating Chip 2: FIX_VERIFIED for tested cases */}
          <motion.div
            animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-5 right-4 sm:-bottom-7 sm:right-10 z-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-200/80 shadow-lg text-xs font-mono text-emerald-600 select-none">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-semibold uppercase tracking-wider">FIX_VERIFIED</span>
              <span className="text-black/50 font-sans">for tested cases</span>
            </div>
          </motion.div>

          {/* Window Container */}
          <motion.div
            style={shouldReduceMotion ? {} : { rotateX, scale }}
            className="rounded-2xl border border-black/[0.12] bg-[#090a0f] shadow-[0_25px_70px_rgba(0,0,0,0.22)] overflow-hidden transition-transform duration-100"
            data-theme="dark"
          >
            {/* macOS-style Window Title Bar */}
            <div className="h-10 px-4 bg-[#11131a] border-b border-white/[0.08] flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]/90 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]/90 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]/90 inline-block" />
              </div>
              <div className="flex items-center gap-2 text-2xs font-mono text-white/40">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>patchproof / verification / run-9421</span>
              </div>
              <div className="w-12 text-right">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Connected" />
              </div>
            </div>

            {/* Dashboard Inner Body: Dark Linear-style UI */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px] text-xs font-sans text-white/90">
              {/* Left Sidebar */}
              <div className="hidden md:flex md:col-span-3 flex-col border-r border-white/[0.08] bg-[#0c0e14] p-3 space-y-4">
                <div className="space-y-1">
                  <div className="text-2xs font-mono uppercase tracking-wider text-white/40 px-2.5 py-1">
                    Workspace
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/[0.06] text-white font-medium">
                    <span className="w-2 h-2 rounded bg-indigo-500" />
                    <span className="truncate">org-security / core-api</span>
                  </div>
                </div>

                <div className="space-y-1 flex-1">
                  <div className="text-2xs font-mono uppercase tracking-wider text-white/40 px-2.5 py-1">
                    Verification
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-indigo-500/15 text-indigo-300 font-medium">
                    <div className="flex items-center gap-2">
                      <Bug className="w-3.5 h-3.5" />
                      <span>Findings</span>
                    </div>
                    <span className="text-2xs bg-indigo-500/30 px-1.5 py-0.2 rounded font-mono">
                      4
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Harness Runs</span>
                  </div>

                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors">
                    <GitPullRequest className="w-3.5 h-3.5" />
                    <span>PR Monitor</span>
                  </div>
                </div>

                {/* Footer status */}
                <div className="pt-3 border-t border-white/[0.08] text-2xs text-white/40 px-2 font-mono flex items-center justify-between">
                  <span>Harness: Isolated VM</span>
                  <span className="text-emerald-400">READY</span>
                </div>
              </div>

              {/* Center Findings List */}
              <div className="col-span-12 md:col-span-4 border-r border-white/[0.08] bg-[#090a0f] flex flex-col">
                <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
                  <div className="text-xs font-semibold text-white/80">Active Queue (4)</div>
                  <div className="text-2xs font-mono text-white/40">Sort: Severity</div>
                </div>

                <div className="divide-y divide-white/[0.06] overflow-y-auto">
                  {/* Item 1 (Selected) */}
                  <div className="p-3 bg-white/[0.04] border-l-2 border-indigo-500 space-y-1.5 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xs text-indigo-300 font-semibold">
                        CVE-2024-4821
                      </span>
                      <SeverityBadge severity="CRITICAL" size="sm" />
                    </div>
                    <p className="text-xs font-medium text-white line-clamp-1">
                      Prototype pollution in query parser
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <StatusBadge status="FIX_VERIFIED" size="sm" />
                      <span className="text-2xs font-mono text-white/40">142ms</span>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="p-3 hover:bg-white/[0.02] space-y-1.5 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xs text-white/70">GHSA-793x-m3m1</span>
                      <SeverityBadge severity="HIGH" size="sm" />
                    </div>
                    <p className="text-xs font-medium text-white/80 line-clamp-1">
                      Path Traversal in archive extract
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <StatusBadge status="REPRODUCED" size="sm" />
                      <span className="text-2xs font-mono text-white/40">88ms</span>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="p-3 hover:bg-white/[0.02] space-y-1.5 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xs text-white/70">SEC-2024-102</span>
                      <SeverityBadge severity="MEDIUM" size="sm" />
                    </div>
                    <p className="text-xs font-medium text-white/80 line-clamp-1">
                      Unsanitized wildcard parameter in query
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <StatusBadge status="NOT_REPRODUCED" size="sm" />
                      <span className="text-2xs font-mono text-white/40">210ms</span>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="p-3 hover:bg-white/[0.02] space-y-1.5 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xs text-white/70">CVE-2024-3198</span>
                      <SeverityBadge severity="LOW" size="sm" />
                    </div>
                    <p className="text-xs font-medium text-white/80 line-clamp-1">
                      ReDoS in markdown table parser
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <StatusBadge status="UNVERIFIED" size="sm" />
                      <span className="text-2xs font-mono text-white/40">Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Selected Finding Detail Panel */}
              <div className="col-span-12 md:col-span-5 bg-[#0e1017] p-4 sm:p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">CVE-2024-4821</span>
                        <SeverityBadge severity="CRITICAL" size="sm" />
                      </div>
                      <div className="text-2xs text-white/50 font-mono mt-0.5">
                        src/utils/query-parser.js:42
                      </div>
                    </div>
                    <StatusBadge status="FIX_VERIFIED" size="sm" />
                  </div>

                  {/* Verification Evidence Log */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-2xs font-mono text-white/50">
                      <span>AUTOMATED REPRODUCTION & VERIFICATION</span>
                      <span className="text-emerald-400">PASSED</span>
                    </div>

                    <div className="p-3 rounded-lg bg-black/60 border border-white/[0.08] font-mono text-2xs space-y-1.5">
                      <div className="text-white/60">
                        <span className="text-indigo-400 font-semibold">[test-runner]</span> Spawning isolated container runner...
                      </div>
                      <div className="text-red-400">
                        <span className="text-red-500 font-semibold">[unpatched]</span> Exploit payload succeeded: Object.__proto__ polluted
                      </div>
                      <div className="text-emerald-400">
                        <span className="text-emerald-500 font-semibold">[patched]</span> Exploit payload blocked: TypeError: Object is frozen
                      </div>
                      <div className="text-white/60 pt-1 border-t border-white/10 flex items-center justify-between">
                        <span>Regression test suite:</span>
                        <span className="text-emerald-400 font-semibold">142/142 passed</span>
                      </div>
                    </div>
                  </div>

                  {/* Patch Validation Matrix Preview */}
                  <div className="grid grid-cols-2 gap-2 text-2xs font-mono">
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-1">
                      <div className="text-white/40">EXPLOIT TEST</div>
                      <div className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>NEUTRALIZED</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-1">
                      <div className="text-white/40">SIDE-EFFECT REGRESSION</div>
                      <div className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>ZERO FAILURES</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidence Footer */}
                <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-2xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-indigo-200 font-mono">Verdict: SAFE TO MERGE</span>
                  </div>
                  <span className="text-white/40 font-mono">PR #184</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
