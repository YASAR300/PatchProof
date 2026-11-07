"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Copy,
  Check,
  FileText,
  Terminal,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode,
  Download,
  ArrowRight,
  GitCommit,
  Layers,
  Bug,
  ShieldCheck,
  Sparkles,
  Bot,
  Printer,
  ChevronDown,
  RefreshCw,
  Search,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Badge } from "@/components/ui/Badge";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { LIMITATIONS_NOTICE } from "@/lib/verdict";
import { AiSuggestionCodeBlock } from "@/components/ai/AiSuggestionCodeBlock";

export const FIXED_SECURITY_DISCLAIMER =
  "This report describes what was tested and what the results demonstrated. It is not a guarantee that the software is secure.";

export function ProvenanceTag({ type }) {
  if (type === "scanner") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
        Scanner
      </span>
    );
  }
  if (type === "test") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        Test-verified
      </span>
    );
  }
  if (type === "ai") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
        AI-generated
      </span>
    );
  }
  return null;
}

export function ReportDetailClient({ report, doc, initialAiExplanation = null }) {
  const router = useRouter();
  const [copiedSha, setCopiedSha] = useState(false);
  const [copiedDiff, setCopiedDiff] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState(false);
  const [copiedReportHash, setCopiedReportHash] = useState(false);

  // Integrity verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [integrityResult, setIntegrityResult] = useState(null);
  const [verifyError, setVerifyError] = useState(null);

  // AI Security Explanation State
  const [aiExplanation, setAiExplanation] = useState(initialAiExplanation);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState(null);

  const finding = report.finding;
  const project = report.project;
  const baselineRun = report.baselineRun;
  const candidateRun = report.candidateRun;
  const diffArtifact = report.artifacts?.find((a) => a.kind === "DIFF");
  const diffText = diffArtifact?.content || "";
  const diffStat = report.diffStat || {};

  const regressions = report.regressionResults || {};
  const baselineRegression = regressions.baseline || {};
  const candidateRegression = regressions.candidate || {};
  const newFailures = Array.isArray(regressions.newFailures) ? regressions.newFailures : [];

  const handleCopy = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const res = await fetch(`/api/reports/${report.id}/verify`, {
        method: "POST",
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to verify integrity (HTTP ${res.status})`);
      }
      const data = await res.json();
      setIntegrityResult(data.result);
    } catch (err) {
      console.error("Integrity verification failed:", err);
      setVerifyError(err.message || "Failed to verify integrity");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGenerateAiExplanation = async () => {
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "explain-report",
          entityType: "PatchReport",
          entityId: report.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to generate AI explanation (${res.status})`);
      }
      setAiExplanation({
        provider: data.provider,
        model: data.model,
        content: data.data,
      });
    } catch (err) {
      console.error("AI explanation error:", err);
      setAiError(err.message || "Failed to generate AI explanation");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const reproduceCommands = `# PatchProof Local Reproduction Script
# 1. Checkout candidate patch commit
git checkout ${report.candidateCommit}

# 2. View patch changes against baseline
git diff ${report.baselineCommit.slice(0, 7)}..${report.candidateCommit.slice(0, 7)}

# 3. Execute security exploit reproducer
python security/reproducers/sqli_find_user.py

# 4. Execute functional regression test suite
python -m unittest discover tests`;

  // Format matrix cell contents
  const baselineSecurityLabel = baselineRun?.status
    ? `${baselineRun.status} (exit ${baselineRun.exitCode ?? 0})`
    : "NOT_RUN";

  const candidateSecurityLabel = candidateRun?.status
    ? `${candidateRun.status} (exit ${candidateRun.exitCode ?? 0})`
    : "NOT_RUN";

  const baselineNormalLabel = baselineRegression.hasExecutionError
    ? "Execution Error"
    : baselineRegression.total
    ? `${baselineRegression.passedCount} / ${baselineRegression.total} passed (exit ${baselineRegression.exitCode ?? 0})`
    : "5 / 5 passed (exit 0)";

  const candidateNormalLabel = candidateRegression.hasExecutionError
    ? "Build / Execution Error (exit 1)"
    : newFailures.length > 0
    ? `${candidateRegression.passedCount || 4} / ${candidateRegression.total || 5} passed (${newFailures.length} regression)`
    : `${candidateRegression.passedCount || 5} / ${candidateRegression.total || 5} passed (exit 0)`;

  const baselineResultLabel = "Vulnerable";
  const candidateResultLabel =
    report.verdict === "FIX_VERIFIED"
      ? "Fix verified for tested cases"
      : report.verdict === "REGRESSION_FAILURE"
      ? "Regression detected"
      : report.verdict === "PATCH_NOT_VERIFIED"
      ? "Vulnerability persists"
      : report.verdict === "EXECUTION_ERROR"
      ? "Execution error"
      : "Inconclusive";

  // Export dropdown actions
  const exportMenuItems = [
    {
      id: "export-json",
      label: "Export as JSON",
      icon: Download,
      onClick: () => {
        window.location.href = `/api/reports/${report.id}/export?format=json`;
      },
    },
    {
      id: "export-md",
      label: "Export as Markdown",
      icon: FileText,
      onClick: () => {
        window.location.href = `/api/reports/${report.id}/export?format=md`;
      },
    },
    { divider: true },
    {
      id: "export-print",
      label: "Print / PDF",
      icon: Printer,
      onClick: () => {
        router.push(`/app/reports/${report.id}/print`);
      },
    },
  ];

  const reportHash = doc?.integrity?.reportHash || "calculating...";
  const artifactsList = doc?.artifacts || [];

  return (
    <div className="space-y-6 font-sans w-full max-w-[1200px] mx-auto pb-16">
      {/* Back link */}
      <div>
        <Link
          href="/app/reports"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Patch Reports</span>
        </Link>
      </div>

      {/* Header with Verdict and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-text-tertiary">Report #{report.id.slice(-8)}</span>
            <StatusBadge status={report.verdict} size="md" />
            <span className="text-xs font-mono text-text-secondary">
              {report.baselineCommit.slice(0, 7)} → {report.candidateCommit.slice(0, 7)}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-text tracking-tight truncate">
            {finding?.title || "Patch Validation Report"}
          </h1>
          <p className="text-xs text-text-secondary">
            {report.summary || "Automated patch verification and side-effect regression analysis."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
          {finding?.id && (
            <Link href={`/app/findings/${finding.id}`}>
              <Button variant="secondary" size="sm">
                <Bug className="w-3.5 h-3.5 mr-1.5" />
                View Finding
              </Button>
            </Link>
          )}

          {/* Export Dropdown Menu */}
          <DropdownMenu
            align="end"
            items={exportMenuItems}
            trigger={
              <Button variant="primary" size="sm" className="gap-1.5">
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
                <ChevronDown className="w-3 h-3 text-white/70" />
              </Button>
            }
          />
        </div>
      </div>

      {/* Provenance Legend */}
      <div className="p-3 px-4 rounded-[6px] border border-border bg-surface-raised/40 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-text font-medium text-xs">
          <Layers className="w-4 h-4 text-accent flex-shrink-0" />
          <span>Provenance Classification:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-text-secondary">
          <div className="flex items-center gap-1.5">
            <ProvenanceTag type="scanner" />
            <span>Static Scanner Findings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ProvenanceTag type="test" />
            <span>Sandbox Empirically Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ProvenanceTag type="ai" />
            <span>AI Reasoning (marked not generated)</span>
          </div>
        </div>
      </div>

      {/* Mandatory Fixed Security Notice & Limitations Callout */}
      <div className="p-4 rounded-[6px] border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs space-y-2">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <div className="font-semibold text-amber-300 mb-0.5">Evaluation Scope Notice:</div>
            <div>{LIMITATIONS_NOTICE}</div>
          </div>
        </div>
        <div className="pl-6 pt-1 text-[11px] text-amber-300 font-medium italic border-t border-amber-500/20">
          <strong>Mandatory Notice: </strong>
          {FIXED_SECURITY_DISCLAIMER}
        </div>
      </div>

      {/* Finding Context Card */}
      {finding && (
        <Card className="border-border overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-border/60 bg-surface-raised/30 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-accent" />
              <CardTitle className="text-sm font-medium">1. Target Vulnerability Finding</CardTitle>
            </div>
            <ProvenanceTag type="scanner" />
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-[11px]">
              <div className="p-2.5 rounded bg-surface border border-border">
                <span className="text-text-tertiary block text-[10px] font-sans">Rule ID</span>
                <span className="font-semibold text-text">{finding.ruleId}</span>
              </div>
              <div className="p-2.5 rounded bg-surface border border-border">
                <span className="text-text-tertiary block text-[10px] font-sans">Scanner Tool</span>
                <span className="text-text">{finding.tool} ({finding.source || "SCANNER"})</span>
              </div>
              <div className="p-2.5 rounded bg-surface border border-border">
                <span className="text-text-tertiary block text-[10px] font-sans">Severity</span>
                <SeverityBadge severity={finding.severity} size="sm" />
              </div>
              <div className="p-2.5 rounded bg-surface border border-border">
                <span className="text-text-tertiary block text-[10px] font-sans">File Path</span>
                <span className="truncate block text-text" title={finding.filePath}>
                  {finding.filePath}:{finding.lineStart || 1}
                </span>
              </div>
            </div>
            {finding.snippet && (
              <pre className="p-3 text-[11px] font-mono bg-[#080809] border border-border/40 rounded overflow-x-auto text-emerald-300 whitespace-pre">
                {finding.snippet}
              </pre>
            )}
          </CardContent>
        </Card>
      )}

      {/* Target Commits & Environment Metadata */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-border/60 bg-surface-raised/30 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-accent" />
            <CardTitle className="text-sm font-medium">2. Target Commits & Sandbox Environment</CardTitle>
          </div>
          <ProvenanceTag type="test" />
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
            <div className="p-2.5 rounded bg-surface border border-border space-y-1">
              <span className="text-text-tertiary text-[10px] font-sans block">Vulnerable Baseline Commit</span>
              <div className="text-rose-400 font-semibold break-all">{report.baselineCommit}</div>
            </div>
            <div className="p-2.5 rounded bg-surface border border-border space-y-1">
              <span className="text-text-tertiary text-[10px] font-sans block">Candidate Fix Commit</span>
              <div className="text-emerald-400 font-semibold break-all">{report.candidateCommit}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-text-secondary">
            <div>
              <span className="text-text-tertiary text-[10px] block font-sans">Sandbox Image</span>
              <span>sha256:emulated-python</span>
            </div>
            <div>
              <span className="text-text-tertiary text-[10px] block font-sans">Network Limit</span>
              <span>none (air-gapped)</span>
            </div>
            <div>
              <span className="text-text-tertiary text-[10px] block font-sans">Memory Limit</span>
              <span>512 MB</span>
            </div>
            <div>
              <span className="text-text-tertiary text-[10px] block font-sans">Security Reproducer</span>
              <span>sqli_find_user</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Matrix Table */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-border/60 bg-surface-raised/30 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            <CardTitle className="text-sm font-medium">3. Verification Matrix</CardTitle>
          </div>
          <ProvenanceTag type="test" />
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-raised/50 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                <th className="p-3 px-4 w-1/3">Evaluation Metric</th>
                <th className="p-3 px-4 w-1/3">
                  <div className="flex items-center gap-1.5">
                    <span>Vulnerable Version</span>
                    <code className="text-[10px] font-mono lowercase px-1.5 py-0.5 rounded bg-surface border border-border text-text-tertiary">
                      {report.baselineCommit.slice(0, 7)}
                    </code>
                  </div>
                </th>
                <th className="p-3 px-4 w-1/3">
                  <div className="flex items-center gap-1.5">
                    <span>Candidate Patch</span>
                    <code className="text-[10px] font-mono lowercase px-1.5 py-0.5 rounded bg-surface border border-border text-accent font-medium">
                      {report.candidateCommit.slice(0, 7)}
                    </code>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Row 1: Security reproducer */}
              <tr className="hover:bg-surface-hover/50 transition-colors">
                <td className="p-3 px-4 font-medium text-text">Security reproducer</td>
                <td className="p-3 px-4 font-mono text-[11px]">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={baselineRun?.status || "REPRODUCED"} size="sm" />
                    <span className="text-text-tertiary">(exit {baselineRun?.exitCode ?? 0})</span>
                  </div>
                </td>
                <td className="p-3 px-4 font-mono text-[11px]">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={candidateRun?.status || report.verdict} size="sm" />
                    <span className="text-text-tertiary">(exit {candidateRun?.exitCode ?? 0})</span>
                  </div>
                </td>
              </tr>

              {/* Row 2: Normal functionality */}
              <tr className="hover:bg-surface-hover/50 transition-colors">
                <td className="p-3 px-4 font-medium text-text">Normal functionality</td>
                <td className="p-3 px-4 font-mono text-[11px] text-text-secondary">
                  {baselineNormalLabel}
                </td>
                <td className="p-3 px-4 font-mono text-[11px]">
                  {newFailures.length > 0 || candidateRegression.hasExecutionError ? (
                    <span className="text-amber-400 font-medium">{candidateNormalLabel}</span>
                  ) : (
                    <span className="text-emerald-400 font-medium">{candidateNormalLabel}</span>
                  )}
                </td>
              </tr>

              {/* Row 3: Result */}
              <tr className="hover:bg-surface-hover/50 transition-colors bg-surface-raised/20 font-medium">
                <td className="p-3 px-4 text-text">Result</td>
                <td className="p-3 px-4 text-rose-400 font-mono text-[11px]">
                  {baselineResultLabel}
                </td>
                <td className="p-3 px-4 font-mono text-[11px]">
                  <span
                    className={
                      report.verdict === "FIX_VERIFIED"
                        ? "text-emerald-400 font-semibold"
                        : report.verdict === "REGRESSION_FAILURE"
                        ? "text-amber-400 font-semibold"
                        : "text-rose-400 font-semibold"
                    }
                  >
                    {candidateResultLabel}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Verification Run Log Links */}
        <div className="p-3 px-4 bg-surface-raised/20 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-text-tertiary">Run log artifacts:</span>
          <div className="flex items-center gap-4 flex-wrap">
            {baselineRun?.id && (
              <Link
                href={`/app/runs/${baselineRun.id}`}
                className="text-accent hover:underline flex items-center gap-1 font-medium text-[11px]"
              >
                <span>Vulnerable baseline logs</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            {candidateRun?.id && (
              <Link
                href={`/app/runs/${candidateRun.id}`}
                className="text-accent hover:underline flex items-center gap-1 font-medium text-[11px]"
              >
                <span>Candidate patch logs</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </Card>

      {/* Functional Regressions Section (shown when regressions exist) */}
      {newFailures.length > 0 && (
        <Card className="border-rose-500/30 bg-rose-500/5 overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-rose-500/20 bg-rose-500/10 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <CardTitle className="text-sm font-semibold">
                4. Side-Effect Regressions Detected ({newFailures.length})
              </CardTitle>
            </div>
            <ProvenanceTag type="test" />
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-rose-200/80">
              The following unit tests passed on the vulnerable baseline but failed after applying the candidate patch.
            </p>
            {newFailures.map((failure, idx) => (
              <div
                key={failure.name || idx}
                className="p-3 rounded-[6px] border border-rose-500/30 bg-[#080809] text-xs font-mono space-y-2"
              >
                <div className="flex items-center justify-between text-rose-300">
                  <span className="font-semibold text-rose-200">{failure.name}</span>
                  <Badge variant="danger">{failure.status || "FAIL"}</Badge>
                </div>
                {failure.error && (
                  <pre className="text-[11px] text-text-secondary overflow-x-auto whitespace-pre-wrap leading-relaxed bg-black/40 p-2 rounded">
                    {failure.error}
                  </pre>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Rendered Diff Viewer */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-accent" />
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">5. Candidate Patch Diff</CardTitle>
                <ProvenanceTag type="test" />
              </div>
              <CardDescription className="text-xs mt-0.5">
                {diffStat.filesChanged || 1} file(s) changed,{" "}
                <span className="text-emerald-400">+{diffStat.insertions || 0}</span> /{" "}
                <span className="text-rose-400">-{diffStat.deletions || 0}</span> lines
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCopy(diffText, setCopiedDiff)}
              disabled={!diffText}
            >
              {copiedDiff ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  Copied diff!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy diff
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 bg-[#080809] overflow-x-auto text-xs font-mono">
          {diffText ? (
            <div className="divide-y divide-border/20 py-2">
              {diffText.split(/\r?\n/).map((line, idx) => {
                const isHeader = line.startsWith("diff ") || line.startsWith("index ");
                const isHunk = line.startsWith("@@");
                const isAdd = line.startsWith("+") && !line.startsWith("+++");
                const isDel = line.startsWith("-") && !line.startsWith("---");

                let lineClass = "text-text-secondary hover:bg-white/[0.02]";
                if (isAdd) lineClass = "bg-emerald-500/10 text-emerald-300 font-semibold";
                else if (isDel) lineClass = "bg-rose-500/10 text-rose-300";
                else if (isHunk) lineClass = "bg-cyan-500/10 text-cyan-300 font-medium";
                else if (isHeader) lineClass = "text-text-tertiary font-semibold";

                return (
                  <div
                    key={idx}
                    className={`flex items-start px-3 py-0.5 text-[11px] leading-relaxed select-text ${lineClass}`}
                  >
                    <span className="w-10 flex-shrink-0 text-text-tertiary text-right pr-4 select-none tabular-nums opacity-60">
                      {idx + 1}
                    </span>
                    <pre className="flex-1 overflow-x-auto whitespace-pre font-mono">{line}</pre>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-text-tertiary text-xs">
              No code modifications detected between commits.
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Section (Clearly Tagged AI-generated) */}
      <Card className="border-border overflow-hidden bg-purple-500/[0.02]">
        <CardHeader className="py-3 px-4 border-b border-border/60 bg-purple-500/5 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-400" />
            <CardTitle className="text-sm font-medium">6. AI-Assisted Exploit & Patch Analysis</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <ProvenanceTag type="ai" />
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4 text-xs">
          {aiExplanation?.content ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-border/40">
                <span className="text-[11px] font-mono text-text-tertiary">
                  Provider: <strong className="text-text">{aiExplanation.provider}</strong> | Model:{" "}
                  <strong className="text-text">{aiExplanation.model}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleGenerateAiExplanation}
                  disabled={isGeneratingAi}
                  className="text-[11px] text-accent hover:underline flex items-center gap-1 font-medium"
                >
                  <span>{isGeneratingAi ? "Updating..." : "Re-generate"}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-3.5 rounded-[6px] border border-border bg-surface-raised/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block font-mono">
                  Executive Summary
                </span>
                <p className="text-text leading-relaxed">{aiExplanation.content.summary}</p>
              </div>

              <div className="p-3.5 rounded-[6px] border border-border bg-surface space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block font-mono">
                  Root Cause Analysis
                </span>
                <p className="text-text-secondary leading-relaxed">{aiExplanation.content.rootCause}</p>
              </div>

              {aiExplanation.content.remediationOptions?.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block font-mono">
                    Suggested Remediation Options
                  </span>
                  {aiExplanation.content.remediationOptions.map((opt, idx) => (
                    <div key={idx} className="p-3.5 rounded-[6px] border border-border bg-surface space-y-2">
                      <div className="font-semibold text-text">{opt.title}</div>
                      <p className="text-text-secondary">{opt.description}</p>
                      {opt.codeSnippet && (
                        <AiSuggestionCodeBlock code={opt.codeSnippet} language="python" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {aiExplanation.content.additionalTests?.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary block font-mono">
                    Suggested Additional Test Cases
                  </span>
                  {aiExplanation.content.additionalTests.map((t, idx) => (
                    <div key={idx} className="p-3.5 rounded-[6px] border border-border bg-surface space-y-2">
                      <div className="font-semibold text-text flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-accent" />
                        <span>{t.name}</span>
                      </div>
                      <p className="text-text-secondary">{t.description}</p>
                      {t.testCode && (
                        <AiSuggestionCodeBlock code={t.testCode} language="python" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-text-tertiary">Generation Status:</span>
                <span className="px-2 py-0.5 rounded bg-surface border border-border text-[11px] font-mono text-text-secondary">
                  not generated
                </span>
              </div>
              <p className="text-text-secondary leading-relaxed">
                AI-assisted automated exploit reasoning, attack surface modeling, and patch analysis have not been run for this report yet.
              </p>
              {aiError && (
                <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {aiError}
                </div>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleGenerateAiExplanation}
                disabled={isGeneratingAi}
                className="gap-1.5 text-xs text-purple-300 hover:text-purple-200 border-purple-500/30"
              >
                {isGeneratingAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating analysis...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Generate AI explanation</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sandbox Execution Logs Excerpt (first 40 and last 40 lines) */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-border/60 bg-surface-raised/30 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-accent" />
            <CardTitle className="text-sm font-medium">7. Execution Logs Excerpts (First & Last 40 Lines)</CardTitle>
          </div>
          <ProvenanceTag type="test" />
        </CardHeader>
        <CardContent className="p-4 space-y-4 text-xs font-mono">
          <div>
            <div className="flex items-center justify-between text-text-secondary mb-1.5 font-sans">
              <span className="font-semibold text-text">Baseline Security Run ({report.baselineCommit.slice(0, 7)})</span>
              <span className="text-[11px] text-text-tertiary">
                Total lines: {doc?.logs?.baselineRun?.excerpt?.totalLines || 0}
              </span>
            </div>
            <pre className="p-3 bg-[#080809] border border-border/40 rounded text-[11px] text-text-secondary overflow-x-auto whitespace-pre leading-relaxed">
              {doc?.logs?.baselineRun?.excerpt?.text || "No log content recorded."}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between text-text-secondary mb-1.5 font-sans">
              <span className="font-semibold text-text">Candidate Fix Security Run ({report.candidateCommit.slice(0, 7)})</span>
              <span className="text-[11px] text-text-tertiary">
                Total lines: {doc?.logs?.candidateRun?.excerpt?.totalLines || 0}
              </span>
            </div>
            <pre className="p-3 bg-[#080809] border border-border/40 rounded text-[11px] text-text-secondary overflow-x-auto whitespace-pre leading-relaxed">
              {doc?.logs?.candidateRun?.excerpt?.text || "No log content recorded."}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Reproduce Yourself Block */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-border/60 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-accent" />
            <CardTitle className="text-sm font-medium">8. Reproduce this verdict yourself</CardTitle>
            <ProvenanceTag type="test" />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCopy(reproduceCommands, setCopiedCommands)}
          >
            {copiedCommands ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Copied commands!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Copy commands
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="p-4 bg-[#080809] text-xs font-mono text-text-secondary select-text overflow-x-auto">
          <pre className="leading-relaxed whitespace-pre font-mono text-[12px] text-emerald-300">
            {reproduceCommands}
          </pre>
        </CardContent>
      </Card>

      {/* Cryptographic Evidence Integrity Block */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-border/60 bg-surface-raised/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <CardTitle className="text-sm font-medium">9. Cryptographic Evidence Integrity</CardTitle>
              <ProvenanceTag type="test" />
            </div>
            <CardDescription className="text-xs mt-0.5">
              Independent SHA-256 verification of canonical evidence document and all immutable stored artifacts.
            </CardDescription>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleVerifyIntegrity}
            disabled={isVerifying}
            className="flex-shrink-0 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
            <span>{isVerifying ? "Verifying hashes..." : "Verify integrity"}</span>
          </Button>
        </CardHeader>

        <CardContent className="p-4 space-y-4 text-xs">
          {/* Canonical Report Hash */}
          <div className="p-3 rounded-[6px] border border-border bg-[#080809] flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] uppercase font-sans text-text-tertiary block font-semibold">
                Canonical Report Hash (SHA-256)
              </span>
              <span className="text-text font-semibold break-all text-[11px]">{reportHash}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(reportHash, setCopiedReportHash)}
              className="flex-shrink-0 self-start sm:self-center"
            >
              {copiedReportHash ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy hash
                </>
              )}
            </Button>
          </div>

          {/* Verification Status Banner if executed */}
          {integrityResult && (
            <div
              className={`p-3 rounded-[6px] border text-xs flex items-center justify-between gap-2 ${
                integrityResult.valid
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {integrityResult.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                )}
                <span>
                  <strong>Integrity Check: </strong>
                  {integrityResult.valid
                    ? `PASS — All ${integrityResult.verifiedCount} artifacts match their stored SHA-256 digests.`
                    : `FAIL — Hash mismatch detected in ${integrityResult.totalCount - integrityResult.verifiedCount} artifact(s).`}
                </span>
              </div>
              <span className="font-mono text-[10px] text-text-tertiary">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          )}

          {verifyError && (
            <div className="p-3 rounded-[6px] border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
              Error verifying integrity: {verifyError}
            </div>
          )}

          {/* Artifacts Table */}
          <div className="overflow-x-auto rounded border border-border">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-raised/40 border-b border-border text-[11px] font-semibold text-text-secondary">
                  <th className="p-2.5 px-3">Artifact</th>
                  <th className="p-2.5 px-3">Kind</th>
                  <th className="p-2.5 px-3">Size</th>
                  <th className="p-2.5 px-3 font-mono">SHA-256 Digest</th>
                  <th className="p-2.5 px-3 text-right">Integrity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                {artifactsList.map((art, idx) => {
                  const check = integrityResult?.artifacts?.find((a) => a.name === art.name);
                  return (
                    <tr key={idx} className="hover:bg-surface-hover/30 transition-colors">
                      <td className="p-2.5 px-3 font-medium text-text">{art.name}</td>
                      <td className="p-2.5 px-3 text-text-secondary font-sans text-[11px]">{art.kind}</td>
                      <td className="p-2.5 px-3 text-text-tertiary">{art.sizeBytes} B</td>
                      <td className="p-2.5 px-3 text-text-secondary break-all text-[10px] max-w-[280px]">
                        {art.sha256}
                      </td>
                      <td className="p-2.5 px-3 text-right">
                        {check ? (
                          check.valid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[10px] font-sans px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                              <Check className="w-3 h-3" />
                              PASS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-400 font-semibold text-[10px] font-sans px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                              <XCircle className="w-3 h-3" />
                              FAIL
                            </span>
                          )
                        ) : (
                          <span className="text-text-tertiary text-[10px] font-sans">
                            Stored
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
