"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Search,
  Bug,
  ShieldCheck,
  Bot,
  Package,
  Activity,
  FileCheck2,
  Terminal,
  CheckCircle2,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/cn";

export function FeaturesBentoGrid() {
  const shouldReduceMotion = useReducedMotion();

  const cardVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0.2, y: shouldReduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section id="product" className="py-24 sm:py-36 bg-[#ffffff] text-[#1d1d1f] border-b border-black/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#0071e3] mb-3 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
            Evidence-First Capabilities
          </div>
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#1d1d1f]">
            One workflow from alert to evidence.
          </h2>
          <p className="mt-4 text-lg text-[#86868b] leading-relaxed">
            Seven unified systems that transform ambiguous scanner warnings into deterministic, verifiable security proof.
          </p>
        </div>

        {/* Bento Grid: 7 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          {/* Card 1: Repository Security Scanner (span 7) */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-7 rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-[#0071e3] mb-5">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f] mb-2">
                Repository Security Scanner
              </h3>
              <p className="text-sm text-[#86868b] leading-relaxed max-w-xl">
                Continuously inspects codebases, monorepos, and lockfiles to locate potential vulnerability vectors.
              </p>
            </div>

            {/* Visual */}
            <div className="mt-6 p-4 rounded-xl bg-white border border-black/[0.06] shadow-sm font-mono text-2xs space-y-2">
              <div className="flex items-center justify-between text-[#86868b] pb-2 border-b border-black/[0.04]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
                  <span>scanner://semgrep-ast</span>
                </div>
                <span>4,120 files scanned</span>
              </div>
              <div className="flex items-center justify-between text-[#1d1d1f]">
                <span>Taint path: req.query &rarr; execSync()</span>
                <span className="text-rose-500 font-semibold">CWE-78</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Automated Vulnerability Verification (span 5) */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-5 rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600 mb-5">
                <Bug className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f] mb-2">
                Automated Vulnerability Verification
              </h3>
              <p className="text-sm text-[#86868b] leading-relaxed">
                Synthesizes isolated reproducers to confirm whether reported flaws can actually be exploited.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-white border border-black/[0.06] shadow-sm font-mono text-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-rose-600 font-semibold">[sandbox-run]</span>
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-bold border border-rose-200">REPRODUCED</span>
              </div>
              <div className="text-[#86868b]">Exploit executed deterministically (98ms)</div>
            </div>
          </motion.div>

          {/* Card 3: Patch Validation (span 4) */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-4 rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 mb-5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-[#1d1d1f] mb-2">
                Patch Validation
              </h3>
              <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed">
                Tests proposed pull request fixes against the reproduction suite to confirm the vector is neutralized.
              </p>
            </div>

            <div className="mt-6 p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-sm font-mono text-2xs flex items-center justify-between text-emerald-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-semibold">FIX_VERIFIED</span>
              </div>
              <span className="text-[#86868b]">0 regressions</span>
            </div>
          </motion.div>

          {/* Card 4: AI Security Assistant (span 4) */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-4 rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600 mb-5">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-[#1d1d1f] mb-2">
                AI Security Assistant
              </h3>
              <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed">
                Generates targeted regression test harnesses and explains reproduction steps with full source provenance.
              </p>
            </div>

            <div className="mt-6 p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-sm font-mono text-2xs space-y-1">
              <div className="text-indigo-600 font-semibold">assistant.generateTest()</div>
              <div className="text-[#86868b]">Synthesized repro test in 1.4s</div>
            </div>
          </motion.div>

          {/* Card 5: Dependency Intelligence (span 4) */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-4 rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 mb-5">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-[#1d1d1f] mb-2">
                Dependency Intelligence
              </h3>
              <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed">
                Correlates package advisories with actual call graphs to distinguish real risks from unused dependencies.
              </p>
            </div>

            <div className="mt-6 p-3.5 rounded-xl bg-white border border-black/[0.06] shadow-sm font-mono text-2xs flex items-center justify-between">
              <span className="text-[#1d1d1f]">Call Graph Reachable:</span>
              <span className="text-amber-600 font-semibold">NO (Safe)</span>
            </div>
          </motion.div>

          {/* Card 6: Continuous Security Monitoring (span 6) */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-6 rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200/60 flex items-center justify-center text-cyan-600 mb-5">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-[#1d1d1f] mb-2">
                Continuous Security Monitoring
              </h3>
              <p className="text-sm text-[#86868b] leading-relaxed">
                Monitors every branch and pull request to ensure previously patched vulnerabilities never regress.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-white border border-black/[0.06] shadow-sm font-mono text-2xs space-y-2">
              <div className="flex items-center justify-between text-[#1d1d1f]">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-3.5 h-3.5 text-[#0071e3]" />
                  <span>main branch &bull; PR #184</span>
                </div>
                <span className="text-emerald-600 font-semibold">GUARD ACTIVE</span>
              </div>
              <div className="text-[#86868b]">Regression suite verified against 142 historical proofs</div>
            </div>
          </motion.div>

          {/* Card 7: Security Evidence Dashboard (span 6) */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-6 rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600 mb-5">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-[#1d1d1f] mb-2">
                Security Evidence Dashboard
              </h3>
              <p className="text-sm text-[#86868b] leading-relaxed">
                Provides cryptographically signed verification logs and status badges for seamless compliance and PR signoff.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-white border border-black/[0.06] shadow-sm font-mono text-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#1d1d1f]">Artifact Hash:</span>
                <span className="text-purple-600 font-semibold">sha256:4f8e...7a1b</span>
              </div>
              <div className="text-[#86868b]">Immutable proof bundle generated for audit retention</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
