"use client";

import React from "react";
import { AlertCircle, ShieldAlert } from "lucide-react";

const CHECKLIST = [
  {
    title: "Dedicated workers",
    description: "Every verification runs in an isolated ephemeral execution host.",
  },
  {
    title: "No network during test execution",
    description: "Egress and ingress interfaces are terminated before exploit execution begins.",
  },
  {
    title: "CPU, memory, process and time limits",
    description: "Strict cgroup boundaries prevent fork bombs and denial-of-service attempts.",
  },
  {
    title: "No host mounts or application secrets",
    description: "Production keys, tokens, and host filesystem sockets are never injected.",
  },
  {
    title: "Disposable environments",
    description: "Harnesses are terminated and cryptographically erased immediately after completion.",
  },
  {
    title: "Audit records",
    description: "Every spawned process, syscall trace, and test log is immutably indexed.",
  },
];

export function ExecutionHardeningSection() {
  return (
    <section
      id="security"
      className="py-28 lg:py-36 bg-[#0b0b0c] text-white border-t border-white/[0.08] scroll-mt-14 select-none"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Execution Hardening
          </div>
          <h2 className="text-[34px] sm:text-[48px] lg:text-[64px] font-semibold tracking-[-0.025em] leading-[1.05] text-white">
            Tests run in isolated, disposable workers.
          </h2>
          <p className="text-[20px] sm:text-[22px] text-slate-400 leading-[1.45] max-w-[60ch]">
            Untrusted code and exploit payloads execute with zero access to your internal networks, application secrets, or host infrastructure.
          </p>
        </div>

        {/* Large SVG Architecture Diagram Across Container (>= 420px tall) */}
        <div className="w-full rounded-[20px] border border-white/[0.1] bg-[#11131a] p-6 sm:p-10 flex flex-col items-center shadow-2xl overflow-x-auto">
          <svg
            className="w-full max-w-[960px] h-[440px] text-slate-300"
            viewBox="0 0 960 440"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Worker host and container isolation architecture diagram"
          >
            {/* Outer Worker Host Box */}
            <rect
              x="20"
              y="20"
              width="920"
              height="390"
              rx="16"
              fill="#141722"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="2"
            />
            <text x="50" y="60" fill="#94a3b8" fontSize="14" fontFamily="monospace" fontWeight="700">
              WORKER HOST (Ephemeral Virtual Machine)
            </text>

            {/* Inner Disposable Container */}
            <rect
              x="60"
              y="85"
              width="840"
              height="200"
              rx="12"
              fill="#0b0b0c"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            <text x="90" y="125" fill="#60a5fa" fontSize="14" fontFamily="monospace" fontWeight="700">
              DISPOSABLE TEST CONTAINER (Isolated Micro-VM)
            </text>

            {/* 3 Labeled Constraints */}
            <g transform="translate(90, 150)">
              <rect width="180" height="42" rx="6" fill="#201214" stroke="#3d1a1e" strokeWidth="1.5" />
              <text x="20" y="26" fill="#f87171" fontSize="13" fontFamily="sans-serif" fontWeight="700">
                0 Network Access
              </text>
            </g>

            <g transform="translate(300, 150)">
              <rect width="200" height="42" rx="6" fill="#21180f" stroke="#3d2b17" strokeWidth="1.5" />
              <text x="20" y="26" fill="#fbbf24" fontSize="13" fontFamily="sans-serif" fontWeight="700">
                Strict Resource Quotas
              </text>
            </g>

            <g transform="translate(530, 150)">
              <rect width="200" height="42" rx="6" fill="#161618" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
              <text x="20" y="26" fill="#a0a0a8" fontSize="13" fontFamily="sans-serif" fontWeight="700">
                No Host / Secret Mounts
              </text>
            </g>

            {/* Payload execution inside container */}
            <text x="90" y="245" fill="#e2e8f0" fontSize="13" fontFamily="monospace">
              pytest tests/reproducers/test_sqli_find_user.py ➔ EXIT CODE 0 (Verified Neutralized)
            </text>

            {/* Connecting Arrow down to Evidence Store */}
            <path d="M480 285 L480 330" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="473,330 487,330 480,340" fill="#4ade80" />

            {/* Evidence Store Box */}
            <rect
              x="300"
              y="340"
              width="360"
              height="46"
              rx="8"
              fill="#101e14"
              stroke="#1a3b22"
              strokeWidth="1.5"
            />
            <text x="350" y="369" fill="#4ade80" fontSize="14" fontFamily="sans-serif" fontWeight="700">
              Tamper-Evident Evidence Store (SHA-256)
            </text>
          </svg>

          <span className="text-[13px] font-mono text-slate-400 mt-4">
            Zero shared state • Ephemeral lifecycle • Airgapped execution
          </span>
        </div>

        {/* Six text-only items in 3x2 grid separated by hairlines */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.1] border-y border-white/[0.1]">
          {CHECKLIST.slice(0, 3).map((item, idx) => (
            <div key={idx} className="p-6 space-y-1.5">
              <h3 className="text-[16px] font-semibold text-white">
                {item.title}
              </h3>
              <p className="text-[14px] text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.1] border-b border-white/[0.1] -mt-16">
          {CHECKLIST.slice(3, 6).map((item, idx) => (
            <div key={idx} className="p-6 space-y-1.5">
              <h3 className="text-[16px] font-semibold text-white">
                {item.title}
              </h3>
              <p className="text-[14px] text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Always-visible honest notes */}
        <div className="pt-4 flex flex-col sm:flex-row gap-6 text-[13px] text-slate-400 font-mono">
          <div className="flex items-start gap-2.5 max-w-xl">
            <AlertCircle className="w-4 h-4 text-[#fbbf24] flex-shrink-0 mt-0.5" />
            <p>Containers alone are not treated as a complete security boundary.</p>
          </div>
          <div className="flex items-start gap-2.5 max-w-xl">
            <ShieldAlert className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p>Static analysis only. Test execution is disabled for this repository.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
