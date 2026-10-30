"use client";

import React from "react";
import { GitPullRequest, CheckCircle2, ShieldAlert, AlertTriangle } from "lucide-react";

export function MonitoringScene({ className = "" }) {
  return (
    <div
      className={`w-full min-h-[380px] rounded-[16px] border border-white/[0.1] bg-[#0b0b0c] text-slate-100 shadow-xl overflow-hidden font-sans select-none flex flex-col justify-between ${className}`}
    >
      <div className="h-11 px-5 bg-[#111113] border-b border-white/[0.08] flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-2">
          <GitPullRequest className="w-4 h-4 text-accent" />
          <span className="font-semibold text-white">GitHub Pull Request Security Checks</span>
        </div>
        <span className="font-mono text-[12px] text-slate-400">PR #192: refactor/orm-session</span>
      </div>

      <div className="p-5 flex-1 space-y-3.5">
        {/* Regression Alert Row */}
        <div className="p-4 rounded-[10px] bg-[#201214] border border-[#3d1a1e] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#f87171]" />
              <span className="text-[14px] font-semibold text-white">
                Regression Gate: Security Test Failed
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#3d1a1e] text-[#f87171]">
              BLOCKING MERGE
            </span>
          </div>
          <p className="text-[13px] text-slate-300">
            A refactor in <code className="font-mono text-[#f87171]">src/database/session.py</code> re-introduced vulnerability <code className="font-mono text-white">CVE-2024-4821</code> previously verified in PR #184.
          </p>
          <div className="font-mono text-[12px] text-[#f87171] pt-1">
            ❌ reproducer_test_sqli_find_user.py exited with code 1
          </div>
        </div>

        {/* Normal Functional CI Checks */}
        <div className="p-4 rounded-[10px] bg-[#141721] border border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
            <div>
              <p className="text-[14px] font-medium text-slate-200">Unit & Integration Tests</p>
              <p className="font-mono text-[12px] text-slate-400">142/142 tests passing</p>
            </div>
          </div>
          <span className="font-mono text-[12px] text-[#4ade80]">PASSED</span>
        </div>
      </div>

      <div className="h-10 px-5 bg-[#111113] border-t border-white/[0.08] flex items-center justify-between text-[12px] font-mono text-slate-400">
        <span>CI Gate: GitHub Actions webhook active</span>
        <span className="text-[#f87171]">Merge prohibited until resolved</span>
      </div>
    </div>
  );
}

