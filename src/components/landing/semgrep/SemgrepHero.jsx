"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Terminal,
  FileCode2,
  Lock,
  BarChart3,
  TrendingUp,
  Sliders,
  Check,
} from "lucide-react";

export function SemgrepHero() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      window.location.href = `/signup?email=${encodeURIComponent(email)}`;
    }
  };

  return (
    <section className="pt-12 pb-20 sm:pt-20 sm:pb-28 bg-[#e2efe7] text-[#0e261d] select-none">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Top Header & Copy */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
          {/* Big Two-Line Headline */}
          <h1 className="text-[44px] sm:text-[64px] lg:text-[80px] font-extrabold tracking-[-0.035em] leading-[1.0] text-[#0e261d] font-sans">
            Code Security<br />
            <strong className="font-extrabold text-[#0e261d]">for Builders and Agents</strong>
          </h1>

          {/* Subheadline */}
          <p className="text-[18px] sm:text-[21px] text-[#2c4d3e] leading-[1.45] max-w-[62ch]">
            Catch, flag, and fix real vulnerabilities before they ship, powered by security that proves every patch. Unify SAST, SCA, and disposable test harnesses into one platform built for today’s software era.
          </p>

          {/* Semgrep-Style Unified Email Pill CTA */}
          <div className="flex flex-col items-center gap-3 w-full max-w-md">
            <form
              onSubmit={handleSubmit}
              className="flex items-center w-full h-13 p-1.5 rounded-full bg-white border border-[#b8dec9] shadow-md"
            >
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-full px-5 rounded-full bg-transparent text-[15px] text-[#0e261d] placeholder:text-[#64748b] focus:outline-none"
                required
              />
              <button
                type="submit"
                className="h-10 px-6 rounded-full text-[14px] font-bold bg-[#008456] hover:bg-[#006b45] text-white shadow-sm transition-all hover:shadow active:scale-[0.98] whitespace-nowrap"
              >
                Book a demo
              </button>
            </form>

            <Link
              href="/signup"
              className="text-[14px] font-semibold text-[#008456] hover:text-[#006b45] underline flex items-center gap-1 transition-colors"
            >
              Try for free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Semgrep's Signature 3-Card Showcase Container */}
        <div className="mt-14 sm:mt-18 p-3 sm:p-5 rounded-[32px] bg-[#d3e8dc]/60 border border-[#bcdbc9] shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Card 1: Left - Bar Charts & Trend (4 cols) */}
            <div className="lg:col-span-4 rounded-[22px] bg-white border border-[#cbe4d5] p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                  <div className="flex items-center gap-2 font-bold text-[14px] text-[#0e261d]">
                    <BarChart3 className="w-4 h-4 text-[#008456]" />
                    <span>Remediation Velocity</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#ecfdf5] text-[#008456] border border-[#a7f3d0]">
                    92% NOISE FILTERED
                  </span>
                </div>

                {/* Multi-column Bar Chart Visualization */}
                <div className="mt-5 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[12px] font-mono text-[#64748b]">
                      <span>Weekly Verified Fixes</span>
                      <span className="font-bold text-[#008456]">+38% MoM</span>
                    </div>
                    {/* Visual Bar Columns */}
                    <div className="h-24 w-full flex items-end justify-between gap-2 pt-2 px-1">
                      <div className="w-full bg-[#93c5fd] rounded-t-sm h-[40%]" title="Week 1" />
                      <div className="w-full bg-[#54d8b7] rounded-t-sm h-[60%]" title="Week 2" />
                      <div className="w-full bg-[#34d399] rounded-t-sm h-[75%]" title="Week 3" />
                      <div className="w-full bg-[#008456] rounded-t-sm h-[95%]" title="Week 4" />
                    </div>
                  </div>

                  {/* Gradient Area Trend Below */}
                  <div className="p-3.5 rounded-[14px] bg-gradient-to-r from-[#ecfdf5] to-[#f0fdf4] border border-[#d1fae5] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono uppercase text-[#047857] font-bold">
                        Average Time to Fix
                      </span>
                      <p className="text-[22px] font-extrabold text-[#065f46]">1.2 Days</p>
                    </div>
                    <TrendingUp className="w-7 h-7 text-[#008456]" />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#f1f5f9] text-[12px] font-mono text-[#64748b] flex items-center justify-between">
                <span>Deterministic Reproducer</span>
                <span className="text-[#008456] font-bold">100% Proven</span>
              </div>
            </div>

            {/* Card 2: Center - Highlighted Warm Peach Finding Table (4.5 cols) */}
            <div className="lg:col-span-5 rounded-[22px] bg-gradient-to-b from-[#fff6ed] to-white border-2 border-[#fdba74] p-6 shadow-md flex flex-col justify-between space-y-5 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-[#fed7aa]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]" />
                  <span className="font-bold text-[14px] text-[#9a3412]">
                    Active Vulnerability Queue
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#ea580c] text-white">
                  CRITICAL
                </span>
              </div>

              {/* Table Rows with Checkboxes */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-[12px] bg-white border border-[#fed7aa] space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between font-mono text-[13px]">
                    <span className="font-bold text-[#0e261d]">CVE-2024-4821</span>
                    <span className="text-[#ea580c] font-semibold">src/query.js:42</span>
                  </div>
                  <p className="text-[14px] font-semibold text-[#0e261d]">
                    Prototype pollution in query parser
                  </p>
                  <div className="pt-1 flex items-center gap-2 font-mono text-[11px]">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#fee2e2] text-[#991b1b] border border-[#fecaca] font-bold">
                      <ShieldAlert className="w-3 h-3" /> REPRODUCED
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#dcfce7] text-[#166534] border border-[#bbf7d0] font-bold">
                      <CheckCircle2 className="w-3 h-3" /> FIX_VERIFIED
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-[12px] bg-white/70 border border-[#fed7aa]/50 space-y-1">
                  <div className="flex items-center justify-between font-mono text-[12px]">
                    <span className="font-semibold text-[#64748b]">CVE-2024-3198</span>
                    <span className="text-[#64748b]">src/auth.py:88</span>
                  </div>
                  <p className="text-[13px] text-[#475569]">SQL injection via string format</p>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[12px] font-mono text-[#9a3412]">
                  Harness: Pytest (Isolated VM)
                </span>
                <span className="px-3 py-1.5 rounded-full text-[12px] font-bold bg-[#ea580c] text-white shadow-xs">
                  1-Click Verify →
                </span>
              </div>
            </div>

            {/* Card 3: Right - Violet PR Gate & Policies (3.5 cols) */}
            <div className="lg:col-span-3 rounded-[22px] bg-gradient-to-b from-[#f5f3ff] to-white border border-[#ddd6fe] p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#ede9fe]">
                  <div className="flex items-center gap-2 font-bold text-[14px] text-[#5b21b6]">
                    <Sliders className="w-4 h-4 text-[#7c3aed]" />
                    <span>PR Security Gate</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#6d28d9]">PR #184</span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded-[12px] bg-white border border-[#ede9fe] space-y-1 text-[13px]">
                    <div className="flex items-center gap-2 text-[#008456] font-bold">
                      <Check className="w-4 h-4" />
                      <span>Block on Unverified CVEs</span>
                    </div>
                    <p className="text-[12px] text-[#64748b] pl-6 font-mono">
                      Policy: Strict Zero-Regression
                    </p>
                  </div>

                  <div className="p-3 rounded-[12px] bg-white border border-[#ede9fe] space-y-1 text-[13px]">
                    <div className="flex items-center gap-2 text-[#008456] font-bold">
                      <Check className="w-4 h-4" />
                      <span>Airgapped Micro-VM</span>
                    </div>
                    <p className="text-[12px] text-[#64748b] pl-6 font-mono">
                      Egress disabled • 0 Secrets
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[14px] bg-[#ecfdf5] border border-[#a7f3d0] text-center space-y-1">
                    <span className="text-[13px] font-extrabold text-[#065f46]">
                      Safe to merge (for tested cases)
                    </span>
                    <p className="text-[11px] text-[#008456]">Commit 3e9f1a0 passed</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#ede9fe] text-[12px] font-mono text-[#64748b] text-center">
                SHA-256 Digest: 8f4e2d...3e0f
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[13px] text-[#426b57]">
          Illustrative sequence, not a live scan.
        </p>
      </div>
    </section>
  );
}
