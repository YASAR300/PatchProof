"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  FileCheck2,
  GitPullRequest,
  Package,
  Cpu,
  Bot,
  Activity,
  ScrollText,
  Lock,
  FileCode2,
  HelpCircle,
  CreditCard,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export function MegaNavbar() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAccordions, setMobileAccordions] = useState({
    product: false,
    workflow: false,
    security: false,
    resources: false,
  });

  const navRef = useRef(null);
  const triggerRefs = useRef({});

  // Close dropdown on click outside or Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && activeDropdown) {
        const trigger = triggerRefs.current[activeDropdown];
        setActiveDropdown(null);
        if (trigger) trigger.focus();
      }
    }

    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  const toggleDropdown = (key) => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  const toggleMobileAccordion = (key) => {
    setMobileAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-border shadow-xs select-none">
      <div
        ref={navRef}
        className="max-w-[1240px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between"
      >
        {/* Left: Brand Logo Lockup */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent rounded-sm">
            <Logo />
          </Link>

          {/* Desktop Mega-Menu Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 font-sans text-[14px] text-text font-medium">
            {/* 1. Product Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("product")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                ref={(el) => (triggerRefs.current["product"] = el)}
                onClick={() => toggleDropdown("product")}
                aria-expanded={activeDropdown === "product"}
                aria-haspopup="true"
                className={`flex items-center gap-1 px-3 py-2 rounded-[6px] hover:text-accent transition-colors ${
                  activeDropdown === "product" ? "text-accent bg-accent/5" : ""
                }`}
              >
                <span>Product</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === "product" ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {activeDropdown === "product" && (
                <div className="absolute top-full left-0 w-[580px] p-6 bg-white border border-border rounded-[12px] shadow-xl grid grid-cols-2 gap-6 mt-1 animate-in fade-in zoom-in-95 duration-150">
                  {/* Col 1: Products */}
                  <div className="space-y-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                      Products
                    </span>
                    <ul className="space-y-3">
                      <li>
                        <a
                          href="#detect"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-start gap-3 p-2 rounded-[8px] hover:bg-[#fbfbfd] transition-colors group"
                        >
                          <Search className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-text group-hover:text-accent text-[13px]">
                              Repository Security Scanner
                            </div>
                            <div className="text-[12px] text-text-secondary leading-snug">
                              Deep SAST analysis, AST rules, and SARIF ingestion.
                            </div>
                          </div>
                        </a>
                      </li>
                      <li>
                        <a
                          href="#prove"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-start gap-3 p-2 rounded-[8px] hover:bg-[#fbfbfd] transition-colors group"
                        >
                          <FileCheck2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-text group-hover:text-accent text-[13px]">
                              Automated Vulnerability Verification
                            </div>
                            <div className="text-[12px] text-text-secondary leading-snug">
                              Reproduces reported flaws in isolated test harnesses.
                            </div>
                          </div>
                        </a>
                      </li>
                      <li>
                        <a
                          href="#validate"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-start gap-3 p-2 rounded-[8px] hover:bg-[#fbfbfd] transition-colors group"
                        >
                          <GitPullRequest className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-text group-hover:text-accent text-[13px]">
                              Patch Validation
                            </div>
                            <div className="text-[12px] text-text-secondary leading-snug">
                              Before-and-after tests proving fixes neutralize threats.
                            </div>
                          </div>
                        </a>
                      </li>
                      <li>
                        <a
                          href="#detect"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-start gap-3 p-2 rounded-[8px] hover:bg-[#fbfbfd] transition-colors group"
                        >
                          <Package className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-text group-hover:text-accent text-[13px]">
                              Dependency Intelligence
                            </div>
                            <div className="text-[12px] text-text-secondary leading-snug">
                              Continuous call-tree reachability and OSV alerts.
                            </div>
                          </div>
                        </a>
                      </li>
                    </ul>
                  </div>

                  {/* Col 2: Platform */}
                  <div className="space-y-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                      Platform
                    </span>
                    <ul className="space-y-3">
                      <li>
                        <a
                          href="#product"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-start gap-3 p-2 rounded-[8px] hover:bg-[#fbfbfd] transition-colors group"
                        >
                          <Bot className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-text group-hover:text-accent text-[13px]">
                              AI Security Assistant
                            </div>
                            <div className="text-[12px] text-text-secondary leading-snug">
                              Context-aware patch synthesis and reproducer writing.
                            </div>
                          </div>
                        </a>
                      </li>
                      <li>
                        <a
                          href="#monitor"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-start gap-3 p-2 rounded-[8px] hover:bg-[#fbfbfd] transition-colors group"
                        >
                          <Activity className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-text group-hover:text-accent text-[13px]">
                              Continuous Monitoring
                            </div>
                            <div className="text-[12px] text-text-secondary leading-snug">
                              Automated regression gates for pull requests.
                            </div>
                          </div>
                        </a>
                      </li>
                      <li>
                        <a
                          href="#evidence"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-start gap-3 p-2 rounded-[8px] hover:bg-[#fbfbfd] transition-colors group"
                        >
                          <ScrollText className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-text group-hover:text-accent text-[13px]">
                              Security Evidence Dashboard
                            </div>
                            <div className="text-[12px] text-text-secondary leading-snug">
                              Immutable tamper-evident proof reports for audits.
                            </div>
                          </div>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Workflow Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("workflow")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                ref={(el) => (triggerRefs.current["workflow"] = el)}
                onClick={() => toggleDropdown("workflow")}
                aria-expanded={activeDropdown === "workflow"}
                aria-haspopup="true"
                className={`flex items-center gap-1 px-3 py-2 rounded-[6px] hover:text-accent transition-colors ${
                  activeDropdown === "workflow" ? "text-accent bg-accent/5" : ""
                }`}
              >
                <span>Workflow</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === "workflow" ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {activeDropdown === "workflow" && (
                <div className="absolute top-full left-0 w-[420px] p-5 bg-white border border-border rounded-[12px] shadow-xl space-y-3 mt-1 animate-in fade-in zoom-in-95 duration-150">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-accent px-2">
                    Verification Lifecycle
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="#detect"
                      onClick={() => setActiveDropdown(null)}
                      className="p-2.5 rounded-[8px] hover:bg-[#fbfbfd] transition-colors group"
                    >
                      <div className="font-semibold text-text group-hover:text-accent text-[13px]">
                        1. Find
                      </div>
                      <div className="text-[11px] text-text-secondary leading-snug">
                        Scan repos and ingest SARIF.
                      </div>
                    </a>
                    <a
                      href="#prove"
                      onClick={() => setActiveDropdown(null)}
                      className="p-2.5 rounded-[8px] hover:bg-[#fbfbfd] transition-colors group"
                    >
                      <div className="font-semibold text-text group-hover:text-accent text-[13px]">
                        2. Prove
                      </div>
                      <div className="text-[11px] text-text-secondary leading-snug">
                        Reproduce with real tests.
                      </div>
                    </a>
                    <a
                      href="#validate"
                      onClick={() => setActiveDropdown(null)}
                      className="p-2.5 rounded-[8px] hover:bg-[#fbfbfd] transition-colors group"
                    >
                      <div className="font-semibold text-text group-hover:text-accent text-[13px]">
                        3. Fix
                      </div>
                      <div className="text-[11px] text-text-secondary leading-snug">
                        Verify patches against suites.
                      </div>
                    </a>
                    <a
                      href="#evidence"
                      onClick={() => setActiveDropdown(null)}
                      className="p-2.5 rounded-[8px] hover:bg-[#fbfbfd] transition-colors group"
                    >
                      <div className="font-semibold text-text group-hover:text-accent text-[13px]">
                        4. Evidence
                      </div>
                      <div className="text-[11px] text-text-secondary leading-snug">
                        Preserve proof forever.
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Security Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("security")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                ref={(el) => (triggerRefs.current["security"] = el)}
                onClick={() => toggleDropdown("security")}
                aria-expanded={activeDropdown === "security"}
                aria-haspopup="true"
                className={`flex items-center gap-1 px-3 py-2 rounded-[6px] hover:text-accent transition-colors ${
                  activeDropdown === "security" ? "text-accent bg-accent/5" : ""
                }`}
              >
                <span>Security</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === "security" ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {activeDropdown === "security" && (
                <div className="absolute top-full left-0 w-[420px] p-5 bg-white border border-border rounded-[12px] shadow-xl space-y-3 mt-1 animate-in fade-in zoom-in-95 duration-150">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-accent px-2">
                    Security Architecture
                  </span>
                  <div className="space-y-1">
                    <a
                      href="#hardening"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-[8px] hover:bg-[#fbfbfd] transition-colors group"
                    >
                      <Cpu className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-text group-hover:text-accent text-[13px]">
                          Isolated Workers
                        </div>
                        <div className="text-[11px] text-text-secondary">
                          Zero network access, ephemeral micro-VMs, CPU & memory limits.
                        </div>
                      </div>
                    </a>
                    <a
                      href="#evidence"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-[8px] hover:bg-[#fbfbfd] transition-colors group"
                    >
                      <Lock className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-text group-hover:text-accent text-[13px]">
                          Provenance Labels
                        </div>
                        <div className="text-[11px] text-text-secondary">
                          Clear labels identifying scanner, test harness, and AI outputs.
                        </div>
                      </div>
                    </a>
                    <a
                      href="#limits"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-start gap-3 p-2.5 rounded-[8px] hover:bg-[#fbfbfd] transition-colors group"
                    >
                      <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-text group-hover:text-accent text-[13px]">
                          Verification Limits
                        </div>
                        <div className="text-[11px] text-text-secondary">
                          Deterministic contracts: safe to merge only for tested cases.
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Resources Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("resources")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                ref={(el) => (triggerRefs.current["resources"] = el)}
                onClick={() => toggleDropdown("resources")}
                aria-expanded={activeDropdown === "resources"}
                aria-haspopup="true"
                className={`flex items-center gap-1 px-3 py-2 rounded-[6px] hover:text-accent transition-colors ${
                  activeDropdown === "resources" ? "text-accent bg-accent/5" : ""
                }`}
              >
                <span>Resources</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === "resources" ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {activeDropdown === "resources" && (
                <div className="absolute top-full left-0 w-[360px] p-5 bg-white border border-border rounded-[12px] shadow-xl space-y-2 mt-1 animate-in fade-in zoom-in-95 duration-150">
                  <a
                    href="#workflow"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-3 p-2.5 rounded-[8px] hover:bg-[#fbfbfd] transition-colors group"
                  >
                    <FileCode2 className="w-4 h-4 text-accent shrink-0" />
                    <div>
                      <div className="font-semibold text-text group-hover:text-accent text-[13px]">
                        How it works
                      </div>
                      <div className="text-[11px] text-text-secondary">
                        Detailed breakdown of verification tests.
                      </div>
                    </div>
                  </a>
                  <a
                    href="#faq"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-3 p-2.5 rounded-[8px] hover:bg-[#fbfbfd] transition-colors group"
                  >
                    <HelpCircle className="w-4 h-4 text-accent shrink-0" />
                    <div>
                      <div className="font-semibold text-text group-hover:text-accent text-[13px]">
                        FAQ
                      </div>
                      <div className="text-[11px] text-text-secondary">
                        Technical answers and platform integrity.
                      </div>
                    </div>
                  </a>
                  <a
                    href="#pricing"
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-3 p-2.5 rounded-[8px] hover:bg-[#fbfbfd] transition-colors group"
                  >
                    <CreditCard className="w-4 h-4 text-accent shrink-0" />
                    <div>
                      <div className="font-semibold text-text group-hover:text-accent text-[13px]">
                        Plans
                      </div>
                      <div className="text-[11px] text-text-secondary">
                        Free developer, Team, and Enterprise tiers.
                      </div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* 5. Direct Pricing Link */}
            <a
              href="#pricing"
              className="px-3 py-2 rounded-[6px] hover:text-accent transition-colors"
            >
              Pricing
            </a>
          </nav>
        </div>

        {/* Right: CTA Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/login">
            <Button variant="secondary" size="md">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="md">
              Start verifying
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          className="lg:hidden p-2 rounded-[6px] text-text hover:bg-[#fbfbfd] transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Full-Screen Sheet with Accordions */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[72px] bottom-0 bg-white border-t border-border z-50 overflow-y-auto p-6 flex flex-col justify-between animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-4">
            {/* Product Accordion */}
            <div className="border-b border-border/60 pb-3">
              <button
                onClick={() => toggleMobileAccordion("product")}
                aria-expanded={mobileAccordions.product}
                className="w-full flex items-center justify-between py-2 text-base font-semibold text-text"
              >
                <span>Product</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mobileAccordions.product ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileAccordions.product && (
                <div className="pl-3 pt-2 space-y-2 text-sm text-text-secondary">
                  <a
                    href="#detect"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 hover:text-accent"
                  >
                    Repository Security Scanner
                  </a>
                  <a
                    href="#prove"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 hover:text-accent"
                  >
                    Automated Vulnerability Verification
                  </a>
                  <a
                    href="#validate"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 hover:text-accent"
                  >
                    Patch Validation
                  </a>
                  <a
                    href="#monitor"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 hover:text-accent"
                  >
                    Continuous Monitoring
                  </a>
                </div>
              )}
            </div>

            {/* Workflow Accordion */}
            <div className="border-b border-border/60 pb-3">
              <button
                onClick={() => toggleMobileAccordion("workflow")}
                aria-expanded={mobileAccordions.workflow}
                className="w-full flex items-center justify-between py-2 text-base font-semibold text-text"
              >
                <span>Workflow</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mobileAccordions.workflow ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileAccordions.workflow && (
                <div className="pl-3 pt-2 space-y-2 text-sm text-text-secondary">
                  <a
                    href="#detect"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 hover:text-accent"
                  >
                    1. Find (Detection)
                  </a>
                  <a
                    href="#prove"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 hover:text-accent"
                  >
                    2. Prove (Reproduction)
                  </a>
                  <a
                    href="#validate"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 hover:text-accent"
                  >
                    3. Fix (Patch Validation)
                  </a>
                  <a
                    href="#evidence"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 hover:text-accent"
                  >
                    4. Evidence (Proof Vault)
                  </a>
                </div>
              )}
            </div>

            {/* Security Accordion */}
            <div className="border-b border-border/60 pb-3">
              <button
                onClick={() => toggleMobileAccordion("security")}
                aria-expanded={mobileAccordions.security}
                className="w-full flex items-center justify-between py-2 text-base font-semibold text-text"
              >
                <span>Security</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mobileAccordions.security ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileAccordions.security && (
                <div className="pl-3 pt-2 space-y-2 text-sm text-text-secondary">
                  <a
                    href="#hardening"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 hover:text-accent"
                  >
                    Isolated Disposable Workers
                  </a>
                  <a
                    href="#evidence"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 hover:text-accent"
                  >
                    Provenance Labels & Integrity
                  </a>
                  <a
                    href="#limits"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 hover:text-accent"
                  >
                    Deterministic Limits
                  </a>
                </div>
              )}
            </div>

            {/* Resources Accordion */}
            <div className="border-b border-border/60 pb-3">
              <button
                onClick={() => toggleMobileAccordion("resources")}
                aria-expanded={mobileAccordions.resources}
                className="w-full flex items-center justify-between py-2 text-base font-semibold text-text"
              >
                <span>Resources</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mobileAccordions.resources ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileAccordions.resources && (
                <div className="pl-3 pt-2 space-y-2 text-sm text-text-secondary">
                  <a
                    href="#workflow"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 hover:text-accent"
                  >
                    How it works
                  </a>
                  <a
                    href="#faq"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 hover:text-accent"
                  >
                    FAQ
                  </a>
                  <a
                    href="#pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1.5 hover:text-accent"
                  >
                    Plans
                  </a>
                </div>
              )}
            </div>

            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-text hover:text-accent"
            >
              Pricing
            </a>
          </div>

          {/* Bottom CTAs in Mobile Sheet */}
          <div className="pt-8 space-y-3">
            <Link href="/signup" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="lg" className="w-full justify-center">
                Start verifying
              </Button>
            </Link>
            <Link href="/login" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" size="lg" className="w-full justify-center">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

