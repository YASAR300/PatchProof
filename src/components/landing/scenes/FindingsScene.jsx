"use client";

import React from "react";
import {
  FileCode2,
  Terminal,
  ShieldAlert,
  CheckCircle2,
  Check,
  Search,
  Filter,
} from "lucide-react";

export function FindingsScene({ className = "", isHero = false }) {
  return (
    <div
      className={`w-full rounded-[16px] border border-white/[0.1] bg-[#0b0b0c] text-slate-100 shadow-2xl overflow-hidden font-sans select-none ${className}`}
    >
      {/* App Frame Header Bar */}
      <div className="h-11 px-4 bg-[#111113] border-b border-white/[0.08] flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#f87171]/80" />
            <span className="w-3 h-3 rounded-full bg-[#fbbf24]/80" />
            <span className="w-3 h-3 rounded-full bg-[#4ade80]/80" />
          </div>
          <span className="ml-2 font-mono text-[13px] text-slate-400">
            patchproof / repo: org/backend-api / run-9421
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
          <span className="text-slate-300 font-mono text-[13px]">Harness: Isolated VM</span>
        </div>
      </div>

      {/* Main App Content Grid: 5 cols findings list + 7 cols detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
        {/* Left column: Findings List (5 cols) */}
        <div className="lg:col-span-5 p-4 border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#0b0b0c] space-y-3">
          <div className="flex items-center justify-between text-[13px] text-slate-400 font-medium px-1">
            <span>Security Findings (2)</span>
            <span className="font-mono text-[12px] text-slate-400">Sort: Severity</span>
          </div>

          {/* Active / Selected Finding */}
          <div className="p-3.5 rounded-[10px] bg-[#161820] border border-accent/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[13px] font-semibold text-white">
                CVE-2024-4821
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#201214] text-[#f87171] border border-[#3d1a1e]">
                CRITICAL
              </span>
            </div>
            <p className="text-[14px] font-medium text-slate-200">
              Prototype pollution in query parser
            </p>
            <div className="flex items-center gap-2 pt-1 font-mono text-[12px]">
              <span className="inline-flex items-center gap-1 text-[#f87171]">
                <ShieldAlert className="w-3.5 h-3.5" /> REPRODUCED
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 text-[#4ade80]">
                <CheckCircle2 className="w-3.5 h-3.5" /> FIX_VERIFIED
              </span>
            </div>
          </div>

          {/* Secondary Finding */}
          <div className="p-3.5 rounded-[10px] bg-[#111113] border border-white/[0.06] opacity-75 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[13px] font-medium text-slate-300">
                CVE-2024-3198
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#21180f] text-[#fbbf24] border border-[#3d2b17]">
                MEDIUM
              </span>
            </div>
            <p className="text-[14px] text-slate-400">ReDoS in markdown table parser</p>
            <span className="inline-block font-mono text-[12px] text-slate-400">
              Unverified candidate
            </span>
          </div>
        </div>

        {/* Right column: Selected Finding Detail & Code (7 cols) */}
        <div className="lg:col-span-7 p-5 bg-[#0e1017] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-accent" />
                <span className="font-mono text-[13px] text-slate-200 font-medium">
                  src/utils/query-parser.js:42
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#21180f] text-[#fbbf24] border border-[#3d2b17]">
                Potential finding
              </span>
            </div>

            {/* Code diff snippet */}
            <div className="rounded-[8px] bg-[#0b0b0c] border border-white/[0.08] p-4 font-mono text-[13px] leading-relaxed overflow-x-auto text-slate-300">
              <div className="text-slate-400">// Vulnerability reproducer trace</div>
              <div className="text-[#f87171] bg-[#201214]/50 px-1 -mx-1 rounded">
                - if (key.indexOf(&quot;__proto__&quot;) !== -1) return;
              </div>
              <div className="text-[#4ade80] bg-[#101e14]/50 px-1 -mx-1 rounded">
                + const hasKey = Object.prototype.hasOwnProperty.call(target, key);
              </div>
              <div className="text-slate-400">  target[key] = sanitize(source[key]);</div>
            </div>
          </div>

          {/* Test harness result banner */}
          <div className="p-3.5 rounded-[8px] bg-[#141721] border border-white/[0.08] flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent" />
              <span className="font-mono text-slate-200">
                Pytest harness: test_sqli_find_user.py
              </span>
            </div>
            <span className="font-mono text-[#4ade80] font-semibold">
              Fix verified for tested cases
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

