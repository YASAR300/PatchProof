"use client";

import React, { useEffect } from "react";
import {
  Navbar,
  Hero,
  OpenToolingStrip,
  ProblemSection,
  WorkflowSection,
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
      className="min-h-screen bg-white text-[#1d1d1f] font-sans selection:bg-[#0071e3]/15 selection:text-[#0071e3]"
      data-theme="light"
    >
      <Navbar />
      <main>
        <Hero />
        <OpenToolingStrip />
        <ProblemSection />
        <WorkflowSection />
      </main>
      <footer className="py-12 bg-white border-t border-black/[0.08] text-center text-xs text-[#86868b] select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1d1d1f]">PatchProof</span>
            <span>&bull;</span>
            <span>Evidence-first security verification</span>
          </div>
          <div className="text-2xs font-mono text-black/40">
            Step 2 of 19 &bull; Landing Part 1
          </div>
        </div>
      </footer>
    </div>
  );
}
