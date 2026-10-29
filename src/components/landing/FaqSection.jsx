"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

const FAQS = [
  {
    q: "Does PatchProof replace Semgrep or Dependabot?",
    a: "No, it builds on existing scanners. PatchProof ingests findings from tools like Semgrep, Dependabot, and OSV databases, and takes the crucial next step: automatically attempting to reproduce them with controlled tests to prove whether they actually trigger in your application.",
  },
  {
    q: "Does a verified fix mean my app is secure?",
    a: "No, only the tested cases. PatchProof verifies that the candidate patch neutralizes the specific exploit payload tested while leaving your baseline test suites unbroken. Security is continuous and layered; no automated tool can guarantee universal immunity against untried exploit variants.",
  },
  {
    q: "Does it run my code?",
    a: "Only in isolated workers, only for allowed repositories. Reproduction harnesses and test suites execute strictly inside ephemeral sandboxed containers with network egress completely blocked, unprivileged users, and zero host mounts.",
  },
  {
    q: "Do I need an AI key?",
    a: "No, it is optional. All core static analysis, harness execution, deterministic test validation, and evidence generation work completely without any language model or external AI key.",
  },
  {
    q: "Which languages are supported first?",
    a: "Python and JavaScript/TypeScript. These ecosystems represent the initial launch target for automated exploit harness synthesis and regression test tracking. Additional runtimes like Go and Rust are on our roadmap.",
  },
  {
    q: "Is my code stored?",
    a: "Only verification metadata, findings, and evidence logs are stored permanently. Your application source code is temporarily cloned only into ephemeral, isolated execution workers that are completely destroyed immediately upon run completion.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 sm:py-36 bg-[#ffffff] text-[#1d1d1f] border-b border-black/[0.08]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#0071e3] mb-3 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
            Frequently Answered Questions
          </div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.1] text-[#1d1d1f]">
            Direct answers. No hand-waving.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#86868b] leading-relaxed">
            Honest security software starts with straightforward answers about how it operates.
          </p>
        </div>

        {/* Accordion */}
        <div className="divide-y divide-black/[0.08] border-y border-black/[0.08]">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.q} className="py-5 sm:py-6">
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between text-left gap-4 group focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-medium text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">
                    {faq.q}
                  </span>
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full bg-black/[0.04] flex items-center justify-center text-[#1d1d1f] transition-transform duration-200 flex-shrink-0",
                      isOpen && "rotate-180 bg-[#0071e3] text-white"
                    )}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-3 pr-8 text-xs sm:text-sm text-[#86868b] leading-relaxed animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
