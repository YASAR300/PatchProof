"use client";

import React from "react";
import { Package, ArrowRight, ShieldAlert, Check } from "lucide-react";

export function DependencyScene({ className = "" }) {
  return (
    <div
      className={`w-full min-h-[380px] rounded-[16px] border border-white/[0.1] bg-[#0b0b0c] text-slate-100 shadow-xl overflow-hidden font-sans select-none flex flex-col justify-between ${className}`}
    >
      <div className="h-11 px-5 bg-[#111113] border-b border-white/[0.08] flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-accent" />
          <span className="font-semibold text-white">Transitive Dependency Call-Tree</span>
        </div>
        <span className="font-mono text-[12px] text-slate-400">Lockfile: package-lock.json</span>
      </div>

      <div className="p-5 flex-1 space-y-4">
        {/* Reachable path chain */}
        <div className="p-4 rounded-[10px] bg-[#141721] border border-white/[0.08] space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold">
            Reachable Import Chain (Confirmed Active)
          </span>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[13px]">
            <span className="px-2.5 py-1 rounded bg-[#1c2230] text-slate-200">org/backend-api</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="px-2.5 py-1 rounded bg-[#1c2230] text-slate-200">express-validator@6.14.0</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="px-2.5 py-1 rounded bg-[#201214] text-[#f87171] border border-[#3d1a1e]">
              validator@13.7.0 (CVE-2024-4821)
            </span>
          </div>
          <p className="text-[13px] text-slate-300">
            ReDoS triggered in <code className="font-mono text-accent">isURL()</code> invoked by <code className="font-mono text-accent">src/routes/auth.js:88</code>.
          </p>
        </div>

        {/* Filtered Unreachable Noise */}
        <div className="p-4 rounded-[10px] bg-[#111113] border border-white/[0.06] space-y-2 opacity-80">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate-300">Unreachable Dependency Noise Filtered</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono text-[#4ade80] bg-[#101e14] border border-[#1a3b22]">
              12 CVEs Excluded
            </span>
          </div>
          <p className="text-[12px] text-slate-400">
            Identified devDependencies and dead imports that are never executed in production build bundles.
          </p>
        </div>
      </div>

      <div className="h-10 px-5 bg-[#111113] border-t border-white/[0.08] flex items-center justify-between text-[12px] font-mono text-slate-400">
        <span>Engine: OSV Database API • 348 rules scanned</span>
        <span className="text-[#4ade80]">Call-path verified</span>
      </div>
    </div>
  );
}

