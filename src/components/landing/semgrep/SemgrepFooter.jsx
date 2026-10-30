"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function SemgrepFooter() {
  return (
    <footer className="bg-[#081813] text-[#94a3b8] py-16 sm:py-20 text-[13px] select-none border-t border-[#133025]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand: 4 cols */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[8px] bg-[#133025] text-white flex items-center justify-center shadow-xs">
                <svg width="22" height="22" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <path d="M12 12C12 12 28 8 30 8V56C25 53 12 43 12 28V12Z" fill="#FFFFFF" />
                  <path d="M52 12C52 12 36 8 34 8V56C39 53 52 43 52 28V12Z" fill="#5B6CFF" />
                  <rect x="26" y="16" width="12" height="3" rx="1.5" fill="#081813" />
                  <rect x="26" y="26" width="12" height="3" rx="1.5" fill="#081813" />
                  <rect x="26" y="36" width="12" height="3" rx="1.5" fill="#081813" />
                  <path d="M22 30L29 37L44 20" stroke="#081813" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[20px] font-bold tracking-tight text-white font-sans">
                Patch<span className="text-[#5B6CFF]">Proof</span>
              </span>
            </div>
            <p className="text-[14px] text-[#94a3b8] leading-relaxed max-w-sm">
              Code security for builders and security teams. Reproducing vulnerabilities, verifying candidate fixes, and preserving evidence on every pull request.
            </p>
          </div>

          {/* 4 Link Columns: 8 cols */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="space-y-3">
              <p className="font-bold text-white uppercase text-[12px] tracking-wider font-mono">
                Platform
              </p>
              <ul className="space-y-2">
                <li><a href="#platform-spotlight" className="hover:text-white transition-colors">Unified Console</a></li>
                <li><a href="#interactive-demo" className="hover:text-white transition-colors">CI/CD Deploy</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">SAST Discovery</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Call-Tree SCA</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">PR Quality Gates</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="font-bold text-white uppercase text-[12px] tracking-wider font-mono">
                Verification
              </p>
              <ul className="space-y-2">
                <li><a href="#interactive-demo" className="hover:text-white transition-colors">Pytest Reproducers</a></li>
                <li><a href="#platform-spotlight" className="hover:text-white transition-colors">Airgapped Runners</a></li>
                <li><a href="#platform-spotlight" className="hover:text-white transition-colors">SHA-256 Proof Seals</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">AI Test Synthesis</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="font-bold text-white uppercase text-[12px] tracking-wider font-mono">
                Solutions
              </p>
              <ul className="space-y-2">
                <li><a href="#pricing" className="hover:text-white transition-colors">For Developers</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">For AppSec Teams</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">For Open Source</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Enterprise SLA</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="font-bold text-white uppercase text-[12px] tracking-wider font-mono">
                Access
              </p>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-white transition-colors">Sign in</Link></li>
                <li><Link href="/signup" className="text-[#34d399] hover:underline font-bold">Start verifying</Link></li>
                <li><a href="#platform-spotlight" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#platform-spotlight" className="hover:text-white transition-colors">Security Disclaimers</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#133025] flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#64748b]">
          <p>© {new Date().getFullYear()} PatchProof Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer">Privacy Notice</span>
            <span className="hover:text-white cursor-pointer">Security Terms</span>
            <span className="hover:text-white cursor-pointer">Status: Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
