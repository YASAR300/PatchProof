"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Cpu,
  Bot,
  Package,
  Activity,
  FileCheck,
} from "lucide-react";
import {
  FindingsScene,
  RunLogScene,
  PatchMatrixScene,
  EvidenceScene,
  DependencyScene,
  MonitoringScene,
  AssistantScene,
  SandboxScene,
} from "./scenes";

const TABS = [
  {
    id: "scanner",
    name: "Repository Security Scanner",
    short: "Scanner",
    icon: Search,
    title: "Multi-Engine Static & Dependency Ingestion",
    sentence: "Scans repository code and imports reports from your existing security tooling.",
    facts: [
      "Engine: Semgrep AST rules + OSV database correlation",
      "Detection latency: Under 2 seconds per git push",
      "Ingestion format: Ingests SARIF, JSON, and native CLI findings",
    ],
    scene: <FindingsScene />,
  },
  {
    id: "verification",
    name: "Automated Vulnerability Verification",
    short: "Verification",
    icon: ShieldCheck,
    title: "Deterministic Exploit Reproduction",
    sentence: "Executes controlled proof-of-concept tests in isolated worker environments.",
    facts: [
      "Worker isolation: Dedicated micro-VM container",
      "Network enforcement: 100% disabled during exploit execution",
      "Exit status: Zero-tolerance confirmation of exploitability",
    ],
    scene: <RunLogScene />,
  },
  {
    id: "validation",
    name: "Patch Validation",
    short: "Patch Validation",
    icon: CheckCircle2,
    title: "Candidate Fix Proof & Regression Defense",
    sentence: "Confirms that candidate commits neutralize the exploit without breaking features.",
    facts: [
      "PR comparison: Evaluates PR branch against target baseline commit",
      "Regression safety: Runs full repository unit and integration test suite",
      "Merge qualification: Verifies patch safety for tested cases",
    ],
    scene: <PatchMatrixScene />,
  },
  {
    id: "assistant",
    name: "AI Security Assistant",
    short: "AI Assistant",
    icon: Bot,
    title: "Context-Aware Test Harness Synthesis",
    sentence: "Drafts pytest reproducers and non-breaking fix proposals for human review.",
    facts: [
      "Synthesis target: Generates clean, reproducible pytest unit scripts",
      "Safety rule: Clearly tagged AI-generated; human approval required",
      "Credentials: Built-in synthesis without personal API key requirements",
    ],
    scene: <AssistantScene />,
  },
  {
    id: "dependencies",
    name: "Dependency Intelligence",
    short: "Dependencies",
    icon: Package,
    title: "Call-Tree Reachability Analysis",
    sentence: "Traces vulnerable third-party packages to confirm whether imported code is called.",
    facts: [
      "Noise elimination: Filters out unreachable transitive dependencies",
      "Lockfile parsing: Supports npm, pnpm, yarn, and pip requirements",
      "Call graph: Pinpoints exact function invocations in application code",
    ],
    scene: <DependencyScene />,
  },
  {
    id: "monitoring",
    name: "Continuous Security Monitoring",
    short: "Monitoring",
    icon: Activity,
    title: "Persistent Pull Request Quality Gates",
    sentence: "Prevents previously verified vulnerabilities from returning during future refactors.",
    facts: [
      "CI automation: Blocks pull requests if previously fixed CVEs re-open",
      "Webhook alerts: Instant notifications on security test regressions",
      "Historical tracking: Maintains unbroken verification lineage",
    ],
    scene: <MonitoringScene />,
  },
  {
    id: "dashboard",
    name: "Security Evidence Dashboard",
    short: "Evidence",
    icon: FileCheck,
    title: "Tamper-Evident Verification Proof Bundles",
    sentence: "Exports cryptographically signed reports ready for compliance and security audits.",
    facts: [
      "Integrity seal: Cryptographic SHA-256 digest on logs and diffs",
      "Audit format: Machine-readable JSON and signed executive summaries",
      "SOC2 alignment: Provides verifiable proof of security remediation",
    ],
    scene: <EvidenceScene />,
  },
];

export function ProductExplorerSection() {
  const [activeTab, setActiveTab] = useState(0);

  const handleKeyDown = (e, index) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = (index + 1) % TABS.length;
      setActiveTab(next);
      document.getElementById(`tab-${next}`)?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (index - 1 + TABS.length) % TABS.length;
      setActiveTab(prev);
      document.getElementById(`tab-${prev}`)?.focus();
    }
  };

  const current = TABS[activeTab];

  return (
    <section
      id="product"
      className="py-28 lg:py-36 bg-[#f5f5f7] text-[#1d1d1f] border-t border-black/[0.06] scroll-mt-14 select-none"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-wider text-[#6e6e73] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Product Explorer
          </div>
          <h2 className="text-[34px] sm:text-[48px] lg:text-[64px] font-semibold tracking-[-0.025em] leading-[1.05] text-[#1d1d1f]">
            One workspace, from alert to evidence.
          </h2>
          <p className="text-[20px] sm:text-[22px] text-[#6e6e73] leading-[1.45] max-w-[60ch]">
            Seven integrated capabilities engineered to replace fragmented triage with provable verification.
          </p>
        </div>

        {/* Horizontal Segmented Control (keyboard accessible with arrow keys) */}
        <div
          role="tablist"
          aria-label="Capabilities"
          className="flex items-center gap-1.5 p-1.5 rounded-[12px] bg-black/[0.06] overflow-x-auto no-scrollbar scroll-smooth w-full"
        >
          {TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = idx === activeTab;
            return (
              <button
                key={tab.id}
                id={`tab-${idx}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${idx}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-[9px] text-[13px] font-semibold transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive
                    ? "bg-white text-[#1d1d1f] shadow-sm"
                    : "text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white/40"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-[#6e6e73]"}`} />
                <span>{tab.short}</span>
              </button>
            );
          })}
        </div>

        {/* Large Feature Panel: Full container width, >= 560px tall, NOT a card grid! */}
        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="w-full min-h-[560px] rounded-[20px] bg-white border border-black/[0.08] shadow-lg p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
        >
          {/* Left: Title, sentence, and 3 fact lines (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-[12px] font-mono uppercase tracking-wider text-accent font-semibold">
                Capability 0{activeTab + 1}
              </span>
              <h3 className="text-[28px] sm:text-[34px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.15]">
                {current.title}
              </h3>
              <p className="text-[17px] sm:text-[18px] text-[#6e6e73] leading-relaxed">
                {current.sentence}
              </p>
            </div>

            {/* Three short fact lines */}
            <div className="pt-4 border-t border-black/[0.08] space-y-3 font-mono text-[13px] text-[#1d1d1f]">
              {current.facts.map((fact, fIdx) => (
                <div key={fIdx} className="flex items-start gap-2.5">
                  <span className="text-accent select-none font-bold">›</span>
                  <span className="leading-snug">{fact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: The matching large product scene (7 cols) */}
          <div className="lg:col-span-7">
            {current.scene}
          </div>
        </div>
      </div>
    </section>
  );
}
