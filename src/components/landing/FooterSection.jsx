"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function FooterSection() {
  const handleAnchorClick = (e, href) => {
    e.preventDefault();
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-[#ffffff] text-[#1d1d1f]">
      {/* Final CTA Band */}
      <div className="border-b border-black/[0.08] py-20 sm:py-28 bg-gradient-to-b from-[#ffffff] to-[#fbfbfd]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-[#1d1d1f] bg-black/[0.04] border border-black/[0.08]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
            Evidence-First Security
          </div>

          <h2 className="text-4xl sm:text-6xl font-semibold tracking-[-0.03em] leading-[1.08] text-[#1d1d1f]">
            Turn security alerts into concrete proof.
          </h2>

          <p className="text-base sm:text-lg text-[#86868b] max-w-xl mx-auto leading-relaxed">
            Stop arguing over false positives. Reproduce vulnerabilities with controlled tests and prove your fixes actually work.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm transition-all active:scale-95"
            >
              <span>Get started with PatchProof</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#workflow"
              onClick={(e) => handleAnchorClick(e, "#workflow")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-[#1d1d1f] hover:bg-black/5 border border-black/10 transition-colors"
            >
              Explore the workflow
            </a>
          </div>
        </div>
      </div>

      {/* Footer Navigation & Columns (only working anchors) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-black/[0.08]">
          {/* Brand Col */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <span className="font-semibold text-sm tracking-tight text-[#1d1d1f]">
                PatchProof
              </span>
            </div>
            <p className="text-xs text-[#86868b] max-w-xs leading-relaxed">
              Evidence-first security verification platform. Discovers flaws, reproduces them, validates fixes, and prevents regressions.
            </p>
          </div>

          {/* Product Col */}
          <div className="space-y-3">
            <div className="text-2xs font-mono uppercase tracking-wider text-[#86868b] font-semibold">
              Product
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="#product"
                  onClick={(e) => handleAnchorClick(e, "#product")}
                  className="text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  Capabilities
                </a>
              </li>
              <li>
                <a
                  href="#workflow"
                  onClick={(e) => handleAnchorClick(e, "#workflow")}
                  className="text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  Four-Act Workflow
                </a>
              </li>
              <li>
                <a
                  href="#evidence"
                  onClick={(e) => handleAnchorClick(e, "#evidence")}
                  className="text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  Verification Matrix
                </a>
              </li>
            </ul>
          </div>

          {/* Trust & Security Col */}
          <div className="space-y-3">
            <div className="text-2xs font-mono uppercase tracking-wider text-[#86868b] font-semibold">
              Security
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="#security"
                  onClick={(e) => handleAnchorClick(e, "#security")}
                  className="text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  Hardened Sandbox
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => handleAnchorClick(e, "#faq")}
                  className="text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  Security FAQ
                </a>
              </li>
              <li>
                <Link
                  href="/dev/ui"
                  className="text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  Dev Kitchen Sink
                </Link>
              </li>
            </ul>
          </div>

          {/* Plans Col */}
          <div className="space-y-3">
            <div className="text-2xs font-mono uppercase tracking-wider text-[#86868b] font-semibold">
              Access
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="#pricing"
                  onClick={(e) => handleAnchorClick(e, "#pricing")}
                  className="text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  Deployment Tiers
                </a>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  Join Early Access
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#86868b]">
          <div>
            &copy; {new Date().getFullYear()} PatchProof. All rights reserved.
          </div>
          <div className="font-mono text-xs text-[#1d1d1f] font-medium">
            PatchProof — built at Hacker House Goa
          </div>
        </div>
      </div>
    </footer>
  );
}
