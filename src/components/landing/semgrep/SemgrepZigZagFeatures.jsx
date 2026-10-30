"use client";

import React from "react";
import {
  Search,
  Package,
  Bot,
  ShieldCheck,
  ArrowRight,
  GitPullRequest,
  Check,
  FileCode2,
} from "lucide-react";

export function SemgrepZigZagFeatures() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-[#e2efe7] text-[#0e261d] select-none scroll-mt-14 border-t border-[#c8e2d4]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-24 sm:space-y-32">
        {/* Top Header & Pill Switcher (Semgrep Static Nav Sections) */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[12px] font-mono uppercase tracking-widest text-[#008456] font-bold bg-[#cde4d6] border border-[#b8dcce]">
            AppSec Lifecycle
          </div>
          <h2 className="text-[36px] sm:text-[48px] lg:text-[60px] font-extrabold tracking-tight leading-[1.05] text-[#0e261d]">
            Evidence woven across the AppSec lifecycle
          </h2>
          <p className="text-[18px] sm:text-[21px] text-[#2c4d3e] leading-relaxed max-w-[58ch] mx-auto">
            From initial AST detection to deterministic proof and automated regression defense.
          </p>

          {/* Pill Switcher Row */}
          <div className="flex items-center justify-center pt-2">
            <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-white border border-[#b8dcce] shadow-xs">
              <span className="px-4 py-1.5 rounded-full text-[13px] font-bold bg-[#008456] text-white">
                Detection
              </span>
              <span className="px-4 py-1.5 rounded-full text-[13px] font-bold text-[#2c4d3e]">
                Noise Filtering
              </span>
              <span className="px-4 py-1.5 rounded-full text-[13px] font-bold text-[#2c4d3e]">
                Remediation
              </span>
              <span className="px-4 py-1.5 rounded-full text-[13px] font-bold text-[#2c4d3e]">
                Prevention
              </span>
            </div>
          </div>
        </div>

        {/* Feature 1: Detection -> Detect What Matters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[12px] font-mono uppercase tracking-wider text-[#ea580c] font-bold">
              01 / Detection
            </span>
            <h3 className="text-[28px] sm:text-[34px] font-extrabold text-[#0e261d] leading-tight">
              Detect What Matters
            </h3>
            <p className="text-[16px] text-[#475569] leading-relaxed">
              Detect complex issues like IDORs, broken authorization, and multi-step logic flaws. Combine deterministic static analysis with test reasoning to understand structure and developer intent.
            </p>
            <div className="pt-2 space-y-2 text-[14px] text-[#0e261d] font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#008456]" />
                <span>Under 2 seconds scan latency per pull request</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#008456]" />
                <span>Over 348 community rules for OWASP Top 10 vulnerabilities</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-[28px] bg-[#fed7aa]/35 border border-[#fed7aa] p-6 sm:p-8 shadow-xl">
            <div className="rounded-[20px] bg-white border border-[#fed7aa] p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <span className="font-mono text-[13px] font-bold text-[#0e261d]">
                  Semgrep AST Match Result
                </span>
                <span className="text-[11px] font-mono text-[#008456] bg-[#ecfdf5] px-2.5 py-0.5 rounded-full border border-[#a7f3d0] font-bold">
                  Scan duration: 1.4s
                </span>
              </div>
              <div className="p-3.5 rounded-[12px] bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-mono font-bold text-[#0e261d]">users.py:42</span>
                  <span className="font-mono text-[11px] text-[#ea580c] font-bold">CWE-89</span>
                </div>
                <p className="text-[13px] text-[#475569]">
                  Rule match: <code className="font-mono text-[#008456]">python.sqlalchemy.injection</code>
                </p>
              </div>
              <div className="p-3.5 rounded-[12px] bg-[#0f172a] text-slate-100 font-mono text-[12px] leading-relaxed">
                <div className="text-slate-400">// Query parameter interpolation flagged</div>
                <div className="text-[#f87171]">db.execute(f&quot;SELECT * FROM users WHERE id={'{user_id}'}&quot;)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Left Card (Warm Amber Gradient) + Right Copy (Dependency Intelligence) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1 rounded-[28px] bg-[#fed7aa]/45 border border-[#fed7aa] p-6 sm:p-8 shadow-xl">
            <div className="rounded-[20px] bg-white border border-[#fed7aa] p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#fed7aa]">
                <span className="font-mono text-[13px] font-bold text-[#c2410c]">
                  Transitive Call-Graph Reachability
                </span>
                <span className="text-[11px] font-mono text-[#9a3412] bg-white px-2.5 py-0.5 rounded-full border border-[#fed7aa] font-bold">
                  12 False Alarms Excluded
                </span>
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-[#ea580c] font-bold">
                  Active Execution Chain
                </span>
                <div className="flex flex-wrap items-center gap-2 font-mono text-[12px]">
                  <span className="px-3 py-1 rounded-full bg-[#f8fafc] border border-[#e2e8f0] text-[#0e261d] font-semibold">
                    org/backend-api
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#ea580c]" />
                  <span className="px-3 py-1 rounded-full bg-[#f8fafc] border border-[#e2e8f0] text-[#0e261d] font-semibold">
                    express-validator
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#ea580c]" />
                  <span className="px-3 py-1 rounded-full bg-[#fee2e2] text-[#991b1b] border border-[#fecaca] font-bold">
                    validator@13.7.0 (Reachable)
                  </span>
                </div>
              </div>
              <p className="text-[13px] text-[#475569] pt-2">
                Identified reachable function <code className="font-mono text-[#ea580c]">isURL()</code> invoked by <code className="font-mono text-[#0e261d]">src/routes/auth.js:88</code>.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
            <span className="text-[12px] font-mono uppercase tracking-wider text-[#ea580c] font-bold">
              02 / Noise Filtering
            </span>
            <h3 className="text-[28px] sm:text-[34px] font-extrabold text-[#0e261d] leading-tight">
              Noise Filtering
            </h3>
            <p className="text-[16px] text-[#475569] leading-relaxed">
              Prioritize what matters. Eliminate what doesn’t. Automatically triage findings using AST call-graph reachability, patterns, and prior decisions. Provisionally ignore false alarms so teams focus on real risk.
            </p>
            <div className="pt-2 space-y-2 text-[14px] text-[#0e261d] font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#008456]" />
                <span>Filters out 92% of unreachable dependency noise</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#008456]" />
                <span>Parses npm, pnpm, yarn, and pip lockfiles with deep accuracy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: Remediation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[12px] font-mono uppercase tracking-wider text-[#6d28d9] font-bold">
              03 / Remediation
            </span>
            <h3 className="text-[28px] sm:text-[34px] font-extrabold text-[#0e261d] leading-tight">
              Remediation
            </h3>
            <p className="text-[16px] text-[#475569] leading-relaxed">
              Turn findings into safe, actionable fixes – fast. Generate tailored reproducer test scripts and verified candidate patch proposals directly in PRs. Developers fix issues safely with confidence, not guesswork.
            </p>
            <div className="pt-2 space-y-2 text-[14px] text-[#0e261d] font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#008456]" />
                <span>Zero personal API keys required; fully built-in</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#008456]" />
                <span>Produces runnable test cases directly compatible with Pytest and Jest</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-[28px] bg-[#ede9fe]/45 border border-[#ddd6fe] p-6 sm:p-8 shadow-xl">
            <div className="rounded-[20px] bg-white border border-[#ddd6fe] p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#ede9fe]">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#6d28d9]" />
                  <span className="font-mono text-[13px] font-bold text-[#0e261d]">
                    Synthesized Reproducer Harness
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#6d28d9] bg-[#f5f3ff] px-2.5 py-0.5 rounded-full border border-[#ddd6fe] font-bold">
                  AI-Generated • Review Required
                </span>
              </div>
              <div className="p-4 rounded-[12px] bg-[#0f172a] text-slate-100 font-mono text-[12px] leading-relaxed overflow-x-auto">
                <div className="text-slate-400"># tests/reproducers/test_sqli_find_user.py</div>
                <div className="text-white">def test_user_query_sqli_exploit(client):</div>
                <div className="text-slate-300">    payload = &quot;' OR '1'='1&quot;</div>
                <div className="text-slate-300">    res = client.get(f&quot;/api/users?id={'{payload}'}&quot;)</div>
                <div className="text-[#f87171]">    # Assert exploit leaks unauthorized records</div>
                <div className="text-white">    assert res.status_code == 200</div>
                <div className="text-white">    assert len(res.json()[&quot;users&quot;]) &gt; 1</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 4: Left Mint Card + Right Copy (Continuous Regression Defense) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1 rounded-[28px] bg-[#d1fae5]/50 border border-[#a7f3d0] p-6 sm:p-8 shadow-xl">
            <div className="rounded-[20px] bg-white border border-[#a7f3d0] p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-2">
                  <GitPullRequest className="w-4 h-4 text-[#008456]" />
                  <span className="font-mono text-[13px] font-bold text-[#0e261d]">
                    GitHub PR Quality Gate
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#008456] bg-[#ecfdf5] px-2.5 py-0.5 rounded-full border border-[#a7f3d0] font-bold">
                  PR #184 PASSED
                </span>
              </div>
              <div className="p-4 rounded-[14px] bg-[#ecfdf5] border border-[#a7f3d0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[14px] text-[#065f46]">
                    ✓ Patch Proof Verification Gate
                  </span>
                  <span className="text-[12px] font-mono font-bold text-[#008456]">SAFE TO MERGE</span>
                </div>
                <p className="text-[13px] text-[#047857]">
                  Target exploit confirmed closed. 142 regression tests verified with zero side-effects.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
            <span className="text-[12px] font-mono uppercase tracking-wider text-[#008456] font-bold">
              04 / Prevention
            </span>
            <h3 className="text-[28px] sm:text-[34px] font-extrabold text-[#0e261d] leading-tight">
              Prevention
            </h3>
            <p className="text-[16px] text-[#475569] leading-relaxed">
              Stop patched vulnerabilities from quietly returning. Built-in guardrails and automated regression gates ensure verified reproducers run on every commit, preventing regressions from ever shipping to production.
            </p>
            <div className="pt-2 space-y-2 text-[14px] text-[#0e261d] font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#008456]" />
                <span>Automated PR blocking checks on regression failures</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#008456]" />
                <span>Zero performance penalty on normal developer builds</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
