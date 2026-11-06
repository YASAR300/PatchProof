"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Play,
  ArrowRight,
  Radar,
  ShieldAlert,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { resolveReproducer } from "@/lib/reproducers";

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

  const project = finding.project;
  const compatibility = resolveReproducer(finding, project);
  const latestRun = finding.verificationRuns?.[0] || null;

  const [selectedTag, setSelectedTag] = useState("baseline");
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeVerifyJob, setActiveVerifyJob] = useState(null);
  const [showVerifyLogs, setShowVerifyLogs] = useState(true);
  const pollTimerRef = useRef(null);

  // Poll active verify job every 1.5 seconds
  useEffect(() => {
    if (!activeVerifyJob?.id) return;

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${activeVerifyJob.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.ok && data.job) {
          setActiveVerifyJob(data.job);
          if (
            data.job.status === "SUCCEEDED" ||
            data.job.status === "FAILED" ||
            data.job.status === "CANCELED"
          ) {
            setIsVerifying(false);
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            router.refresh();
          }
        }
      } catch {
        // non-fatal
      }
    }, 1500);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [activeVerifyJob?.id, router]);

  const handleTriggerVerify = async () => {
    setIsVerifying(true);
    setShowVerifyLogs(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "verify",
          projectId: project?.id,
          payload: {
            findingId: finding.id,
            targetRef: compatibility.compatible
              ? selectedTag
              : (finding.commitSha || project?.defaultBranch || "HEAD"),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to trigger verification job.");
      if (data.ok && data.job) {
        setActiveVerifyJob(data.job);
      }
    } catch (err) {
      alert(err.message || "Failed to start verification.");
      setIsVerifying(false);
    }
  };

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

      {/* Automated Vulnerability Verification Panel */}
      <Card className="border-border">
        <CardHeader className="py-3 px-4 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Radar className="w-4 h-4 text-accent" />
              <div>
                <CardTitle className="text-sm font-medium text-text">Automated Vulnerability Verification</CardTitle>
                <CardDescription className="text-xs">
                  Runs 3 deterministic sandbox iterations against a registered reproducer to prove exploitability.
                </CardDescription>
              </div>
            </div>

            {compatibility.compatible && (
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  disabled={isVerifying}
                  aria-label="Select target tag or commit"
                  className="h-8 px-2.5 rounded-[6px] border border-border bg-surface text-xs font-mono text-text outline-none focus:border-accent cursor-pointer"
                >
                  <option value="baseline">tag: baseline (vulnerable SQLi)</option>
                  <option value="fix-good">tag: fix-good (parameterized fix)</option>
                  <option value="fix-incomplete">tag: fix-incomplete (bypassable)</option>
                  <option value="fix-regression">tag: fix-regression (broken O&apos;Brien)</option>
                  <option value="broken-build">tag: broken-build (syntax error)</option>
                </select>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleTriggerVerify}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Running verification...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                      Run verification
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        {!compatibility.compatible ? (
          <CardContent className="p-4 text-xs text-text-secondary flex items-start gap-2.5 bg-surface-raised/20">
            <ShieldAlert className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-0.5" />
            <div>
              <span>No compatible reproducer is available, so this finding remains unverified.</span>
            </div>
          </CardContent>
        ) : (
          <>
            {/* Active Verification Progress & Live Logs */}
            {activeVerifyJob && (
              <CardContent className="p-4 space-y-3 bg-surface-raised/30 border-b border-border/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isVerifying ? (
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    ) : activeVerifyJob.status === "SUCCEEDED" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className="font-medium text-text">
                      Verification Job #{activeVerifyJob.id.slice(-8)} is {activeVerifyJob.status}
                    </span>
                    {activeVerifyJob.result?.status && (
                      <StatusBadge status={activeVerifyJob.result.status} size="sm" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {activeVerifyJob.result?.runId && (
                      <Link
                        href={`/app/runs/${activeVerifyJob.result.runId}`}
                        className="text-accent hover:underline text-xs flex items-center gap-1 font-medium"
                      >
                        <span>View run evidence</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowVerifyLogs(!showVerifyLogs)}
                      className="text-text-secondary hover:text-text text-[11px] font-mono flex items-center gap-1"
                    >
                      <Terminal className="w-3 h-3" />
                      {showVerifyLogs ? "Hide logs" : "View logs"}
                    </button>
                  </div>
                </div>

                {showVerifyLogs && activeVerifyJob.logs && (
                  <pre className="p-3 rounded-[6px] bg-[#080809] border border-border/80 font-mono text-[11px] text-text-secondary max-h-40 overflow-y-auto leading-relaxed select-text">
                    {activeVerifyJob.logs}
                  </pre>
                )}
              </CardContent>
            )}

            {/* Latest Run Result Banner */}
            {!activeVerifyJob && latestRun && (
              <CardContent className="p-3.5 px-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-raised/20">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-text-tertiary">Latest verification verdict:</span>
                  <StatusBadge status={latestRun.status} size="sm" />
                  <span className="text-text-secondary font-mono text-[11px]">
                    (Commit: {latestRun.commitSha?.slice(0, 7) || "—"})
                  </span>
                  {latestRun.summary && (
                    <span className="text-text-secondary truncate max-w-md">
                      — {latestRun.summary}
                    </span>
                  )}
                </div>
                <Link
                  href={`/app/runs/${latestRun.id}`}
                  className="text-accent hover:underline text-xs font-medium flex items-center gap-1 flex-shrink-0"
                >
                  <span>View run details</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </CardContent>
            )}
          </>
        )}
      </Card>

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
              <span>{finding.source === "IMPORT" ? "From imported report" : "From the scanner"}</span>
            </div>
            <div className="space-y-1 text-[11px] text-text-secondary">
              <div>
                <span className="text-text-tertiary">Source:</span>{" "}
                <span className="font-mono text-text">
                  {finding.source === "IMPORT" ? `Imported (${finding.tool})` : `Scanner (${finding.tool})`}
                </span>
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

          {/* 2. Verified by a Test */}
          <div className="p-3.5 rounded-[8px] bg-surface border border-border space-y-2 text-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-text font-medium">
                <CheckCircle2 className={`w-3.5 h-3.5 ${latestRun ? "text-accent" : "text-text-tertiary"}`} />
                <span>Verified by a test</span>
              </div>
              {latestRun ? (
                <div className="space-y-1 text-[11px] text-text-secondary pt-2">
                  <div className="flex items-center gap-1.5 pb-0.5">
                    <span className="text-text-tertiary">Verdict:</span>
                    <StatusBadge status={latestRun.status} size="sm" />
                  </div>
                  <div>
                    <span className="text-text-tertiary">Test Hash:</span>{" "}
                    <span className="font-mono text-text">{latestRun.testVersion ? latestRun.testVersion.slice(0, 8) : "—"}</span>
                  </div>
                  <div>
                    <span className="text-text-tertiary">Commit:</span>{" "}
                    <span className="font-mono text-text">{latestRun.commitSha ? latestRun.commitSha.slice(0, 7) : "—"}</span>
                  </div>
                  <div>
                    <span className="text-text-tertiary">Duration:</span>{" "}
                    <span>{latestRun.durationMs ? `${(latestRun.durationMs / 1000).toFixed(1)}s` : "—"}</span>
                  </div>
                </div>
              ) : (
                <div className="pt-2 text-[11px] text-text-tertiary italic">
                  Not verified yet
                </div>
              )}
            </div>
            <div className="text-[10px] text-text-tertiary pt-2">
              {latestRun ? (
                <Link
                  href={`/app/runs/${latestRun.id}`}
                  className="text-accent hover:underline flex items-center gap-1 font-medium text-[11px]"
                >
                  <span>View run evidence</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </Link>
              ) : (
                "Execute verification harness above"
              )}
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

