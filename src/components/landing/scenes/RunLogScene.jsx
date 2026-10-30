"use client";

import React from "react";
import { Terminal, ShieldAlert, Cpu } from "lucide-react";

export function RunLogScene({ className = "" }) {
  const logs = [
    { time: "14:22:01.102", text: "SPAWN worker-isolated-vm (container id: exp-9421)", highlight: "text-slate-300" },
    { time: "14:22:01.340", text: "CONFIG cgroup: cpu=2.0 mem=512MB network=DISABLED mounts=NONE", highlight: "text-slate-300" },
    { time: "14:22:01.890", text: "FETCH repo: org/backend-api @ commit a1b2c3d (parent: 8f7e6d5)", highlight: "text-slate-300" },
    { time: "14:22:02.120", text: "RUN pytest tests/reproducers/test_sqli_find_user.py", highlight: "text-accent font-semibold" },
    { time: "14:22:02.450", text: "ASSERT payload: 'admin' OR '1'='1' injected into auth query", highlight: "text-slate-300" },
    { time: "14:22:02.780", text: "RESULT Status 200 OK — Vulnerability exploited successfully", highlight: "text-[#f87171] font-semibold" },
    { time: "14:22:02.990", text: "EXIT CODE 1 (Assertion matched reproducer condition)", highlight: "text-[#f87171]" },
    { time: "14:22:03.110", text: "SEAL trace bundle sha256: 9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b", highlight: "text-[#4ade80]" },
  ];

  return (
    <div
      className={`w-full min-h-[380px] rounded-[16px] border border-white/[0.1] bg-[#0b0b0c] text-slate-100 shadow-xl overflow-hidden font-mono text-[13px] select-none flex flex-col justify-between ${className}`}
    >
      {/* Terminal Titlebar */}
      <div className="h-11 px-4 bg-[#111113] border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-accent" />
          <span className="text-slate-300 font-medium">Harness Runner Log — exp-9421</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#201214] text-[#f87171] border border-[#3d1a1e]">
            <ShieldAlert className="w-3.5 h-3.5" /> REPRODUCED
          </span>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-5 space-y-2 leading-relaxed flex-1 bg-[#0b0b0c] overflow-x-auto">
        <div className="text-slate-400 pb-2 border-b border-white/[0.06] flex items-center justify-between text-[12px]">
          <span>Commit Hash: a1b2c3d</span>
          <span>Engine: Pytest 8.2 • Python 3.12</span>
        </div>
        {logs.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <span className="text-slate-400 select-none text-[12px]">{item.time}</span>
            <span className={item.highlight}>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Terminal Footer */}
      <div className="h-10 px-4 bg-[#111113] border-t border-white/[0.08] flex items-center justify-between text-[12px] text-slate-400">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span>Execution Time: 1,892ms</span>
        </div>
        <span className="text-[#4ade80]">Proof Captured</span>
      </div>
    </div>
  );
}

