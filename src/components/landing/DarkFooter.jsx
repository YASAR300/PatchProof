"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export function DarkFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0b0b0c] text-slate-300 font-sans border-t border-white/[0.08] select-none">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-16 pb-12">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-16 border-b border-white/[0.08]">
          {/* Brand Col (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block focus:outline-none">
              <Logo />
            </Link>
            <p className="text-[14px] text-slate-400 max-w-[32ch] leading-relaxed">
              Evidence-first security verification. Reproducing vulnerabilities and proving fixes with immutable test records.
            </p>
          </div>

          {/* Col 1: Product */}
          <div className="space-y-3">
            <div className="text-[12px] font-mono uppercase tracking-wider text-white font-semibold">
              Product
            </div>
            <ul className="space-y-2 text-[13px] text-slate-400">
              <li>
                <a href="#detect" className="hover:text-white transition-colors">
                  Security Scanner
                </a>
              </li>
              <li>
                <a href="#prove" className="hover:text-white transition-colors">
                  Vulnerability Verifier
                </a>
              </li>
              <li>
                <a href="#validate" className="hover:text-white transition-colors">
                  Patch Validation
                </a>
              </li>
              <li>
                <a href="#monitor" className="hover:text-white transition-colors">
                  Continuous Monitoring
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Workflow */}
          <div className="space-y-3">
            <div className="text-[12px] font-mono uppercase tracking-wider text-white font-semibold">
              Workflow
            </div>
            <ul className="space-y-2 text-[13px] text-slate-400">
              <li>
                <a href="#detect" className="hover:text-white transition-colors">
                  1. Find & Ingest
                </a>
              </li>
              <li>
                <a href="#prove" className="hover:text-white transition-colors">
                  2. Reproduce
                </a>
              </li>
              <li>
                <a href="#validate" className="hover:text-white transition-colors">
                  3. Verify Fix
                </a>
              </li>
              <li>
                <a href="#evidence" className="hover:text-white transition-colors">
                  4. Evidence Vault
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Security */}
          <div className="space-y-3">
            <div className="text-[12px] font-mono uppercase tracking-wider text-white font-semibold">
              Security
            </div>
            <ul className="space-y-2 text-[13px] text-slate-400">
              <li>
                <a href="#hardening" className="hover:text-white transition-colors">
                  Isolated Workers
                </a>
              </li>
              <li>
                <a href="#evidence" className="hover:text-white transition-colors">
                  Provenance Labels
                </a>
              </li>
              <li>
                <a href="#limits" className="hover:text-white transition-colors">
                  Verification Limits
                </a>
              </li>
              <li>
                <a href="#hardening" className="hover:text-white transition-colors">
                  Airgap Execution
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Resources */}
          <div className="space-y-3">
            <div className="text-[12px] font-mono uppercase tracking-wider text-white font-semibold">
              Resources
            </div>
            <ul className="space-y-2 text-[13px] text-slate-400">
              <li>
                <a href="#workflow" className="hover:text-white transition-colors">
                  How it works
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Plans
                </a>
              </li>
              <li>
                <Link href="/app" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Row: Ready to verify your first fix? */}
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/[0.08]">
          <div className="text-[16px] font-semibold text-white">
            Ready to verify your first fix?
          </div>
          <Link href="/signup">
            <Button variant="primary" size="md">
              Start verifying <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Legal Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-slate-500 font-mono">
          <div>
            © {currentYear} PatchProof. All rights reserved.
          </div>
          <div>
            PatchProof, built at Hacker House Goa.
          </div>
        </div>
      </div>
    </footer>
  );
}

