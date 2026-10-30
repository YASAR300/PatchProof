"use client";

import React from "react";
import { Cpu, ShieldCheck, Lock, Activity } from "lucide-react";

export function SandboxScene({ className = "" }) {
  return (
    <div
      className={`w-full min-h-[380px] rounded-[16px] border border-white/[0.1] bg-[#0b0b0c] text-slate-100 shadow-xl overflow-hidden font-sans select-none flex flex-col justify-between ${className}`}
    >
      <div className="h-11 px-5 bg-[#111113] border-b border-white/[0.08] flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-accent" />
          <span className="font-semibold text-white">Disposable Worker Sandbox Environment</span>
        </div>
        <span className="font-mono text-[12px] text-[#4ade80]">Active Container: vm-worker-04</span>
      </div>

      <div className="p-5 flex-1 space-y-4">
        {/* Sandbox Bound Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-[8px] bg-[#141721] border border-white/[0.08] space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#f87171] font-semibold">Network</span>
            <p className="text-[15px] font-semibold text-white">0 Network Access</p>
            <p className="text-[12px] text-slate-400">Egress and ingress interfaces terminated</p>
          </div>
          <div className="p-3.5 rounded-[8px] bg-[#141721] border border-white/[0.08] space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#fbbf24] font-semibold">Resource Quota</span>
            <p className="text-[15px] font-semibold text-white">2.0 CPU • 512MB RAM</p>
            <p className="text-[12px] text-slate-400">Hard cgroup process limits enforced</p>
          </div>
          <div className="p-3.5 rounded-[8px] bg-[#141721] border border-white/[0.08] space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#a0a0a8] font-semibold">Storage</span>
            <p className="text-[15px] font-semibold text-white">Ephemeral Overlay</p>
            <p className="text-[12px] text-slate-400">Cryptographically wiped on exit</p>
          </div>
        </div>

        {/* Live Syscall Audit */}
        <div className="p-4 rounded-[10px] bg-[#0e1017] border border-white/[0.06] font-mono text-[12px] space-y-1.5 text-slate-300">
          <div className="text-slate-400 pb-1 border-b border-white/[0.06] flex items-center justify-between">
            <span>Syscall Filter Audit Trace</span>
            <span className="text-[#4ade80]">seccomp active</span>
          </div>
          <div>[syscall:socket] DENIED ➔ Operation not permitted (Network airgap)</div>
          <div>[syscall:mount] DENIED ➔ Operation not permitted (Host protection)</div>
          <div className="text-white">[syscall:execve] ALLOWED ➔ /usr/bin/python3 -m pytest</div>
        </div>
      </div>

      <div className="h-10 px-5 bg-[#111113] border-t border-white/[0.08] flex items-center justify-between text-[12px] font-mono text-slate-400">
        <span>Boundary: Ephemeral micro-VM container</span>
        <span className="text-white">Auto-destruct on completion</span>
      </div>
    </div>
  );
}

