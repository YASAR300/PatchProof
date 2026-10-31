"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Info,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  GitCommit,
  Terminal,
  BrainCircuit,
  EyeOff,
  Check,
  Shield,
  Loader2,
  ExternalLink,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";

function formatDate(isoStr) {
  if (!isoStr) return "—";
  try {
    return new Date(isoStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoStr;
  }
}

export function FindingDetailClient({ finding: initialFinding }) {
  const router = useRouter();
  const [finding, setFinding] = useState(initialFinding);
  const [isUpdatingTriage, setIsUpdatingTriage] = useState(false);
  const [triageError, setTriageError] = useState("");

  const contextLines = Array.isArray(finding.contextLines) ? finding.contextLines : [];

  const handleUpdateTriage = async (newStatus) => {
    setIsUpdatingTriage(true);
    setTriageError("");
    try {
      const res = await fetch(`/api/findings/${finding.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ triageStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update triage status.");
      if (data.ok && data.finding) {
        setFinding((prev) => ({ ...prev, triageStatus: data.finding.triageStatus }));
        router.refresh();
      }
    } catch (err) {
      setTriageError(err.message);
    } finally {
      setIsUpdatingTriage(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto font-sans w-full">
      {/* Top back navigation */}
      <div>
        <Link
          href="/app/findings"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to findings</span>
        </Link>
      </div>

      {/* Prominent Evidence Disclaimer Banner */}
      <div className="p-3.5 rounded-[8px] border border-amber-500/20 bg-amber-500/10 text-amber-300 text-xs flex items-start gap-3">
        <Info className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-semibold text-amber-200">
            This is a potential finding, not yet proof that the vulnerability is exploitable.
          </div>
          <div className="text-[11px] text-amber-300/80 leading-relaxed">
            Static analysis identifies suspicious code shapes and AST patterns. PatchProof will generate an isolated reproducer harness in subsequent steps to verify whether this flaw can actually be triggered.
          </div>
        </div>
      </div>

      {/* Finding Header Card */}
      <div className="p-4 rounded-[8px] bg-surface border border-border space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <SeverityBadge severity={finding.severity} size="sm" />
              <StatusBadge status={finding.verificationState} size="sm" />
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-[4px] bg-surface-raised border border-border text-text-secondary">
                {finding.source}
              </span>
              {finding.triageStatus === "IGNORED" && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-[4px] bg-surface-raised border border-border text-text-tertiary">
                  IGNORED
                </span>
              )}
            </div>
            <h1 className="text-base font-semibold text-text tracking-[-0.01em]">
              {finding.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-text-secondary font-mono flex-wrap">
              <span className="text-text font-medium flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5 text-accent" />
                {finding.filePath}:{finding.lineStart || 1}
              </span>
              <span>•</span>
              <span className="text-text-tertiary">Rule: {finding.ruleId}</span>
              {finding.cwe && (
                <>
                  <span>•</span>
                  <span className="text-accent">{finding.cwe}</span>
                </>
              )}
            </div>
          </div>

          {/* Triage Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {finding.triageStatus === "OPEN" ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleUpdateTriage("IGNORED")}
                disabled={isUpdatingTriage}
              >
                {isUpdatingTriage ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 mr-1.5 text-text-tertiary" />
                )}
                Mark as Ignored
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleUpdateTriage("OPEN")}
                disabled={isUpdatingTriage}
              >
                {isUpdatingTriage ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                )}
                Reopen Finding
              </Button>
            )}
          </div>
        </div>

        {triageError && (
          <div className="text-xs text-rose-400 pt-1">
            {triageError}
          </div>
        )}
      </div>

      {/* Code Snippet & Context Lines */}
      <Card>
        <CardHeader className="py-3 px-4 border-b border-border/60 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs text-text">
            <FileCode className="w-4 h-4 text-accent" />
            <span>{finding.filePath}</span>
            <span className="text-text-tertiary">
              (Line {finding.lineStart || 1} - {finding.lineEnd || finding.lineStart || 1})
            </span>
          </div>
          <div className="text-[11px] font-mono text-text-tertiary flex items-center gap-1.5">
            <GitCommit className="w-3.5 h-3.5" />
            <span>Commit: {finding.commitSha ? finding.commitSha.slice(0, 7) : "—"}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-[#080809] overflow-x-auto text-xs font-mono">
          {contextLines.length > 0 ? (
            <div className="divide-y divide-border/20 py-2">
              {contextLines.map((l) => (
                <div
                  key={l.line}
                  className={`flex items-start px-3 py-1 text-[12px] leading-relaxed select-text ${
                    l.isTarget
                      ? "bg-rose-500/15 border-l-2 border-l-rose-500 text-rose-200"
                      : "text-text-secondary hover:bg-white/[0.02]"
                  }`}
                >
                  <span className="w-12 flex-shrink-0 text-text-tertiary text-right pr-4 select-none tabular-nums text-[11px]">
                    {l.line}
                  </span>
                  <pre className="flex-1 overflow-x-auto font-mono whitespace-pre">{l.content}</pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4">
              <pre className="text-rose-300 leading-relaxed overflow-x-auto select-text">
                {finding.snippet || "No snippet captured."}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scanner Explanation */}
      <Card>
        <CardHeader className="py-3 px-4 border-b border-border/60">
          <CardTitle className="text-sm font-medium">Scanner Rule Explanation</CardTitle>
          <CardDescription className="text-xs">
            Static analysis rule metadata and guidance provided by Semgrep.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs leading-relaxed text-text-secondary">
          <div className="whitespace-pre-line text-text">
            {finding.description || finding.title}
          </div>
          {finding.cwe && (
            <div className="pt-2 border-t border-border/60 flex items-center gap-2">
              <span className="text-text-tertiary">Advisory Identifier:</span>
              <span className="font-mono text-accent">{finding.cwe}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Three-Part Provenance Panel */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-medium text-text px-1">
          Three-Part Security Provenance
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. From the Scanner (Filled) */}
          <div className="p-3.5 rounded-[8px] bg-surface border border-border space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-text font-medium">
              <Terminal className="w-3.5 h-3.5 text-accent" />
              <span>From the scanner</span>
            </div>
            <div className="space-y-1 text-[11px] text-text-secondary">
              <div>
                <span className="text-text-tertiary">Tool:</span>{" "}
                <span className="font-mono text-text uppercase">{finding.tool}</span>
              </div>
              <div>
                <span className="text-text-tertiary">Rule ID:</span>{" "}
                <span className="font-mono text-text truncate block">{finding.ruleId}</span>
              </div>
              <div>
                <span className="text-text-tertiary">Detected:</span>{" "}
                <span>{formatDate(finding.createdAt)}</span>
              </div>
              <div>
                <span className="text-text-tertiary">Confidence:</span>{" "}
                <span className="text-amber-400">Heuristic Match</span>
              </div>
            </div>
          </div>

          {/* 2. Verified by a Test (Empty State) */}
          <div className="p-3.5 rounded-[8px] bg-surface border border-border space-y-2 text-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-text font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Verified by a test</span>
              </div>
              <div className="pt-2 text-[11px] text-text-tertiary italic">
                Not verified yet
              </div>
            </div>
            <div className="text-[10px] text-text-tertiary">
              Container reproducer harness executes in Step 10
            </div>
          </div>

          {/* 3. Written by AI (Empty State) */}
          <div className="p-3.5 rounded-[8px] bg-surface border border-border space-y-2 text-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-text font-medium">
                <BrainCircuit className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Written by AI</span>
              </div>
              <div className="pt-2 text-[11px] text-text-tertiary italic">
                No AI explanation yet
              </div>
            </div>
            <div className="text-[10px] text-text-tertiary">
              Synthesized remediation arrives in upcoming steps
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

