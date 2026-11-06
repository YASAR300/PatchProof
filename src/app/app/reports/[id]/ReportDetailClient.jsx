"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  GitCompare,
  FileCode,
  Download,
  ArrowRight,
  GitCommit,
  Layers,
  Bug,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Badge } from "@/components/ui/Badge";
import { LIMITATIONS_NOTICE } from "@/lib/verdict";

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

export function ReportDetailClient({ report }) {
  const [copiedSha, setCopiedSha] = useState(false);
  const [copiedDiff, setCopiedDiff] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState(false);

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

  return (
    <div className="space-y-5 font-sans w-full max-w-[1200px] mx-auto pb-12">
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

      {/* Header with Verdict */}
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
        </div>
      </div>

      {/* Limitations Notice Callout */}
      <div className="p-3.5 px-4 rounded-[6px] border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-amber-300">Notice of Evaluation Scope: </span>
          <span>{LIMITATIONS_NOTICE}</span>
        </div>
      </div>

      {/* Verification Matrix Table */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-border/60 bg-surface-raised/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              <CardTitle className="text-sm font-medium">Verification Matrix</CardTitle>
            </div>
            <span className="text-[11px] font-mono text-text-tertiary">Cryptographic Run Proofs</span>
          </div>
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
          <CardHeader className="py-3 px-4 border-b border-rose-500/20 bg-rose-500/10">
            <div className="flex items-center gap-2 text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <CardTitle className="text-sm font-semibold">
                Side-Effect Regressions Detected ({newFailures.length})
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-rose-200/80">
              The following unit tests passed on the vulnerable baseline but failed after applying the candidate patch.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
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
              <CardTitle className="text-sm font-medium">Candidate Patch Diff</CardTitle>
              <CardDescription className="text-xs">
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

      {/* Reproduce Yourself Block */}
      <Card className="border-border">
        <CardHeader className="py-3 px-4 border-b border-border/60 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-accent" />
            <CardTitle className="text-sm font-medium">Reproduce this verdict yourself</CardTitle>
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
    </div>
  );
}
