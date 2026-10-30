"use client";

import React from "react";
import { Check, ShieldAlert, Cpu } from "lucide-react";
import { SandboxScene } from "./scenes/SandboxScene";

export function HardeningSection() {
  const hardeningPoints = [
    "Dedicated workers executed per reproduction run",
    "Zero external network access during test execution",
    "Hard cgroup CPU, memory, process, and timeout limits",
    "No host directory mounts or application secret bindings",
    "Disposable overlay filesystems cryptographically wiped on exit",
    "Immutable audit trail of all executed system calls and commands",
  ];

  return (
    <section id="hardening" className="py-24 sm:py-32 bg-[#fbfbfd] text-text font-sans select-none">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Security Checklist (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-accent">
                Sandboxed Execution
              </span>
              <h2 className="text-[34px] sm:text-[42px] font-bold tracking-[-0.025em] leading-[1.15] text-[#0b0b0c]">
                Tests run in isolated, disposable workers
              </h2>
              <p className="text-[16px] text-text-secondary leading-relaxed">
                PatchProof never executes untrusted code on production hosts. Reproducers run inside temporary container micro-VMs constrained by strict resource quotas.
              </p>
            </div>

            <ul className="space-y-3 pt-2">
              {hardeningPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-[14px] text-text-secondary">
                  <div className="w-5 h-5 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {/* Mandatory Security Disclaimer */}
            <div className="p-4 rounded-[12px] bg-[#fff7ed] border border-[#fed7aa] flex items-start gap-3 text-[13px] text-[#9a3412]">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#ea580c]" />
              <div className="leading-snug">
                <strong>Important Boundary Notice:</strong> Containers alone are not treated as a complete security boundary. Static analysis only. Test execution is disabled for repositories without explicit host permissions.
              </div>
            </div>
          </div>

          {/* Right Column: SandboxDiagram (7 cols) */}
          <div className="lg:col-span-7">
            <div className="p-4 sm:p-6 rounded-[24px] bg-[#eef0ff] border border-[#d8dbf8] shadow-lg">
              <SandboxScene className="shadow-2xl" />
              <div className="mt-3 text-center">
                <span className="text-[11px] font-mono text-text-tertiary">
                  Illustrative, not a live scan.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

