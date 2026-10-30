"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  Terminal,
  Cpu,
  FileCheck2,
  FileCode2,
  Sliders,
  Lock,
  Layers,
} from "lucide-react";

export function SemgrepSpotlight() {
  const [activeFinding, setActiveFinding] = useState(0);

  const findings = [
    {
      cve: "CVE-2024-4821",
      title: "Prototype pollution in query parser",
      file: "src/utils/query-parser.js:42",
      severity: "CRITICAL",
      diff: [
        "- if (key.indexOf('__proto__') !== -1) return;",
        "+ const hasKey = Object.prototype.hasOwnProperty.call(target, key);",
        "  target[key] = sanitize(source[key]);",
      ],
      log: "Pytest reproducer: Exploit payload neutralized (Status 400 Bad Request)",
    },
    {
      cve: "CVE-2024-3198",
      title: "SQL injection via raw query format string",
      file: "src/database/users.py:88",
      severity: "HIGH",
      diff: [
        "- cursor.execute(f'SELECT * FROM users WHERE id={user_id}')",
        "+ cursor.execute('SELECT * FROM users WHERE id=%s', (user_id,))",
      ],
      log: "Pytest reproducer: Parameterized binding prevents SQL injection",
    },
  ];

  const current = findings[activeFinding];

  return (
    <section id="platform-spotlight" className="py-24 sm:py-32 bg-[#e2efe7] text-[#0e261d] select-none scroll-mt-14">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[12px] font-mono uppercase tracking-widest text-[#008456] font-bold">
            Why PatchProof
          </span>
          <h2 className="text-[36px] sm:text-[48px] lg:text-[60px] font-extrabold tracking-tight leading-[1.05] text-[#0e261d]">
            Built for Builders, Trusted by Security
          </h2>
          <p className="text-[18px] sm:text-[21px] text-[#2c4d3e] leading-relaxed max-w-[58ch] mx-auto">
            Lives where developers work, delivering fixes without breaking flow. Gives security teams visibility, control, and cryptographic proof.
          </p>
        </div>

        {/* Large App Window with Wide Sage Outer Frame (Exact Semgrep Look) */}
        <div className="p-3 sm:p-5 rounded-[32px] bg-[#cde4d6] border border-[#b8dcce] shadow-2xl">
          <div className="rounded-[24px] bg-white border border-[#b8dcce] overflow-hidden shadow-lg">
            {/* Top Window Bar */}
            <div className="h-12 px-5 bg-[#edf7f2] border-b border-[#cde4d6] flex items-center justify-between text-[13px] text-[#065f46]">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#f87171]" />
                <span className="w-3 h-3 rounded-full bg-[#fbbf24]" />
                <span className="w-3 h-3 rounded-full bg-[#4ade80]" />
                <span className="ml-2 font-mono font-bold text-[#0e261d]">
                  patchproof / repo: pallets/flask / pr-184
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[12px] text-[#008456] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#008456]" />
                <span>Harness Runner: Active</span>
              </div>
            </div>

            {/* Split Console: Left Dark Sidebar + Right Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
              {/* Left Dark Sidebar: 4.5 cols */}
              <div className="lg:col-span-4 p-5 bg-[#142328] text-slate-200 space-y-3 font-sans border-b lg:border-b-0 lg:border-r border-[#263a42]">
                <div className="flex items-center justify-between text-[13px] font-bold text-slate-300 pb-2 border-b border-slate-700">
                  <span>Detected Findings</span>
                  <span className="text-[11px] font-mono text-[#54d8b7]">2 Confirmed</span>
                </div>

                {findings.map((f, idx) => {
                  const isSelected = idx === activeFinding;
                  return (
                    <button
                      key={f.cve}
                      type="button"
                      onClick={() => setActiveFinding(idx)}
                      className={`w-full text-left p-3.5 rounded-[14px] transition-all border ${
                        isSelected
                          ? "bg-[#1f333b] border-[#54d8b7] text-white shadow-sm"
                          : "bg-[#142328] border-transparent hover:bg-[#1a2c33] text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[13px] font-bold text-white">
                          {f.cve}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            f.severity === "CRITICAL"
                              ? "bg-[#3d1a1e] text-[#f87171]"
                              : "bg-[#3d2b17] text-[#fbbf24]"
                          }`}
                        >
                          {f.severity}
                        </span>
                      </div>
                      <p className="text-[13px] font-medium leading-snug">{f.title}</p>
                      <div className="mt-2 flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-[#f87171] font-semibold">REPRODUCED</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[#54d8b7] font-semibold">FIX_VERIFIED</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Main Pane: 7.5 cols */}
              <div className="lg:col-span-8 p-6 bg-white flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                    <div className="flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-[#008456]" />
                      <span className="font-mono text-[13px] font-bold text-[#0e261d]">
                        {current.file}
                      </span>
                    </div>
                    <span className="text-[12px] font-mono font-bold text-[#008456] bg-[#ecfdf5] px-3 py-1 rounded-full border border-[#a7f3d0]">
                      ✓ Fix Verified
                    </span>
                  </div>

                  {/* Red/Green Line Code Diff */}
                  <div className="p-4 rounded-[14px] bg-[#0f172a] text-slate-100 font-mono text-[13px] leading-relaxed overflow-x-auto shadow-inner">
                    <div className="text-slate-400 pb-1">// Candidate patch evaluation against reproducer</div>
                    {current.diff.map((line, lIdx) => (
                      <div
                        key={lIdx}
                        className={
                          line.startsWith("-")
                            ? "text-[#f87171] bg-[#201214] px-1 -mx-1 rounded"
                            : line.startsWith("+")
                            ? "text-[#4ade80] bg-[#101e14] px-1 -mx-1 rounded font-semibold"
                            : "text-slate-300"
                        }
                      >
                        {line}
                      </div>
                    ))}
                  </div>

                  {/* Pytest Output */}
                  <div className="p-4 rounded-[12px] bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Terminal className="w-4 h-4 text-[#008456]" />
                      <span className="text-[13px] font-mono font-medium text-[#065f46]">
                        {current.log}
                      </span>
                    </div>
                    <span className="text-[12px] font-bold text-[#008456]">PASS</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-[12px] font-mono text-[#64748b]">
                  <span>Integrity Hash: 8f4e2d1c9b...3e0f</span>
                  <span className="text-[#008456] font-bold">Safe to merge (for tested cases)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Icon Columns Underneath (Semgrep Icon Grid Layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-6">
          <div className="space-y-2.5 p-6 rounded-[20px] bg-white border border-[#b8dcce] shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#008456] flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-[17px] font-bold text-[#0e261d]">Empower invention without friction</h3>
            <p className="text-[14px] text-[#475569] leading-relaxed">
              Industry-leading SAST, call-tree SCA, and test verification in one high-signal application security platform.
            </p>
          </div>

          <div className="space-y-2.5 p-6 rounded-[20px] bg-white border border-[#b8dcce] shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#008456] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-[17px] font-bold text-[#0e261d]">Prevention at the Source</h3>
            <p className="text-[14px] text-[#475569] leading-relaxed">
              Secure code as it’s written. Built-in disposable test harnesses verify safe candidate fixes before code ships.
            </p>
          </div>

          <div className="space-y-2.5 p-6 rounded-[20px] bg-white border border-[#b8dcce] shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#008456] flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-[17px] font-bold text-[#0e261d]">Zero False Positives a Reality</h3>
            <p className="text-[14px] text-[#475569] leading-relaxed">
              Triage 86% fewer false positives. Deterministic reproducers prove exploitability, shrinking backlogs and boosting velocity.
            </p>
          </div>

          <div className="space-y-2.5 p-6 rounded-[20px] bg-white border border-[#b8dcce] shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#008456] flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-[17px] font-bold text-[#0e261d]">Smarter as You Build</h3>
            <p className="text-[14px] text-[#475569] leading-relaxed">
              Automated test synthesis learns codebase patterns, prioritizing reachable vulnerabilities with cryptographic proof.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
