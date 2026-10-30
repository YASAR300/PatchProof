"use client";

import React from "react";
import {
  Check,
  ArrowRight,
  GitBranch,
  Terminal,
  FileCode2,
  Cpu,
  Package,
  Layers,
  Shield,
  FileCheck2,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function WorkflowSection() {
  const capabilities = [
    "Public GitHub repositories for static analysis",
    "Pull-request checks on allow-listed repositories",
    "SARIF and Semgrep JSON report ingestion",
    "Python and JavaScript/TypeScript lockfile parsing",
    "OSV vulnerability advisory matching",
    "JSON, Markdown, and print-to-PDF evidence export",
  ];

  const nodeIcons = [
    { icon: GitBranch, label: "Git" },
    { icon: Terminal, label: "CLI" },
    { icon: FileCode2, label: "SARIF" },
    { icon: Cpu, label: "VM" },
    { icon: Package, label: "Locks" },
    { icon: Layers, label: "OSV" },
    { icon: Shield, label: "SAST" },
    { icon: FileCheck2, label: "Tests" },
  ];

  return (
    <section id="workflow" className="py-24 sm:py-32 bg-[#fbfbfd] border-t border-border/60 text-text font-sans select-none">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Supported Capabilities (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-accent">
                Integrations & Tooling
              </span>
              <h2 className="text-[34px] sm:text-[42px] font-bold tracking-[-0.025em] leading-[1.15] text-[#0b0b0c]">
                Works where you build
              </h2>
              <p className="text-[16px] text-text-secondary leading-relaxed">
                PatchProof integrates seamlessly with your existing continuous integration, scanners, and pull-request verification workflows.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="font-bold text-[14px] text-text">Supported today:</div>
              <ul className="space-y-2.5">
                {capabilities.map((cap) => (
                  <li key={cap} className="flex items-start gap-2.5 text-[14px] text-text-secondary">
                    <div className="w-5 h-5 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <a
                href="#pricing"
                className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent hover:underline"
              >
                See the plans <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: ConnectorGrid (7 cols) */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-12 rounded-[24px] bg-[#eef0ff] border border-[#d8dbf8] flex items-center justify-center relative overflow-hidden min-h-[380px]">
              {/* Surrounding Node Grid */}
              <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
                {/* Center Core Node */}
                <div className="w-20 h-20 rounded-full bg-white border-2 border-accent shadow-lg flex items-center justify-center z-10">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <Shield className="w-6 h-6" />
                  </div>
                </div>

                {/* Concentric Connecting Ring Lines */}
                <div className="absolute inset-4 rounded-full border border-dashed border-[#b8bfe6] pointer-events-none" />
                <div className="absolute inset-16 rounded-full border border-[#c8ceff] pointer-events-none" />

                {/* 8 Generic Peripheral Nodes */}
                {nodeIcons.map((node, i) => {
                  const angle = (i * 360) / nodeIcons.length;
                  const rad = (angle * Math.PI) / 180;
                  const r = 145; // radius in px
                  const x = Math.round(r * Math.cos(rad));
                  const y = Math.round(r * Math.sin(rad));
                  const Icon = node.icon;

                  return (
                    <div
                      key={node.label}
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                      }}
                      className="absolute w-12 h-12 rounded-full bg-white border border-[#d8dbf8] shadow-sm flex flex-col items-center justify-center text-text hover:border-accent transition-colors"
                      title={node.label}
                    >
                      <Icon className="w-4 h-4 text-accent" />
                      <span className="text-[9px] font-mono font-medium text-text-tertiary mt-0.5">
                        {node.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
