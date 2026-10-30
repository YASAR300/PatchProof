"use client";

import React from "react";
import { FindingsScene } from "./scenes/FindingsScene";

export function WhyPatchProof() {
  return (
    <section className="py-24 sm:py-32 bg-white text-text font-sans select-none">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-accent">
            Why PatchProof
          </span>
          <h2 className="text-[36px] sm:text-[46px] font-bold tracking-[-0.025em] leading-[1.15] text-[#0b0b0c]">
            Built for developers, trusted by security
          </h2>
          <p className="text-[17px] sm:text-[19px] text-text-secondary leading-[1.5]">
            Security tools drown teams in unverified alerts and hypothetical risks. PatchProof converts every finding into an isolated reproducer and validates the fix before you merge.
          </p>
        </div>

        {/* 1100px Wide Product Frame inside soft tinted wash */}
        <div className="max-w-[1120px] mx-auto p-3 sm:p-6 rounded-[24px] bg-[#eef0ff] border border-[#d8dbf8] shadow-lg">
          <FindingsScene className="shadow-2xl" />
          <div className="mt-3 text-center">
            <span className="text-[11px] font-mono text-text-tertiary">
              Illustrative, not a live scan.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

