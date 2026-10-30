"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      router.push(`/signup?email=${encodeURIComponent(email.trim())}`);
    }
  };

  return (
    <section className="pt-24 pb-12 sm:pt-32 sm:pb-16 bg-[#eef0ff] border-t border-[#d8dbf8] text-text font-sans select-none overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-accent">
            Get Started in Minutes
          </span>

          <h2 className="text-[40px] sm:text-[52px] font-bold tracking-[-0.03em] leading-[1.1] text-[#0b0b0c]">
            Prove your next fix
          </h2>

          <p className="text-[17px] sm:text-[19px] text-text-secondary max-w-[50ch] leading-relaxed">
            Stop arguing over false positives. Spin up deterministic reproducers and verify security patches with verifiable proof.
          </p>

          {/* Joined Email Pill CTA */}
          <div className="w-full max-w-md pt-2">
            <form
              onSubmit={handleSubmit}
              className="flex items-center w-full h-14 p-1.5 rounded-full bg-white border border-[#d8dbf8] shadow-md focus-within:ring-2 focus-within:ring-accent focus-within:border-accent transition-all"
            >
              <input
                type="email"
                placeholder="Enter your work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Work email address for early access"
                className="flex-1 h-full px-5 rounded-full bg-transparent text-[15px] text-[#0b0b0c] placeholder:text-text-tertiary focus:outline-none"
              />
              <button
                type="submit"
                className="h-11 px-6 rounded-full text-[14px] font-semibold bg-accent hover:bg-accent-hover text-white shadow-xs transition-colors whitespace-nowrap"
              >
                Start verifying
              </button>
            </form>
          </div>

          <div className="text-[13px] text-text-tertiary font-medium">
            No credit card. Demo project included.
          </div>
        </div>

        {/* Decorative Flat Concentric Rings / Chained Commit Motif SVG */}
        <div className="mt-16 sm:mt-20 max-w-3xl mx-auto flex items-center justify-center">
          <svg
            viewBox="0 0 800 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto text-accent"
          >
            {/* Horizontal Line connecting nodes */}
            <line
              x1="60"
              y1="80"
              x2="740"
              y2="80"
              stroke="#b8bfe6"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Left Ring 1: Baseline Commit */}
            <circle cx="200" cy="80" r="54" fill="white" stroke="#d8dbf8" strokeWidth="2" />
            <circle cx="200" cy="80" r="40" fill="#eef0ff" stroke="#5b6cff" strokeWidth="2" />
            <circle cx="200" cy="80" r="14" fill="#5b6cff" />
            <text
              x="200"
              y="150"
              textAnchor="middle"
              className="text-[11px] font-mono fill-slate-500 font-semibold"
            >
              baseline (vuln)
            </text>

            {/* Center Ring 2: Reproducer Harness */}
            <circle cx="400" cy="80" r="64" fill="white" stroke="#d8dbf8" strokeWidth="2" />
            <circle cx="400" cy="80" r="48" fill="#eef0ff" stroke="#5b6cff" strokeWidth="3" />
            <circle cx="400" cy="80" r="20" fill="#5b6cff" />
            <text
              x="400"
              y="156"
              textAnchor="middle"
              className="text-[11px] font-mono fill-slate-600 font-bold"
            >
              oracle test harness
            </text>

            {/* Right Ring 3: Verified Patch */}
            <circle cx="600" cy="80" r="54" fill="white" stroke="#d8dbf8" strokeWidth="2" />
            <circle cx="600" cy="80" r="40" fill="#eef0ff" stroke="#16a34a" strokeWidth="2" />
            <circle cx="600" cy="80" r="14" fill="#16a34a" />
            <text
              x="600"
              y="150"
              textAnchor="middle"
              className="text-[11px] font-mono fill-slate-500 font-semibold"
            >
              patch (verified)
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}

