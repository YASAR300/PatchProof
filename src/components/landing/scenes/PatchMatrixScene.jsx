"use client";

import React from "react";
import { CheckCircle2, ShieldAlert, GitCommit, FileCode } from "lucide-react";

export function PatchMatrixScene({ className = "" }) {
  return (
    <div
      className={`w-full min-h-[380px] rounded-[16px] border border-white/[0.1] bg-[#0b0b0c] text-slate-100 shadow-xl overflow-hidden font-sans select-none flex flex-col justify-between ${className}`}
    >
      {/* Title Header */}
      <div className="h-11 px-5 bg-[#111113] border-b border-white/[0.08] flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-accent" />
          <span className="font-semibold text-white">Truth Table Comparison Matrix</span>
        </div>
        <span className="font-mono text-[12px] text-slate-400">Target PR: #184 (Commit 3e9f1a0)</span>
      </div>

      {/* Matrix Table */}
      <div className="p-5 flex-1 space-y-4">
        <div className="overflow-x-auto rounded-[10px] border border-white/[0.08] bg-[#0e1017]">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#141721] text-slate-300">
                <th className="py-3 px-4 font-semibold">Evaluation Step</th>
                <th className="py-3 px-4 font-semibold">Vulnerable Baseline (a1b2c3d)</th>
                <th className="py-3 px-4 font-semibold">Candidate Patch (3e9f1a0)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] font-mono text-[13px]">
              <tr>
                <td className="py-3.5 px-4 font-sans font-medium text-slate-200">
                  1. Security Reproducer
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] bg-[#201214] text-[#f87171] border border-[#3d1a1e]">
                    <ShieldAlert className="w-3.5 h-3.5" /> REPRODUCED
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] bg-[#101e14] text-[#4ade80] border border-[#1a3b22]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> FIX_VERIFIED
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-sans font-medium text-slate-200">
                  2. Regression Suite
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded text-[12px] bg-[#101e14] text-[#4ade80] border border-[#1a3b22]">
                    142/142 PASSED
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded text-[12px] bg-[#101e14] text-[#4ade80] border border-[#1a3b22]">
                    142/142 PASSED
                  </span>
                </td>
              </tr>
              <tr className="bg-[#141721]">
                <td className="py-3.5 px-4 font-sans font-semibold text-white">Verdict</td>
                <td className="py-3.5 px-4 font-sans text-[#f87171] font-semibold">
                  Exploitable finding confirmed
                </td>
                <td className="py-3.5 px-4 font-sans text-[#4ade80] font-semibold">
                  Safe to merge (for tested cases)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Small Diff Snippet */}
        <div className="p-3.5 rounded-[8px] bg-[#0b0b0c] border border-white/[0.08] font-mono text-[12px] text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-slate-400" />
            <span>users.py:42</span>
            <span className="text-slate-400">|</span>
            <span className="text-[#f87171]">- db.execute(f&quot;SELECT * FROM users WHERE id={'{id}'}&quot;)</span>
          </div>
          <span className="text-[#4ade80]">+ db.execute(&quot;SELECT * FROM users WHERE id=?&quot;, (id,))</span>
        </div>
      </div>
    </div>
  );
}

