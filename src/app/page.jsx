"use client";

import React, { useEffect } from "react";
import {
  Navbar,
  Hero,
  OpenToolingStrip,
  ProblemSection,
  WorkflowSection,
  FeaturesBentoGrid,
  VerificationMatrixSection,
  ProvenanceSection,
  SecurityModelSection,
  AudienceSection,
  PricingSection,
  FaqSection,
  FooterSection,
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
        <FeaturesBentoGrid />
        <VerificationMatrixSection />
        <ProvenanceSection />
        <SecurityModelSection />
        <AudienceSection />
        <PricingSection />
        <FaqSection />
      </main>
      <FooterSection />
    </div>
  );
}
