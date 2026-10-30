"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ArrowRight } from "lucide-react";

const TIERS = [
  {
    name: "Free developer",
    description: "For individual developers, security researchers, and open-source projects.",
    badge: "Planned",
    highlight: false,
    features: [
      "Public repository verification",
      "Manual reproducer triggering",
      "Semgrep OSS & OSV engine feeds",
      "Community support & docs",
    ],
  },
  {
    name: "Team",
    description: "For growing engineering and security teams deploying to production.",
    badge: "Planned",
    highlight: true,
    features: [
      "Private repository verification",
      "Automated pull request gating",
      "Isolated container harness execution",
      "AI Security Assistant reproducer synthesis",
      "Standard email & chat SLA",
    ],
  },
  {
    name: "Enterprise",
    description: "For security-conscious organizations with compliance and audit demands.",
    badge: "Planned",
    highlight: false,
    features: [
      "Custom on-premise execution runners",
      "SOC2 tamper-evident export bundles",
      "Fine-grained RBAC & audit streaming",
      "Dedicated AppSec engineering SLA",
      "Custom security review workflow",
    ],
  },
];

const FAQS = [
  {
    q: "Does PatchProof replace Semgrep or Dependabot?",
    a: "No. PatchProof integrates with Semgrep, OSV, and existing scanners to ingest candidate findings, then executes reproduction tests and verifies candidate patches.",
  },
  {
    q: "Does a verified fix mean my app is secure?",
    a: "No. Verification proves that the specific reproduced exploit vector is closed and normal test suites pass. It qualifies safety for tested cases rather than providing an absolute guarantee.",
  },
  {
    q: "Does it run my code?",
    a: "Yes. Verification scripts run in isolated, disposable worker environments with strict CPU/memory limits and zero network access during execution.",
  },
  {
    q: "Do I need an AI key?",
    a: "No. PatchProof includes built-in assistance for synthesizing pytest reproduction scripts without requiring personal OpenAI or Anthropic API credentials.",
  },
  {
    q: "Which languages first?",
    a: "Python (pytest) and JavaScript/TypeScript (Jest, Vitest) are supported first, with Go and Rust planned for upcoming releases.",
  },
  {
    q: "Is my code stored?",
    a: "No persistent source code is retained. Repositories are cloned into ephemeral execution containers and discarded immediately after verification logs are generated.",
  },
];

export function ClosingSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const handleScrollToWorkflow = (e) => {
    e.preventDefault();
    const target = document.getElementById("workflow");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="pricing" className="bg-[#fbfbfd] text-[#1d1d1f] border-t border-black/[0.06] select-none scroll-mt-14">
      {/* 1. Pricing Subsection */}
      <div className="py-24 sm:py-28 max-w-[1240px] mx-auto px-4 sm:px-6 space-y-16">
        {/* Single line audience banner */}
        <p className="text-center text-[16px] sm:text-[18px] font-medium text-[#1d1d1f] max-w-3xl mx-auto leading-relaxed">
          Built for SaaS engineering teams, software companies, open-source maintainers and application-security teams.
        </p>

        {/* Pricing Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-wider text-[#6e6e73] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Transparent Tiers
          </div>
          <h2 className="text-[34px] sm:text-[48px] lg:text-[64px] font-semibold tracking-[-0.025em] leading-[1.05] text-[#1d1d1f]">
            Simple plans for every stage.
          </h2>
        </div>

        {/* Pricing: Three Large Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`p-8 rounded-[16px] bg-white flex flex-col justify-between space-y-8 ${
                tier.highlight
                  ? "border-2 border-accent shadow-lg -translate-y-1 relative"
                  : "border border-black/[0.08] shadow-sm"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[22px] font-semibold text-[#1d1d1f]">
                    {tier.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#f5f5f7] text-[#6e6e73] border border-black/[0.08]">
                    {tier.badge}
                  </span>
                </div>

                <p className="text-[14px] text-[#6e6e73] leading-relaxed">
                  {tier.description}
                </p>

                <div className="pt-4 border-t border-black/[0.08] space-y-3">
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-[14px] text-[#1d1d1f]">
                      <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/signup"
                  className={`w-full h-12 rounded-[10px] text-[15px] font-semibold inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    tier.highlight
                      ? "bg-accent text-accent-foreground hover:bg-accent-hover shadow-sm"
                      : "bg-[#f5f5f7] hover:bg-[#ebecee] text-[#1d1d1f] border border-black/[0.08]"
                  }`}
                >
                  Join early access
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. FAQ Subsection (id="faq") */}
      <div id="faq" className="py-20 sm:py-24 bg-[#f5f5f7] border-t border-black/[0.06] scroll-mt-14">
        <div className="max-w-[880px] mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-wider text-[#6e6e73] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Frequently Asked Questions
            </div>
            <h2 className="text-[34px] sm:text-[44px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">
              Everything you need to know.
            </h2>
          </div>

          {/* Accordion with 18px questions */}
          <div className="divide-y divide-black/[0.08] border-y border-black/[0.08] bg-white rounded-[16px] px-6 shadow-sm border">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="py-5">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md py-1"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[18px] font-semibold text-[#1d1d1f] group-hover:text-accent transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#6e6e73] flex-shrink-0 transition-transform duration-150 ${
                        isOpen ? "rotate-180 text-accent" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="mt-3 text-[15px] text-[#6e6e73] leading-relaxed pr-6">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Full-Bleed Solid Accent Closing Block */}
      <div className="bg-accent text-white py-24 sm:py-28 select-none">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-[40px] sm:text-[56px] lg:text-[68px] font-semibold tracking-[-0.03em] leading-[1.02] text-white">
            Turn security alerts into proof.
          </h2>
          <p className="text-[20px] sm:text-[22px] text-white/80 leading-[1.45] max-w-[60ch] mx-auto">
            Stop guessing which vulnerabilities matter. Start merging verified code on every pull request.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto h-[52px] px-9 rounded-[10px] text-[16px] font-semibold bg-white text-accent hover:bg-white/95 transition-colors inline-flex items-center justify-center gap-2 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Start verifying
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#workflow"
              onClick={handleScrollToWorkflow}
              className="w-full sm:w-auto h-[52px] px-8 rounded-[10px] text-[16px] font-semibold text-white hover:text-white/80 transition-colors inline-flex items-center justify-center underline decoration-white/30 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Explore the workflow
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

