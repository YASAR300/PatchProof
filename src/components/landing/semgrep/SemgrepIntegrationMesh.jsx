"use client";

import React from "react";
import { ShieldCheck, Check } from "lucide-react";

export function SemgrepIntegrationMesh() {
  const nodes = [
    { label: "GitHub PRs", icon: "🐙", sub: "Automated Checks" },
    { label: "GitLab CI", icon: "🦊", sub: "Pipeline Runners" },
    { label: "VS Code / IDE", icon: "💻", sub: "Real-time Signals" },
    { label: "Airgapped VMs", icon: "🛡️", sub: "Isolated Harnesses" },
    { label: "Slack & Jira", icon: "💬", sub: "Proof Webhooks" },
    { label: "SOC2 Vault", icon: "🔒", sub: "SHA-256 Bundles" },
  ];

  return (
    <section id="integration-mesh" className="py-24 sm:py-32 bg-[#e2efe7] text-[#0e261d] select-none border-t border-[#c8e2d4] scroll-mt-14">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text: 5 cols */}
          <div className="lg:col-span-5 space-y-5">
            <span className="text-[12px] font-mono uppercase tracking-widest text-[#008456] font-bold">
              Workflow Mesh
            </span>
            <h2 className="text-[34px] sm:text-[44px] font-extrabold text-[#0e261d] leading-tight">
              Plugs right into your existing CI/CD pipelines
            </h2>
            <p className="text-[16px] text-[#2c4d3e] leading-relaxed">
              PatchProof fits cleanly between your static analysis discovery step and code merge. No agent installations on production hosts; no disruption to your engineering velocity.
            </p>

            <div className="pt-2 space-y-2.5 text-[14px] text-[#0e261d] font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#008456]" />
                <span>Runs as a lightweight GitHub Action or GitLab CI step</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#008456]" />
                <span>Publishes clean, deterministic proof badges directly to PR comments</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#008456]" />
                <span>Zero outbound secrets or production token exposure</span>
              </div>
            </div>
          </div>

          {/* Right Visual Mesh: 7 cols (Sage Container like Semgrep) */}
          <div className="lg:col-span-7 rounded-[32px] bg-[#d3e8dc] border border-[#bcdbc9] p-8 sm:p-10 shadow-xl relative overflow-hidden">
            {/* Center Node */}
            <div className="flex flex-col items-center justify-center p-6 rounded-[22px] bg-gradient-to-b from-[#ecfdf5] to-white border-2 border-[#008456] shadow-md mb-8 max-w-xs mx-auto text-center">
              <div className="w-12 h-12 rounded-[12px] bg-[#008456] text-white flex items-center justify-center shadow-sm mb-2">
                <ShieldCheck className="w-7 h-7 text-white stroke-[2.2]" />
              </div>
              <h3 className="text-[17px] font-bold text-[#065f46]">
                PatchProof Engine
              </h3>
              <p className="text-[12px] font-mono text-[#008456] font-bold">
                Airgapped Reproducer &amp; Validator
              </p>
            </div>

            {/* Surrounding Connected Nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {nodes.map((node) => (
                <div
                  key={node.label}
                  className="p-3.5 rounded-[16px] bg-white border border-[#b8dec9] text-center space-y-1 hover:border-[#008456] transition-colors shadow-2xs"
                >
                  <span className="text-[22px]">{node.icon}</span>
                  <p className="text-[13px] font-bold text-[#0e261d]">{node.label}</p>
                  <p className="text-[11px] font-mono text-[#64748b]">{node.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
