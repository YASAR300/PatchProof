"use client";

import React from "react";
import { AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

export function TheGapSection() {
  return (
    <section
      id="gap"
      className="py-28 lg:py-36 bg-[#0b0b0c] text-white border-t border-white/[0.08] scroll-mt-14 select-none"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-20">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            The Verification Gap
          </div>
          <h2 className="text-[44px] sm:text-[56px] lg:text-[72px] font-semibold tracking-[-0.03em] leading-[1.0] text-white">
            Alerts are not evidence.
          </h2>
          <p className="text-[20px] sm:text-[22px] text-slate-400 leading-[1.45] max-w-[60ch]">
            Static scanners predict theoretical risk. PatchProof executes real tests to establish truth before code merges.
          </p>
        </div>

        {/* Two-panel comparison (Muted scanner vs High-contrast PatchProof) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left half: A scanner says (5 cols) */}
          <div className="lg:col-span-5 p-8 rounded-[16px] bg-[#111113] border border-white/[0.08] flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <span className="text-[14px] font-semibold text-slate-400">A scanner says</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-medium border border-dashed border-[#fbbf24]/50 text-[#fbbf24] bg-[#21180f]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Potential
                </span>
              </div>
              <div className="p-4 rounded-[10px] bg-[#0b0b0c] border border-white/[0.06] space-y-2">
                <p className="text-[16px] font-semibold text-slate-200">
                  Possible SQL injection, users.py line 42
                </p>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  AST match for unsanitized string formatting in database handler. Reachability and exploit path unconfirmed.
                </p>
              </div>
            </div>
            <div className="text-[13px] font-mono text-slate-400">
              Outcome: Hours wasted triaging theoretical alerts.
            </div>
          </div>

          {/* Right half: PatchProof shows (7 cols) */}
          <div className="lg:col-span-7 p-8 rounded-[16px] bg-[#141721] border border-white/[0.12] flex flex-col justify-between space-y-8 shadow-xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <span className="text-[14px] font-semibold text-white">PatchProof shows</span>
                <span className="text-slate-400 font-mono text-[12px]">Harness: Container exp-9421</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-[10px] bg-[#201214] border border-[#3d1a1e] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-[6px] bg-[#3d1a1e] text-[#f87171]">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[20px] sm:text-[24px] font-semibold text-white tracking-tight">
                        Exploit reproduced on a1b2c3d
                      </p>
                      <p className="text-[13px] font-mono text-[#f87171]">
                        Payload execution confirmed: Status 200 leak
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-[#3d1a1e] text-[#f87171]">
                    REPRODUCED
                  </span>
                </div>

                <div className="p-4 rounded-[10px] bg-[#101e14] border border-[#1a3b22] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-[6px] bg-[#1a3b22] text-[#4ade80]">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[20px] sm:text-[24px] font-semibold text-white tracking-tight">
                        Fix verified for tested cases
                      </p>
                      <p className="text-[13px] font-mono text-[#4ade80]">
                        Commit 3e9f1a0: 142/142 regression tests pass
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-[#1a3b22] text-[#4ade80]">
                    FIX_VERIFIED
                  </span>
                </div>
              </div>
            </div>
            <div className="text-[13px] font-mono text-[#4ade80]">
              Outcome: Provable evidence recorded directly into git.
            </div>
          </div>
        </div>

        {/* Three large numerals in one row */}
        <div className="pt-12 border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
          <div className="space-y-2">
            <span className="font-mono text-[36px] sm:text-[44px] font-bold text-slate-400">01</span>
            <p className="text-[19px] sm:text-[20px] font-medium leading-[1.4] text-slate-200">
              Findings are not always exploitable.
            </p>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-[36px] sm:text-[44px] font-bold text-slate-400">02</span>
            <p className="text-[19px] sm:text-[20px] font-medium leading-[1.4] text-slate-200">
              Fixes are rarely proven.
            </p>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-[36px] sm:text-[44px] font-bold text-slate-400">03</span>
            <p className="text-[19px] sm:text-[20px] font-medium leading-[1.4] text-slate-200">
              Fixed bugs quietly come back.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
