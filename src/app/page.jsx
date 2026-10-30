"use client";

import React, { useEffect } from "react";
import {
  AnnouncementBar,
  MegaNavbar,
  HeroSection,
  ToolingStrip,
  WhyPatchProof,
  IconGridSection,
  TabbedLifecyclePanel,
  StickyLifecycleSection,
  WorkflowSection,
  RolesSection,
  EvidenceSwitcher,
  HardeningSection,
  PlansAndFaqSection,
  CtaSection,
  DarkFooter,
} from "@/components/landing";

export default function LandingPage() {
  useEffect(() => {
    // Force light theme on landing route
    const previousTheme = document.documentElement.getAttribute("data-theme");
    document.documentElement.setAttribute("data-theme", "light");

    return () => {
      if (previousTheme) {
        document.documentElement.setAttribute("data-theme", previousTheme);
      }
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-[#fbfbfd] text-[#0b0b0c] font-sans selection:bg-accent/15 selection:text-accent"
      data-theme="light"
    >
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-[8px] focus:bg-accent focus:text-white focus:outline-none focus:ring-2 focus:ring-accent text-xs font-bold"
      >
        Skip to content
      </a>

      {/* 0. Slim Announcement Bar */}
      <AnnouncementBar />

      {/* 1. Main Navbar with Mega Dropdowns */}
      <MegaNavbar />

      {/* Main Content Sections */}
      <main id="main-content">
        {/* 2. Hero Section with 2-weight H1, Email Pill, 3-Card Showcase */}
        <HeroSection />

        {/* 3. Tooling Strip (8 Plain-Text Chips) */}
        <ToolingStrip />

        {/* 4. Why PatchProof (Wide Content, 1100px Dashboard Frame) */}
        <WhyPatchProof />

        {/* 5. Icon Grid (4-Column Pillars) */}
        <IconGridSection />

        {/* 6. Tabbed Lifecycle Panel (Find, Prove, Fix) */}
        <TabbedLifecyclePanel />

        {/* 7. Lifecycle with Sticky Scroll-Spy Pill Nav & 4 Alternating Sections */}
        <StickyLifecycleSection />

        {/* 8. Works with your Workflow (Capability List & Connector Grid) */}
        <WorkflowSection />

        {/* 9. Built for Every Role (Developers, AppSec, Maintainers) */}
        <RolesSection />

        {/* 10. Evidence Switcher (3 Numerals + Auto-Advancing Progress Switcher) */}
        <EvidenceSwitcher />

        {/* 11. Execution Hardening (Checklist + Disposable Sandbox Diagram) */}
        <HardeningSection />

        {/* 12. Plans & FAQ Accordion */}
        <PlansAndFaqSection />

        {/* 13. CTA Section with Concentric Rings / Commit Motif */}
        <CtaSection />
      </main>

      {/* 14. Dark Footer */}
      <DarkFooter />
    </div>
  );
}
