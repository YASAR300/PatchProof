"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Search,
  Bug,
  ShieldCheck,
  FileCheck2,
  Check,
  X,
  Terminal,
  GitPullRequest,
  Lock,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { cn } from "@/lib/cn";

const ACTS = [
  {
    id: "find",
    step: "01",
    label: "Find",
    title: "Find vulnerabilities with context.",
    description:
      "PatchProof connects to your repositories and open security databases, mapping taint paths, sink invocations, and dependency boundaries with precision.",
  },
  {
    id: "prove",
    step: "02",
    label: "Prove",
    title: "Prove exploitability with controlled tests.",
    description:
      "Alerts aren't proof. PatchProof spins up an ephemeral, hermetic container and automatically generates a minimal reproduction harness to confirm the vulnerability really triggers.",
  },
  {
    id: "fix",
    step: "03",
    label: "Fix",
    title: "Validate the fix without regressions.",
    description:
      "When a patch is proposed, the harness reruns. PatchProof proves that the exploit vector is neutralized while 100% of existing application behavior remains unbroken.",
  },
  {
    id: "evidence",
    step: "04",
    label: "Evidence",
    title: "Generate immutable evidence for PRs.",
    description:
      "Sign off on pull requests with verifiable execution artifacts, complete logs, and automated monitors that guard against regression on future commits.",
  },
];

export function WorkflowSection() {
  const [activeAct, setActiveAct] = useState(0);
  const actRefs = useRef([]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const observers = [];
    actRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveAct(index);
            }
          });
        },
        { threshold: 0.5, rootMargin: "-10% 0px -20% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  return (
    <section id="workflow" className="py-24 sm:py-36 bg-[#fbfbfd] text-[#1d1d1f] border-b border-black/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#0071e3] mb-3 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
            Continuous Verification Workflow
          </div>
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#1d1d1f]">
            Four steps from alert to proof.
          </h2>
          <p className="mt-4 text-lg text-[#86868b] leading-relaxed">
            A deterministic pipeline replacing subjective code triage with reproducible security evidence.
          </p>
        </div>

        {/* Two-Column Sticky Storytelling Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Four Acts */}
          <div className="lg:col-span-5 space-y-24 sm:space-y-36 py-8">
            {ACTS.map((act, index) => {
              const isActive = activeAct === index;
              return (
                <div
                  key={act.id}
                  ref={(el) => (actRefs.current[index] = el)}
                  onClick={() => setActiveAct(index)}
                  className={cn(
                    "cursor-pointer transition-all duration-300 space-y-3 p-4 -ml-4 rounded-2xl",
                    isActive ? "opacity-100 bg-black/[0.02]" : "opacity-35 hover:opacity-70"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-black/5 text-[#1d1d1f]">
                      {act.step}
                    </span>
                    <span className="text-xs font-mono uppercase tracking-widest text-[#86868b]">
                      Act {act.step}: {act.label}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                    {act.title}
                  </h3>

                  <p className="text-sm sm:text-base text-[#86868b] leading-relaxed">
                    {act.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Mockup Panel */}
          <div className="lg:col-span-7 lg:sticky lg:top-28">
            <div
              className="rounded-2xl border border-black/[0.12] bg-[#090a0f] p-1.5 shadow-2xl overflow-hidden"
              data-theme="dark"
            >
              {/* Window Frame Header */}
              <div className="h-9 px-4 bg-[#11131a] rounded-t-xl border-b border-white/[0.08] flex items-center justify-between text-2xs font-mono text-white/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20 inline-block" />
                </div>
                <div className="text-white/60">
                  patchproof://workflow/{ACTS[activeAct].id}
                </div>
                <div className="text-indigo-400 font-semibold uppercase">
                  {ACTS[activeAct].label}
                </div>
              </div>

              {/* Dynamic Content Panel per Act */}
              <div className="p-4 sm:p-6 min-h-[380px] bg-[#0c0e15] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {activeAct === 0 && (
                    <motion.div
                      key="act-find"
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white">
                              CVE-2024-4821
                            </span>
                            <SeverityBadge severity="CRITICAL" size="sm" />
                          </div>
                          <p className="text-2xs text-white/50 font-mono mt-0.5">
                            src/parser/query.js (lines 40-48)
                          </p>
                        </div>
                        <StatusBadge status="UNVERIFIED" size="sm" />
                      </div>

                      <div className="space-y-2">
                        <div className="text-2xs font-mono text-white/40">
                          DETECTED CODE TAINT PATH:
                        </div>
                        <div className="p-3 rounded-lg bg-black/60 border border-white/[0.08] font-mono text-2xs text-white/80 space-y-1">
                          <div className="text-white/40">// Vulnerable prototype assignment</div>
                          <div>function parseQuery(rawQuery) &#123;</div>
                          <div className="text-amber-300">
                            &nbsp;&nbsp;const [k, v] = rawQuery.split('=');
                          </div>
                          <div className="bg-red-500/20 text-red-300 px-1 py-0.5 rounded border border-red-500/30">
                            &nbsp;&nbsp;targetObject[k] = v; // SINK: Pollution vector
                          </div>
                          <div>&nbsp;&nbsp;return targetObject;</div>
                          <div>&#125;</div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-2xs text-white/60 flex items-center justify-between font-mono">
                        <span>Analyzer: Semgrep + AST parser</span>
                        <span className="text-indigo-400">Needs Evidence</span>
                      </div>
                    </motion.div>
                  )}

                  {activeAct === 1 && (
                    <motion.div
                      key="act-prove"
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white">
                              REPRODUCTION HARNESS
                            </span>
                          </div>
                          <p className="text-2xs text-white/50 font-mono mt-0.5">
                            sandbox-vm://node20-isolated
                          </p>
                        </div>
                        <StatusBadge status="REPRODUCED" size="sm" />
                      </div>

                      <div className="space-y-2">
                        <div className="text-2xs font-mono text-white/40">
                          EXECUTION HARNESS TERMINAL LOG:
                        </div>
                        <div className="p-3 rounded-lg bg-black/80 border border-white/[0.08] font-mono text-2xs space-y-1.5 text-white/90">
                          <div className="text-white/50">$ patchproof-harness execute --cve CVE-2024-4821</div>
                          <div className="text-indigo-400">&#9656; Spawning isolated runner sandbox...</div>
                          <div className="text-indigo-400">&#9656; Synthesizing reproduction payload...</div>
                          <div className="text-amber-300">&#9656; Injected: &quot;__proto__.isAdmin=true&quot;</div>
                          <div className="text-red-400 font-semibold bg-red-950/40 p-1 rounded border border-red-800/40">
                            [FAIL] Exploit succeeded: Object.prototype.isAdmin === true
                          </div>
                          <div className="text-2xs text-white/40 pt-1">
                            Deterministic proof captured. Status: REPRODUCED (118ms)
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-2xs text-red-300 flex items-center justify-between font-mono">
                        <span>Reproduced with 100% confidence</span>
                        <span>0% False Positive</span>
                      </div>
                    </motion.div>
                  )}

                  {activeAct === 2 && (
                    <motion.div
                      key="act-fix"
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white">
                              PATCH VALIDATION MATRIX
                            </span>
                          </div>
                          <p className="text-2xs text-white/50 font-mono mt-0.5">
                            PR #184 (commit 7a91bf2)
                          </p>
                        </div>
                        <StatusBadge status="FIX_VERIFIED" size="sm" />
                      </div>

                      {/* Before / After Matrix */}
                      <div className="space-y-2">
                        <div className="text-2xs font-mono text-white/40">
                          VERIFICATION TEST MATRIX:
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-2xs font-mono">
                          <div className="p-3 rounded-lg bg-red-950/20 border border-red-800/30 space-y-1">
                            <div className="text-red-400 font-semibold">BEFORE PATCH</div>
                            <div className="text-white/60">Exploit Test: <span className="text-red-400 font-bold">VULNERABLE</span></div>
                            <div className="text-white/60">Test Suite: 142/142 Pass</div>
                          </div>

                          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30 space-y-1">
                            <div className="text-emerald-400 font-semibold">AFTER PATCH</div>
                            <div className="text-white/60">Exploit Test: <span className="text-emerald-400 font-bold">NEUTRALIZED</span></div>
                            <div className="text-white/60">Test Suite: 142/142 Pass</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-2xs text-emerald-300 space-y-1 font-mono">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Check className="w-3.5 h-3.5" />
                          <span>REGRESSION VERIFICATION PASSED</span>
                        </div>
                        <div className="text-white/60">
                          Zero regression failures detected across all 142 baseline integration tests.
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeAct === 3 && (
                    <motion.div
                      key="act-evidence"
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white">
                              EVIDENCE REPORT ARTIFACT
                            </span>
                          </div>
                          <p className="text-2xs text-white/50 font-mono mt-0.5">
                            artifact-id: pr184-cve2024-4821
                          </p>
                        </div>
                        <StatusBadge status="FIX_VERIFIED" size="sm" />
                      </div>

                      <div className="p-3 rounded-lg bg-black/60 border border-white/[0.08] font-mono text-2xs space-y-2 text-white/80">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                          <span className="text-white/40">EVIDENCE HASH</span>
                          <span className="text-indigo-300">sha256:7b92...d81a</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                          <span className="text-white/40">GITHUB STATUS CHECK</span>
                          <span className="text-emerald-400 font-semibold">patchproof/verify: PASSED</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                          <span className="text-white/40">REGRESSION GUARD</span>
                          <span className="text-emerald-400 font-semibold">Active for all future PRs</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/40">MERGE RECOMMENDATION</span>
                          <span className="text-white font-bold">APPROVED TO MERGE</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-2xs text-indigo-200 flex items-center justify-between font-mono">
                        <div className="flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Tamper-evident verification log</span>
                        </div>
                        <span className="text-white/40">Attached to PR #184</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Progress bar across acts */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-2xs font-mono text-white/40">
                  <div className="flex items-center gap-2">
                    {ACTS.map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "w-6 h-1 rounded-full transition-colors",
                          i === activeAct ? "bg-indigo-500" : "bg-white/10"
                        )}
                      />
                    ))}
                  </div>
                  <span>Act {activeAct + 1} of 4</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
