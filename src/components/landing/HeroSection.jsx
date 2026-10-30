"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, CheckCircle2, ShieldAlert } from "lucide-react";
import { FindingsScene } from "./scenes/FindingsScene";
import { RunLogScene } from "./scenes/RunLogScene";
import { PatchMatrixScene } from "./scenes/PatchMatrixScene";

export function HeroSection() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      router.push(`/signup?email=${encodeURIComponent(email.trim())}`);
    }
  };

  return (
    <section className="pt-16 pb-24 sm:pt-24 sm:pb-32 bg-[#fbfbfd] text-text font-sans select-none overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Top Header & Copy */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
          {/* H1 in Two Weights */}
          <h1 className="text-[44px] sm:text-[64px] lg:text-[72px] font-normal tracking-[-0.035em] leading-[1.05] text-[#0b0b0c]">
            Don't just find vulnerabilities.<br />
            <strong className="font-bold text-[#0b0b0c] relative inline-block">
              Prove they're fixed.
              <span className="absolute bottom-1 left-0 w-full h-[4px] bg-accent rounded-full" />
            </strong>
          </h1>

          {/* Subheadline */}
          <p className="text-[18px] sm:text-[21px] text-text-secondary leading-[1.45] max-w-[62ch]">
            PatchProof reproduces the issue, tests your fix and keeps the evidence, on every pull request.
          </p>

          {/* Inline Joined Email Pill CTA */}
          <div className="flex flex-col items-center gap-3 w-full max-w-md pt-2">
            <form
              onSubmit={handleSubmit}
              className="flex items-center w-full h-14 p-1.5 rounded-full bg-white border border-[#d8dbf8] shadow-md focus-within:ring-2 focus-within:ring-accent focus-within:border-accent transition-all"
            >
              <input
                type="email"
                placeholder="Enter your work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Work email address"
                className="flex-1 h-full px-5 rounded-full bg-transparent text-[15px] text-[#0b0b0c] placeholder:text-text-tertiary focus:outline-none"
              />
              <button
                type="submit"
                className="h-11 px-6 rounded-full text-[14px] font-semibold bg-accent hover:bg-accent-hover text-white shadow-xs transition-colors whitespace-nowrap"
              >
                Start verifying
              </button>
            </form>

            <a
              href="#workflow"
              className="text-[14px] font-semibold text-accent hover:underline flex items-center gap-1.5 transition-colors pt-1"
            >
              See how it works <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Large Composite Product Illustration on Soft Tinted Wash */}
        <div className="mt-16 sm:mt-20 p-4 sm:p-7 rounded-[28px] bg-[#eef0ff] border border-[#d8dbf8] shadow-xl">
          {/* 3-Card Deck Overlay Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Card 1: Findings Scene Preview (4 cols) */}
            <div className="lg:col-span-4 rounded-[18px] bg-white border border-[#d8dbf8] p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <span className="text-[12px] font-mono uppercase text-accent font-bold">
                    Detection Phase
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-accent/10 text-accent font-semibold">
                    SARIF & SAST
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-[10px] bg-[#fbfbfd] border border-border">
                    <div className="flex items-center justify-between text-[12px] font-mono">
                      <span className="font-semibold text-text">CVE-2024-4821</span>
                      <span className="text-[#f87171] font-bold">CRITICAL</span>
                    </div>
                    <p className="text-[13px] font-medium text-text mt-1">
                      SQL Injection in users query parser
                    </p>
                    <div className="text-[11px] font-mono text-text-tertiary mt-1">
                      src/users.py:42
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-2 text-[12px] text-text-secondary font-mono flex items-center justify-between border-t border-border/40">
                <span>Scanner Match</span>
                <span className="text-accent font-medium">AST rule sqli-concat</span>
              </div>
            </div>

            {/* Card 2: RunLog / Reproduction Scene (4.5 cols) */}
            <div className="lg:col-span-5 rounded-[18px] bg-white border border-[#d8dbf8] p-5 shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
                    <span className="text-[12px] font-mono uppercase text-text font-bold">
                      Controlled Test Harness
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#fef2f2] text-[#f87171] font-bold border border-[#fecaca]">
                    REPRODUCED
                  </span>
                </div>
                <div className="p-3 rounded-[10px] bg-[#0b0b0c] text-slate-200 font-mono text-[12px] space-y-1.5 overflow-hidden">
                  <div className="text-slate-400">$ python security/reproducers/sqli_find_user.py</div>
                  <div className="text-slate-300">[REPRODUCER] Testing payload: ' OR '1'='1</div>
                  <div className="text-[#f87171] font-semibold">
                    [REPRODUCER] Verdict: reproduced=true, reason=Tautology returned all records
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {"{\"reproduced\": true, \"precondition_ok\": true}"}
                  </div>
                </div>
              </div>
              <div className="pt-2 text-[12px] text-text-secondary font-mono flex items-center justify-between border-t border-border/40">
                <span>Oracle Status</span>
                <span className="text-[#f87171] font-semibold">Flaw confirmed</span>
              </div>
            </div>

            {/* Card 3: Patch Verification Matrix (3.5 cols) */}
            <div className="lg:col-span-3 rounded-[18px] bg-white border border-[#d8dbf8] p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <span className="text-[12px] font-mono uppercase text-[#16a34a] font-bold">
                    Patch Verdict
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#ecfdf5] text-[#16a34a] font-bold border border-[#a7f3d0]">
                    FIX_VERIFIED
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-[8px] bg-[#fbfbfd] border border-border text-[12px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text">Baseline</span>
                      <span className="text-[#f87171] font-mono text-[11px]">Vulnerable</span>
                    </div>
                    <div className="flex items-center justify-between text-text-secondary">
                      <span>Exploit Test</span>
                      <span className="text-[#f87171] font-mono text-[11px]">Triggered</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-[8px] bg-[#ecfdf5]/50 border border-[#a7f3d0] text-[12px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#16a34a]">Candidate Fix</span>
                      <span className="text-[#16a34a] font-mono text-[11px]">Safe</span>
                    </div>
                    <div className="flex items-center justify-between text-text-secondary">
                      <span>Regression Suite</span>
                      <span className="text-[#16a34a] font-mono text-[11px]">Passed (5/5)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-2 text-[11px] text-text-tertiary flex items-center gap-1.5 border-t border-border/40">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                <span>Fix verified for tested cases</span>
              </div>
            </div>
          </div>

          {/* Three Captions in a Row Below Composite */}
          <div className="mt-8 pt-6 border-t border-[#d8dbf8] grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-accent font-bold">
                Findings
              </div>
              <p className="text-[14px] font-medium text-text mt-0.5">
                Real issues from scanners you already use.
              </p>
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-accent font-bold">
                Verification
              </div>
              <p className="text-[14px] font-medium text-text mt-0.5">
                Reproduced with real logs.
              </p>
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-accent font-bold">
                Patch reports
              </div>
              <p className="text-[14px] font-medium text-text mt-0.5">
                Fix verified for tested cases.
              </p>
            </div>
          </div>

          {/* Mandatory Illustrative Disclaimer */}
          <div className="mt-4 text-center">
            <span className="text-[11px] font-mono text-text-tertiary">
              Illustrative, not a live scan.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

