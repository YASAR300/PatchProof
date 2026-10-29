"use client";

import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function PricingSection() {
  const tiers = [
    {
      name: "Free developer",
      tagline: "For individual engineers and open-source contributors.",
      features: [
        "Local scanning",
        "Basic verification",
        "Evidence reports",
        "Command-line workflow",
      ],
      featured: false,
    },
    {
      name: "Team",
      tagline: "For collaborative engineering organizations.",
      features: [
        "Shared repositories",
        "Hosted verification jobs",
        "Team dashboards",
        "GitHub integration",
        "Audit history",
      ],
      featured: true,
    },
    {
      name: "Enterprise",
      tagline: "For scale and strict compliance environments.",
      features: [
        "Private execution infrastructure",
        "Advanced access controls",
        "Custom policies",
        "Retention controls",
        "Custom integrations",
      ],
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 sm:py-36 bg-[#fbfbfd] text-[#1d1d1f] border-b border-black/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#0071e3] mb-3 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
            Deployment Tiers
          </div>
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#1d1d1f]">
            Simple plans. Verifiable results.
          </h2>
          <p className="mt-4 text-lg text-[#86868b] leading-relaxed">
            Every plan includes deterministic test verification. Join our early access program today.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
                tier.featured
                  ? "bg-white border-2 border-[#0071e3] shadow-lg relative"
                  : "bg-white border border-black/[0.08] shadow-sm hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">{tier.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-mono uppercase tracking-wider font-semibold bg-black/5 text-[#1d1d1f] border border-black/10">
                    Planned
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#86868b] mb-6 leading-relaxed">
                  {tier.tagline}
                </p>

                <div className="space-y-3 pt-4 border-t border-black/[0.06]">
                  {tier.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-xs sm:text-sm text-[#1d1d1f]">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-black/[0.06]">
                <Link
                  href="/signup"
                  className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-semibold transition-all ${
                    tier.featured
                      ? "bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm"
                      : "bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f]"
                  }`}
                >
                  <span>Join early access</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
