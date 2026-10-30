"use client";

import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export function SemgrepPricing() {
  const tiers = [
    {
      name: "Community",
      badge: "Free Forever",
      description: "For individual developers and open-source GitHub repositories.",
      highlight: false,
      features: [
        "Public repository verification",
        "Semgrep OSS rules + OSV database feeds",
        "Automated pytest reproducer runs",
        "Community support & documentation",
      ],
      cta: "Start free",
    },
    {
      name: "Team",
      badge: "Most Popular",
      description: "For fast-moving engineering teams shipping code to production.",
      highlight: true,
      features: [
        "Private repository gating & webhooks",
        "Airgapped disposable micro-VM harnesses",
        "AI Security Assistant test synthesis",
        "Automated PR regression defense gates",
        "Priority email & chat SLA",
      ],
      cta: "Start 14-day trial",
    },
    {
      name: "Enterprise",
      badge: "Dedicated SLA",
      description: "For security-conscious organizations with compliance and audit demands.",
      highlight: false,
      features: [
        "Custom on-premise execution runners",
        "Cryptographic SHA-256 sealed proof bundles",
        "Fine-grained RBAC & audit log streaming",
        "Dedicated AppSec engineering reviews",
        "Custom enterprise SLAs",
      ],
      cta: "Contact security team",
    },
  ];

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-[#e2efe7] text-[#0e261d] select-none scroll-mt-14 border-t border-[#c8e2d4]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[12px] font-mono uppercase tracking-widest text-[#008456] font-bold">
            Transparent Pricing
          </span>
          <h2 className="text-[36px] sm:text-[48px] font-extrabold text-[#0e261d] tracking-tight">
            Plans built for every stage of growth
          </h2>
          <p className="text-[17px] text-[#2c4d3e]">
            Zero per-seat penalties. Pay only for the repositories and verification harnesses you run.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`p-8 rounded-[28px] bg-white flex flex-col justify-between space-y-8 transition-all ${
                tier.highlight
                  ? "border-2 border-[#008456] shadow-xl relative -translate-y-1"
                  : "border border-[#cde4d6] shadow-sm hover:border-[#b8dcce]"
              }`}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[24px] font-bold text-[#0e261d]">{tier.name}</h3>
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      tier.highlight
                        ? "bg-[#ecfdf5] text-[#008456] border border-[#a7f3d0]"
                        : "bg-[#f1f5f9] text-[#64748b]"
                    }`}
                  >
                    {tier.badge}
                  </span>
                </div>

                <p className="text-[14px] text-[#475569] leading-relaxed">{tier.description}</p>

                <div className="pt-4 border-t border-[#f1f5f9] space-y-3">
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-[14px] text-[#0e261d]">
                      <Check className="w-4 h-4 text-[#008456] flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/signup"
                  className={`w-full h-12 rounded-full text-[15px] font-bold flex items-center justify-center gap-2 transition-all ${
                    tier.highlight
                      ? "bg-[#008456] hover:bg-[#006b45] text-white shadow-md hover:shadow-lg"
                      : "bg-[#edf7f2] hover:bg-[#cde4d6] text-[#0e261d]"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
