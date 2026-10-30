"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="py-10 sm:py-12 bg-[#fbfbfd] text-[#6e6e73] border-t border-black/[0.08] select-none text-[13px]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-black/[0.06]">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#0f172a] text-white flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
              PatchProof
            </span>
          </div>

          {/* Working In-Page Navigation Anchors */}
          <nav className="flex flex-wrap items-center gap-6 font-medium" aria-label="Footer Navigation">
            <a href="#product" className="hover:text-[#1d1d1f] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
              Product
            </a>
            <a href="#workflow" className="hover:text-[#1d1d1f] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
              Workflow
            </a>
            <a href="#evidence" className="hover:text-[#1d1d1f] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
              Evidence
            </a>
            <a href="#security" className="hover:text-[#1d1d1f] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
              Security
            </a>
            <a href="#pricing" className="hover:text-[#1d1d1f] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
              Pricing
            </a>
            <a href="#faq" className="hover:text-[#1d1d1f] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
              FAQ
            </a>
            <Link href="/login" className="hover:text-[#1d1d1f] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-[#1d1d1f] transition-colors text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
              Get started
            </Link>
          </nav>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[12px] text-[#6e6e73]">
          <p>© {new Date().getFullYear()} PatchProof Inc. All rights reserved.</p>
          <p className="max-w-md">
            Evidence-first vulnerability verification for software engineering teams.
          </p>
        </div>
      </div>
    </footer>
  );
}
