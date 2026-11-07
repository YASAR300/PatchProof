"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Bot,
  Layers,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Terminal,
  FileCheck2,
  Bug,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { AiSuggestionCodeBlock } from "./AiSuggestionCodeBlock";

export function AiExplanationView({
  explanation,
  provider = "template",
  model = "template",
  cached = false,
  className = "",
}) {
  if (!explanation) return null;

  const isTemplate = provider === "template";
  const remediationOptions = Array.isArray(explanation.remediationOptions)
    ? explanation.remediationOptions
    : [];
  const additionalTests = Array.isArray(explanation.additionalTests)
    ? explanation.additionalTests
    : [];
  const nextSteps = Array.isArray(explanation.nextSteps) ? explanation.nextSteps : [];
  const limitations = Array.isArray(explanation.limitations) ? explanation.limitations : [];
  const citedEvidence = Array.isArray(explanation.citedEvidence)
    ? explanation.citedEvidence
    : [];

  return (
    <div className={`space-y-4 font-sans text-xs ${className}`}>
      {/* Header bar with Provider & Model tags and Cache indicator */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-3 h-3" />
            AI-generated
          </span>
          <span className="font-mono text-[11px] text-text-tertiary">
            Provider: <strong className="text-text-secondary">{provider}</strong> | Model:{" "}
            <strong className="text-text-secondary">{model}</strong>
          </span>
        </div>

        {cached && (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-raised border border-border text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            Cached
          </span>
        )}
      </div>

      {/* Summary */}
      <div className="p-3.5 rounded-[6px] border border-border bg-surface-raised/40 space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block font-mono">
          Executive Summary
        </span>
        <p className="text-text leading-relaxed font-sans text-xs">
          {explanation.summary}
        </p>
      </div>

      {/* Root Cause Analysis */}
      <div className="p-3.5 rounded-[6px] border border-border bg-surface space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block font-mono">
          Vulnerability Root Cause
        </span>
        <p className="text-text-secondary leading-relaxed font-sans text-xs">
          {explanation.rootCause}
        </p>
      </div>

      {/* Remediation Options */}
      {remediationOptions.length > 0 && (
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block font-mono">
            Remediation Options ({remediationOptions.length})
          </span>
          <div className="space-y-3">
            {remediationOptions.map((opt, idx) => {
              const title = typeof opt === "string" ? `Option ${idx + 1}` : opt.title;
              const desc = typeof opt === "string" ? opt : opt.description;
              const snippet = typeof opt === "object" ? opt.codeSnippet : null;

              return (
                <div key={idx} className="p-3.5 rounded-[6px] border border-border bg-surface space-y-2">
                  <div className="font-semibold text-text text-xs">{title}</div>
                  <p className="text-text-secondary leading-relaxed text-xs">{desc}</p>
                  {snippet && (
                    <AiSuggestionCodeBlock
                      code={snippet}
                      title="Suggested Remediation Pattern"
                      language="python"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Additional Tests */}
      {additionalTests.length > 0 && (
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block font-mono">
            Suggested Additional Test Cases ({additionalTests.length})
          </span>
          <div className="space-y-3">
            {additionalTests.map((t, idx) => {
              const name = typeof t === "string" ? `Test ${idx + 1}` : t.name;
              const desc = typeof t === "string" ? t : t.description;
              const code = typeof t === "object" ? t.testCode : null;

              return (
                <div key={idx} className="p-3.5 rounded-[6px] border border-border bg-surface space-y-2">
                  <div className="font-semibold text-text text-xs flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-accent" />
                    <span>{name}</span>
                  </div>
                  <p className="text-text-secondary leading-relaxed text-xs">{desc}</p>
                  {code && (
                    <AiSuggestionCodeBlock
                      code={code}
                      title="Suggested Harness / Oracle"
                      language="python"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Next Debugging Steps */}
      {nextSteps.length > 0 && (
        <div className="p-3.5 rounded-[6px] border border-border bg-surface space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block font-mono">
            Recommended Next Steps
          </span>
          <ul className="space-y-1.5 list-disc list-inside text-text-secondary text-xs">
            {nextSteps.map((step, idx) => (
              <li key={idx} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cited Evidence (Linked to Real Runs and Reports) */}
      {citedEvidence.length > 0 && (
        <div className="p-3.5 rounded-[6px] border border-border bg-surface-raised/30 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block font-mono">
            Cited Evidence ({citedEvidence.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {citedEvidence.map((cit, idx) => {
              const type = cit.type?.toLowerCase() || "reference";
              const id = cit.id;
              const label = cit.name || id;

              let href = null;
              let Icon = Layers;

              if (type === "run") {
                href = `/app/runs/${id}`;
                Icon = Terminal;
              } else if (type === "report") {
                href = `/app/reports/${id}`;
                Icon = FileCheck2;
              } else if (type === "finding") {
                href = `/app/findings/${id}`;
                Icon = Bug;
              }

              if (href) {
                return (
                  <Link
                    key={idx}
                    href={href}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-border hover:border-accent text-[11px] font-mono text-text transition-colors"
                  >
                    <Icon className="w-3 h-3 text-accent" />
                    <span className="font-semibold">{label}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-text-tertiary" />
                  </Link>
                );
              }

              return (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-border text-[11px] font-mono text-text-secondary"
                >
                  <Icon className="w-3 h-3 text-text-tertiary" />
                  <span>{label}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Limitations Notice */}
      {limitations.length > 0 && (
        <div className="p-3 rounded-[6px] border border-amber-500/20 bg-amber-500/5 text-amber-200/90 text-xs space-y-1">
          <div className="font-semibold text-amber-300 text-[11px] uppercase tracking-wider font-mono">
            Evaluation Scope & Notice:
          </div>
          <ul className="space-y-1 list-disc list-inside text-[11px]">
            {limitations.map((lim, idx) => (
              <li key={idx} className="leading-relaxed">
                {lim}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
