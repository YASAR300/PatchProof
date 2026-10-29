"use client";

import React from "react";
import {
  ShieldAlert,
  Server,
  WifiOff,
  Cpu,
  Lock,
  Trash2,
  FileText,
  AlertTriangle,
} from "lucide-react";

export function SecurityModelSection() {
  const protections = [
    {
      title: "Dedicated Isolated Workers",
      description: "Each reproduction run executes in an ephemeral, freshly provisioned virtual worker completely isolated from other jobs.",
      icon: Server,
    },
    {
      title: "No Network During Test Execution",
      description: "Network egress and ingress are explicitly blocked at the network interface level during harness payload execution.",
      icon: WifiOff,
    },
    {
      title: "CPU, Memory, Process & Time Limits",
      description: "Hard cgroup thresholds prevent denial-of-service exploits, fork bombs, and run-away resource exhaustion.",
      icon: Cpu,
    },
    {
      title: "No Host Mounts or Application Secrets",
      description: "Harness workers never receive host filesystem bindings, production credentials, or repository API tokens.",
      icon: Lock,
    },
    {
      title: "Disposable Environments",
      description: "Workers are immediately wiped and destroyed upon test termination, leaving zero residual state between executions.",
      icon: Trash2,
    },
    {
      title: "Comprehensive Audit Records",
      description: "Every worker invocation, command stream, exit status, and container digest is immutably logged for security auditing.",
      icon: FileText,
    },
  ];

  return (
    <section id="security" className="py-24 sm:py-36 bg-[#090a0f] text-white border-b border-white/[0.08]" data-theme="dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-indigo-400 mb-3 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Execution Hardening
          </div>
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-[-0.03em] leading-[1.08] text-white">
            Hermetic sandbox security model.
          </h2>
          <p className="mt-4 text-lg text-white/60 leading-relaxed">
            Running controlled exploits requires uncompromising runtime confinement. Here is how PatchProof defends the harness boundary.
          </p>
        </div>

        {/* 6 Protections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {protections.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="rounded-2xl border border-white/[0.08] bg-[#11131a] p-6 space-y-3 hover:border-white/[0.16] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-indigo-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white tracking-tight">{p.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{p.description}</p>
              </div>
            );
          })}
        </div>

        {/* Honest Note Banner */}
        <div className="mt-12 p-5 sm:p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-start gap-4 text-amber-200">
          <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold tracking-tight text-amber-300">
              Honest Confinement Principle
            </h4>
            <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed font-sans">
              Containers alone are not treated as a complete security boundary. PatchProof pairs kernel isolation with network detachment, unprivileged users, and strict resource quotas to defend against untrusted exploits.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
