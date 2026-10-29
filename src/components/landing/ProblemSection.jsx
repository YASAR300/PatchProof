"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ShieldX, RotateCcw } from "lucide-react";

const STATEMENTS = [
  {
    number: "01",
    title: "Scanner findings are not always exploitable.",
    description:
      "Static code analyzers flag unreachable paths, theoretical patterns, and benign internal dependencies. Engineering teams waste hundreds of hours triaging security noise without knowing whether an attacker could ever execute the code.",
    icon: AlertTriangle,
    accent: "text-amber-500",
  },
  {
    number: "02",
    title: "Fixes are rarely proven.",
    description:
      "A developer patches a function, tests pass, and code gets reviewed. But nobody ever runs a controlled exploit test against the patched codebase to deterministically verify that the exploit vector is actually closed.",
    icon: ShieldX,
    accent: "text-rose-500",
  },
  {
    number: "03",
    title: "Fixed bugs quietly come back.",
    description:
      "Without an automated, persistent regression test tied to every pull request, subsequent refactors and library upgrades quietly undo the security fix. Yesterday's patched vulnerability returns as today's breach.",
    icon: RotateCcw,
    accent: "text-orange-500",
  },
];

export function ProblemSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-24 sm:py-36 bg-[#ffffff] text-[#1d1d1f] border-b border-black/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-rose-600 mb-3 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            The Verification Gap
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#1d1d1f]">
            Alerts are not evidence.
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-[#86868b] leading-relaxed">
            Legacy application security focuses on discovery alerts. PatchProof delivers proof.
          </p>
        </div>

        {/* Three Large Scroll-Revealed Statements */}
        <div className="space-y-12 sm:space-y-16">
          {STATEMENTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.number}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0.15, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.35 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 pb-12 sm:pb-16 border-b border-black/[0.08] last:border-b-0"
              >
                <div className="lg:col-span-3 flex items-start gap-4">
                  <span className="font-mono text-2xl sm:text-3xl font-semibold text-black/25">
                    {item.number}
                  </span>
                  <div className="p-2 rounded-xl bg-black/[0.03] border border-black/[0.06]">
                    <Icon className={`w-5 h-5 ${item.accent}`} />
                  </div>
                </div>

                <div className="lg:col-span-9 space-y-3">
                  <h3 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
                    {item.title}
                  </h3>
                  <p className="text-base sm:text-lg text-[#86868b] leading-relaxed max-w-3xl">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
