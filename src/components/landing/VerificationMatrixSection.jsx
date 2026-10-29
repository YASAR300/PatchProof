"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Check, X, AlertTriangle, ShieldCheck, HelpCircle, AlertOctagon } from "lucide-react";

export function VerificationMatrixSection() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <section id="evidence" className="py-24 sm:py-36 bg-[#ffffff] text-[#1d1d1f] border-b border-black/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-600 mb-3 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Deterministic Verification Matrix
          </div>
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#1d1d1f]">
            The truth table of security.
          </h2>
          <p className="mt-4 text-lg text-[#86868b] leading-relaxed">
            PatchProof replaces guesses with a strict before-and-after matrix across both the exploit reproducer and your standard integration suite.
          </p>
        </div>

        {/* Large Animated Verification Table */}
        <div className="rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-4 sm:p-8 shadow-sm overflow-x-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="min-w-[600px]"
          >
            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-black/[0.08] text-xs font-mono uppercase text-[#86868b]">
              <div className="col-span-4 font-semibold text-[#1d1d1f]">Verification Dimension</div>
              <div className="col-span-4 font-semibold text-rose-600">Vulnerable Version</div>
              <div className="col-span-4 font-semibold text-emerald-600">Candidate Patch</div>
            </div>

            {/* Row 1: Security reproducer */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-12 gap-4 py-5 border-b border-black/[0.06] items-center"
            >
              <div className="col-span-4">
                <div className="text-sm font-semibold text-[#1d1d1f]">Security reproducer</div>
                <div className="text-2xs text-[#86868b]">Controlled exploit test execution</div>
              </div>
              <div className="col-span-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200/80 text-xs font-mono text-rose-700">
                  <X className="w-4 h-4 text-rose-500" />
                  <span className="font-semibold">EXPLOIT SUCCEEDS</span>
                </div>
              </div>
              <div className="col-span-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs font-mono text-emerald-700">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold">BLOCKED / NEUTRALIZED</span>
                </div>
              </div>
            </motion.div>

            {/* Row 2: Normal functionality */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-12 gap-4 py-5 border-b border-black/[0.06] items-center"
            >
              <div className="col-span-4">
                <div className="text-sm font-semibold text-[#1d1d1f]">Normal functionality</div>
                <div className="text-2xs text-[#86868b]">Application test suite & integration</div>
              </div>
              <div className="col-span-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs font-mono text-emerald-700">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>142/142 tests passing</span>
                </div>
              </div>
              <div className="col-span-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs font-mono text-emerald-700">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>142/142 tests passing</span>
                </div>
              </div>
            </motion.div>

            {/* Row 3: Result */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-12 gap-4 py-5 items-center bg-black/[0.02] rounded-xl px-2"
            >
              <div className="col-span-4">
                <div className="text-sm font-bold text-[#1d1d1f]">Result</div>
                <div className="text-2xs text-[#86868b]">Evidence-backed verdict</div>
              </div>
              <div className="col-span-4">
                <StatusBadge status="REPRODUCED" size="md" />
              </div>
              <div className="col-span-4">
                <StatusBadge status="FIX_VERIFIED" size="md" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Status Explainer */}
        <div className="mt-12 space-y-8">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
              Reproduction Statuses & Meanings
            </h3>
            <p className="text-sm font-medium text-[#1d1d1f]">
              Not reproduced does not automatically mean false positive.
            </p>
            <p className="text-xs text-[#86868b] max-w-2xl">
              A vulnerability may require specific runtime preconditions, environment variables, or private network topology that the automated reproducer could not assemble.
            </p>
          </div>

          {/* 4 Statuses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-black/[0.08] bg-[#fbfbfd] space-y-2">
              <StatusBadge status="REPRODUCED" size="sm" />
              <p className="text-xs text-[#86868b] leading-relaxed">
                Vulnerability triggers deterministically under controlled exploit test.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-black/[0.08] bg-[#fbfbfd] space-y-2">
              <StatusBadge status="NOT_REPRODUCED" size="sm" />
              <p className="text-xs text-[#86868b] leading-relaxed">
                Exploit payload failed to execute or could not trigger the reported flaw.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-black/[0.08] bg-[#fbfbfd] space-y-2">
              <StatusBadge status="INCONCLUSIVE" size="sm" />
              <p className="text-xs text-[#86868b] leading-relaxed">
                Output was ambiguous, test flaked, or execution produced indeterminate results.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-black/[0.08] bg-[#fbfbfd] space-y-2">
              <StatusBadge status="EXECUTION_ERROR" size="sm" />
              <p className="text-xs text-[#86868b] leading-relaxed">
                Test harness, container runner, or runtime environment failed to complete.
              </p>
            </div>
          </div>

          {/* Patch Verdict Chips */}
          <div className="pt-4 border-t border-black/[0.08] flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#86868b]">
              Patch Verdicts:
            </span>
            <StatusBadge status="FIX_VERIFIED" size="sm" />
            <StatusBadge status="PATCH_NOT_VERIFIED" size="sm" />
            <StatusBadge status="REGRESSION_FAILURE" size="sm" />
          </div>
        </div>
      </div>
    </section>
  );
}
