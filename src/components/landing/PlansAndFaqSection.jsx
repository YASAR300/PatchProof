"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PlansAndFaqSection() {
  const [openFaq, setOpenFaq] = useState(null);

  const plans = [
    {
      name: "Free Developer",
      tag: "Planned",
      description: "For individual engineers and open source maintainers verifying fixes locally.",
      features: [
        "Public GitHub repository scanning",
        "SARIF & Semgrep report ingestion",
        "Local Docker worker reproducer runner",
        "Standard test oracle validation",
        "Community forum support",
      ],
      isPopular: false,
    },
    {
      name: "Team",
      tag: "Planned",
      description: "For growing engineering teams establishing automated pull request verification.",
      features: [
        "Everything in Free Developer",
        "Automated GitHub Pull Request verification checks",
        "AI patch and reproducer synthesis assistant",
        "Team audit event logs & reviewer signoffs",
        "Shared evidence vault & PDF export",
        "Priority issue queue",
      ],
      isPopular: true,
    },
    {
      name: "Enterprise",
      tag: "Planned",
      description: "For security compliance teams requiring self-hosted workers and strict airgaps.",
      features: [
        "Everything in Team",
        "Self-hosted worker nodes & custom seccomp profiles",
        "Zero-egress airgapped verification clusters",
        "SAML SSO & fine-grained RBAC permissions",
        "Custom compliance proof retention policies",
        "Dedicated technical account manager",
      ],
      isPopular: false,
    },
  ];

  const faqs = [
    {
      q: "Does PatchProof replace Semgrep or Dependabot?",
      a: "No. PatchProof is designed to complement existing discovery tools. It ingests reports from scanners like Semgrep, SARIF files, and Dependabot/OSV advisories, and focuses on the missing step: empirically proving whether an issue is reproducible and whether your fix actually works.",
    },
    {
      q: "Does a verified fix mean my app is completely secure?",
      a: "No security tool can guarantee 100% security. PatchProof provides deterministic verification: 'Safe to merge for tested cases.' If a reproducer test checks for specific SQL tautologies and passes on candidate code without regression failures, you have proof that those tested attack vectors are neutralized.",
    },
    {
      q: "Does PatchProof run my code?",
      a: "Only when explicitly enabled by repository owners with local or allow-listed execution permissions. Repositories connected via GitHub default to 'Static analysis only. Test execution is disabled.' When enabled, reproducers run in isolated, disposable workers with zero network access.",
    },
    {
      q: "Do I need my own AI API key?",
      a: "No external AI key is required for core scanning, test execution, or verification reports. PatchProof's optional AI Assistant provides contextual explanations and patch suggestions using configured platform providers, but core verification remains strictly deterministic.",
    },
    {
      q: "Which languages and frameworks are supported first?",
      a: "Python (standard library, pytest, unittest, pip/requirements.txt) and JavaScript/TypeScript (Node.js, npm, package-lock.json, pnpm-lock.yaml) are natively supported in early access, with additional language runtimes scheduled on the roadmap.",
    },
    {
      q: "Is my code stored on external servers?",
      a: "No. For self-hosted and early access environments, repository analysis is performed within temporary ephemeral containers that are wiped immediately upon job completion. Evidence reports store only relevant diff snippets, commit SHAs, and test stdout traces.",
    },
  ];

  const toggleFaq = (idx) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-white border-t border-border/60 text-text font-sans select-none">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Plans Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-accent">
            Simple Roadmap
          </span>
          <h2 className="text-[36px] sm:text-[44px] font-bold tracking-[-0.025em] leading-[1.15] text-[#0b0b0c]">
            Plans for developers and security teams
          </h2>
          <p className="text-[17px] text-text-secondary">
            Transparent capabilities designed for transparent verification. All tiers are currently in planned early access.
          </p>
        </div>

        {/* 3 Plan Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-28">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-[20px] bg-[#fbfbfd] border flex flex-col justify-between space-y-8 shadow-xs ${
                plan.isPopular ? "border-accent ring-1 ring-accent" : "border-border"
              }`}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[22px] font-bold text-[#0b0b0c]">{plan.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-accent/10 text-accent border border-accent/20">
                    {plan.tag}
                  </span>
                </div>
                <p className="text-[14px] text-text-secondary leading-relaxed">
                  {plan.description}
                </p>
                <div className="pt-4 border-t border-border/60 space-y-3">
                  <div className="text-[12px] font-mono uppercase tracking-wider text-text-tertiary font-bold">
                    What's included:
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[14px] text-text-secondary">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <Link href="/signup" className="block w-full">
                  <Button
                    variant={plan.isPopular ? "primary" : "secondary"}
                    size="lg"
                    className="w-full justify-center"
                  >
                    Join early access
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Header & Accordion */}
        <div id="faq" className="scroll-mt-32 max-w-3xl mx-auto pt-8">
          <div className="text-center space-y-4 mb-12">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-accent">
              Frequently Asked Questions
            </span>
            <h2 className="text-[32px] sm:text-[38px] font-bold tracking-[-0.025em] leading-[1.15] text-[#0b0b0c]">
              Answers about verification integrity
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-[14px] border border-border bg-[#fbfbfd] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-[16px] text-[#0b0b0c] hover:text-accent transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-text-tertiary shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-[14px] text-text-secondary leading-relaxed border-t border-border/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

