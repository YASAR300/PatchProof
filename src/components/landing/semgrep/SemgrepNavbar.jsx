"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, ChevronDown, Menu, X, ArrowRight } from "lucide-react";

export function SemgrepNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#0b241c] text-white text-[12px] sm:text-[13px] py-2 px-4 sm:px-8 font-medium select-none border-b border-[#13382c]">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#a7f3d0]">PatchProof Engine is live. Scan &amp; verify code the moment it’s written.</span>
            <span className="text-[#34d399]">•</span>
            <a
              href="#interactive-demo"
              className="text-white hover:text-[#a7f3d0] underline transition-colors inline-flex items-center gap-1 font-semibold"
            >
              Learn more <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="hidden lg:flex items-center gap-5 text-[12px] text-slate-300">
            <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
            <a href="#platform-spotlight" className="hover:text-white transition-colors">Product support</a>
            <a href="#get-started" className="hover:text-white transition-colors">Contact us</a>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar on Semgrep's Sage Background */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 select-none ${
          scrolled
            ? "bg-[#e2efe7]/95 backdrop-blur-md border-b border-[#c8e2d4] shadow-xs"
            : "bg-[#e2efe7] border-b border-transparent"
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between">
          {/* Left: Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008456] rounded-lg p-1"
          >
            <div className="w-8 h-8 rounded-[8px] bg-[#0B0B0D] text-white flex items-center justify-center shadow-xs">
              <svg width="22" height="22" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                <path d="M12 12C12 12 28 8 30 8V56C25 53 12 43 12 28V12Z" fill="#FFFFFF" />
                <path d="M52 12C52 12 36 8 34 8V56C39 53 52 43 52 28V12Z" fill="#5B6CFF" />
                <rect x="26" y="16" width="12" height="3" rx="1.5" fill="#0B0B0D" />
                <rect x="26" y="26" width="12" height="3" rx="1.5" fill="#0B0B0D" />
                <rect x="26" y="36" width="12" height="3" rx="1.5" fill="#0B0B0D" />
                <path d="M22 30L29 37L44 20" stroke="#0B0B0D" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[20px] font-bold tracking-tight text-[#0e261d] font-sans">
              Patch<span className="text-[#5B6CFF]">Proof</span>
            </span>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-[14px] font-medium text-[#1f4033]">
            <a
              href="#platform-spotlight"
              className="hover:text-[#008456] transition-colors inline-flex items-center gap-1"
            >
              Platform <ChevronDown className="w-3.5 h-3.5 text-[#4e7464]" />
            </a>
            <a
              href="#features"
              className="hover:text-[#008456] transition-colors inline-flex items-center gap-1"
            >
              Capabilities <ChevronDown className="w-3.5 h-3.5 text-[#4e7464]" />
            </a>
            <a href="#interactive-demo" className="hover:text-[#008456] transition-colors">
              Deploy
            </a>
            <a href="#integration-mesh" className="hover:text-[#008456] transition-colors">
              Integrations
            </a>
            <a href="#pricing" className="hover:text-[#008456] transition-colors">
              Pricing
            </a>
            <a href="#platform-spotlight" className="hover:text-[#008456] transition-colors">
              Docs
            </a>
          </nav>

          {/* Right CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="#get-started"
              className="text-[14px] font-semibold text-[#0e261d] hover:text-[#008456] px-4 py-2 rounded-full border border-[#b8dcce] hover:border-[#008456] transition-all bg-white shadow-2xs"
            >
              Book demo
            </a>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center h-10 px-5 rounded-full text-[14px] font-bold bg-[#008456] hover:bg-[#006b45] text-white shadow-sm transition-all hover:shadow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008456] focus-visible:ring-offset-2"
            >
              Try for free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-[#0e261d] hover:bg-[#cde4d6] rounded-md transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#e2efe7] border-b border-[#c8e2d4] px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col space-y-3 text-[15px] font-semibold text-[#0e261d]">
              <a
                href="#platform-spotlight"
                onClick={() => setMobileOpen(false)}
                className="py-1 hover:text-[#008456]"
              >
                Platform Overview
              </a>
              <a
                href="#features"
                onClick={() => setMobileOpen(false)}
                className="py-1 hover:text-[#008456]"
              >
                Capabilities
              </a>
              <a
                href="#interactive-demo"
                onClick={() => setMobileOpen(false)}
                className="py-1 hover:text-[#008456]"
              >
                Interactive Demo
              </a>
              <a
                href="#integration-mesh"
                onClick={() => setMobileOpen(false)}
                className="py-1 hover:text-[#008456]"
              >
                Integrations
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileOpen(false)}
                className="py-1 hover:text-[#008456]"
              >
                Pricing
              </a>
            </nav>

            <div className="pt-4 border-t border-[#c8e2d4] flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 text-[14px] font-semibold text-[#0e261d] rounded-lg bg-white/60 hover:bg-white"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 text-[14px] font-bold bg-[#008456] text-white rounded-full shadow-sm hover:bg-[#006b45]"
              >
                Start verifying
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
