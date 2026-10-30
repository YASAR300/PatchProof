"use client";

import React from "react";
import { FileCheck2, ShieldCheck, Lock, Check } from "lucide-react";

export function EvidenceScene({ className = "" }) {
  return (
    <div
      className={`w-full min-h-[380px] rounded-[16px] border border-white/[0.1] bg-[#0b0b0c] text-slate-100 shadow-xl overflow-hidden font-sans select-none flex flex-col justify-between ${className}`}
    >
      {/* Title Header */}
      <div className="h-11 px-5 bg-[#111113] border-b border-white/[0.08] flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-accent" />
          <span className="font-semibold text-white">Verification Evidence Bundle</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[12px] text-[#4ade80]">
          <Lock className="w-3.5 h-3.5" />
          <span>SHA-256 SEALED</span>
        </div>
      </div>

      {/* Body: Provenance Blocks */}
      <div className="p-5 flex-1 space-y-3.5">
        {/* Scanner Origin */}
        <div className="p-3.5 rounded-[10px] bg-[#141721] border border-white/[0.08] flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#101928] text-[#60a5fa] border border-[#1b2e4b]">
              Scanner
            </span>
            <p className="text-[14px] font-semibold text-white">Semgrep Rule: python.sqlalchemy.security.audit</p>
            <p className="font-mono text-[12px] text-slate-400">Match: users.py:42 (Commit a1b2c3d)</p>
          </div>
          <span className="font-mono text-[12px] text-slate-400">AST Pattern Confirmed</span>
        </div>

        {/* Test-Verified Origin */}
        <div className="p-3.5 rounded-[10px] bg-[#141721] border border-white/[0.08] flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#101e14] text-[#4ade80] border border-[#1a3b22]">
              Test-verified
            </span>
            <p className="text-[14px] font-semibold text-white">Isolated Harness: tests/reproducers/test_sqli_find_user.py</p>
            <p className="font-mono text-[12px] text-slate-400">Verified Commit: 3e9f1a0 • 142/142 Regression Tests PASS</p>
          </div>
          <span className="font-mono text-[12px] text-[#4ade80]">Proof Log Captured</span>
        </div>

        {/* AI-Generated Origin */}
        <div className="p-3.5 rounded-[10px] bg-[#141721] border border-white/[0.08] flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#21180f] text-[#fbbf24] border border-[#3d2b17]">
              AI-generated
            </span>
            <p className="text-[14px] font-semibold text-white">Synthesized Pytest Harness & Parameterized Fix Proposal</p>
            <p className="font-mono text-[12px] text-slate-400">Reviewer: @security-lead • Approved on PR #184</p>
          </div>
          <span className="font-mono text-[12px] text-slate-400">Human Reviewed</span>
        </div>
      </div>

      {/* Footer: Integrity Hash */}
      <div className="h-10 px-5 bg-[#111113] border-t border-white/[0.08] flex items-center justify-between text-[12px] font-mono text-slate-400">
        <span>Integrity Hash: 8f4e2d1c9b7a...3e0f</span>
        <span className="text-white">Export: proof-run-9421.json</span>
      </div>
    </div>
  );
}

