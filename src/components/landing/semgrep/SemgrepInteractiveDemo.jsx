"use client";

import React, { useState } from "react";
import { CheckCircle2, Terminal, GitPullRequest, Check, ArrowRight } from "lucide-react";

export function SemgrepInteractiveDemo() {
  const [activePlatform, setActivePlatform] = useState(0);

  const platforms = [
    {
      name: "GitHub Actions",
      badge: "RECOMMENDED",
      code: `name: PatchProof Verification
on: [pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: patchproof/verify-action@v1
        with:
          strict-regression-defense: true`,
    },
    {
      name: "GitLab CI",
      badge: "NATIVE",
      code: `patchproof_verification:
  image: patchproof/runner:latest
  stage: test
  script:
    - patchproof verify --pr $CI_MERGE_REQUEST_IID
  only:
    - merge_requests`,
    },
    {
      name: "Local CLI",
      badge: "DEVELOPER",
      code: `$ npm install -g patchproof
$ patchproof scan --repo .
$ patchproof harness run --finding CVE-2024-4821
✓ Exploit neutralized on candidate commit 3e9f1a0
✓ Safe to merge (for tested cases)`,
    },
  ];

  const current = platforms[activePlatform];

  return (
    <section id="interactive-demo" className="py-24 sm:py-32 bg-[#e2efe7] text-[#0e261d] select-none scroll-mt-14 border-t border-[#c8e2d4]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[12px] font-mono uppercase tracking-widest text-[#008456] font-bold">
            Zero-friction deployment
          </span>
          <h2 className="text-[36px] sm:text-[48px] lg:text-[60px] font-extrabold tracking-tight leading-[1.05] text-[#0e261d]">
            Deploy in 5 minutes.<br />Verify on every commit.
          </h2>
          <p className="text-[18px] sm:text-[21px] text-[#2c4d3e] leading-relaxed max-w-[58ch] mx-auto">
            Integrates into your existing continuous integration pipeline with 3 lines of configuration.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-white border border-[#b8dcce] shadow-xs">
            {platforms.map((p, idx) => {
              const isActive = idx === activePlatform;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setActivePlatform(idx)}
                  className={`px-5 py-2 rounded-full text-[13px] sm:text-[14px] font-bold transition-all ${
                    isActive
                      ? "bg-[#008456] text-white shadow-xs"
                      : "text-[#2c4d3e] hover:text-[#0e261d] hover:bg-[#edf7f2]"
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Large White Container (Split Left Copy + Right CI Output / GitHub PR Mock) */}
        <div className="rounded-[28px] bg-white border border-[#cde4d6] shadow-xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Details: 5 cols */}
          <div className="lg:col-span-5 space-y-5">
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-[#ecfdf5] text-[#008456] border border-[#a7f3d0]">
              {current.badge}
            </span>
            <h3 className="text-[26px] sm:text-[32px] font-bold text-[#0e261d] leading-tight">
              Automatic pull request verification gates
            </h3>
            <p className="text-[15px] sm:text-[16px] text-[#475569] leading-relaxed">
              When a developer submits a pull request, PatchProof spins up an ephemeral airgapped runner, executes candidate fix evaluation, and comments with clean proof.
            </p>

            <div className="pt-2 space-y-2 text-[14px] font-medium text-[#0e261d]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#008456]" />
                <span>Deterministic reproducibility in isolated containers</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#008456]" />
                <span>Blocks merges if a security test experiences regression</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#008456]" />
                <span>Zero persistent secrets or production database access</span>
              </div>
            </div>
          </div>

          {/* Right GitHub Check Mock + Code Snippet: 7 cols */}
          <div className="lg:col-span-7 space-y-4">
            {/* GitHub PR Check Mockup */}
            <div className="p-4 rounded-[14px] bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                <div className="flex items-center gap-2">
                  <GitPullRequest className="w-4 h-4 text-[#008456]" />
                  <span className="font-mono text-[13px] font-bold text-[#0e261d]">
                    Pull Request #184 — Commit 3e9f1a0
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#008456]">All checks passed</span>
              </div>

              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#008456]" />
                  <span className="font-semibold text-[#0e261d]">PatchProof / Verification Gate</span>
                </div>
                <span className="text-[#008456] font-mono font-bold">Fix Verified (142 tests pass)</span>
              </div>
            </div>

            {/* Code Box */}
            <div className="rounded-[16px] bg-[#0f172a] text-slate-100 p-5 font-mono text-[13px] leading-relaxed overflow-x-auto shadow-inner">
              <pre className="text-slate-200">
                <code>{current.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
