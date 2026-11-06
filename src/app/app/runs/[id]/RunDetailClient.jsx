"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Copy,
  Check,
  Download,
  Search,
  RotateCw,
  GitCommit,
  Hash,
  Box,
  Cpu,
  Clock,
  Layers,
  Shield,
  FileCode,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

function formatDate(isoStr) {
  if (!isoStr) return "—";
  try {
    return new Date(isoStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return isoStr;
  }
}

export function RunDetailClient({ run }) {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRerunning, setIsRerunning] = useState(false);
  const [rerunError, setRerunError] = useState("");

  const finding = run.finding;
  const project = run.project;
  const assertions = run.assertions || {};
  const runItems = assertions.runs || [];
  const environment = run.environment || {};

  const logArtifact = run.artifacts?.find((a) => a.kind === "LOG");
  const rawLogContent =
    logArtifact?.content ||
    `[No execution log artifact found for verification run ${run.id}]`;

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField((curr) => (curr === fieldName ? null : curr));
    }, 2000);
  };

  const handleDownloadLogs = () => {
    const blob = new Blob([rawLogContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `verification-${run.id}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsDownloaded(true);
    setTimeout(() => {
      setIsDownloaded(false);
    }, 2000);
  };

  const handleRerun = async () => {
    setIsRerunning(true);
    setRerunError("");
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "verify",
          projectId: run.projectId,
          payload: {
            findingId: run.findingId,
            targetRef: run.commitSha,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger re-run.");
      }

      // Navigate back to runs list with refresh
      router.push("/app/runs");
      router.refresh();
    } catch (err) {
      setRerunError(err.message || "Failed to start verification re-run.");
      setIsRerunning(false);
    }
  };

  // Plain-language status explanations
  const getStatusExplanation = (status) => {
    switch (status) {
      case "REPRODUCED":
        return {
          title: "Vulnerability Successfully Reproduced",
          body: "The automated test reproducer executed 3 times under isolated sandbox conditions and successfully triggered the vulnerability in every run (precondition_ok: true, reproduced: true). The exploit is confirmed active and reproducible at this commit.",
          variant: "danger",
        };
      case "NOT_REPRODUCED":
        return {
          title: "Vulnerability Not Reproduced",
          body: "All 3 test executions completed with preconditions satisfied without triggering the exploit. Not reproduced does not automatically mean the finding is a false positive: the test may be incomplete or the environment may not represent the affected conditions.",
          variant: "success",
        };
      case "INCONCLUSIVE":
        return {
          title: "Inconclusive Execution Results",
          body: "The test executions produced inconsistent results between runs (flaky behavior), or the required pre-conditions failed to establish reliably across all 3 iterations. The finding cannot be confirmed or refuted without manual inspection.",
          variant: "warning",
        };
      case "EXECUTION_ERROR":
        return {
          title: "Execution Error Encountered",
          body: "An unexpected runtime error, build failure, non-zero exit code, or container fault prevented the test harness from executing cleanly. The reproducer failed before security assertions could be evaluated.",
          variant: "muted",
        };
      default:
        return {
          title: "Unverified Finding",
          body: "No compatible reproducer is available, so this finding remains unverified.",
          variant: "muted",
        };
    }
  };

  const statusExplanation = getStatusExplanation(run.status);

  // Expected vs actual logic
  const getExpectedVsActual = () => {
    const isReproduced = run.status === "REPRODUCED";
    const isNotReproduced = run.status === "NOT_REPRODUCED";
    const isError = run.status === "EXECUTION_ERROR";

    let expected =
      "Expected the security reproducer harness to encounter proper input validation or parameter binding, resulting in unhandled injection denial and reproduced=false.";
    let actual = "";

    if (isReproduced) {
      actual =
        "Vulnerability confirmed: Exploit payload successfully executed arbitrary query logic against the data store. The harness reported reproduced=true and precondition_ok=true across all 3 runs.";
    } else if (isNotReproduced) {
      actual =
        "Exploit prevented: Security defenses rejected or sanitized the exploit payload without executing unauthorized query logic. The harness reported reproduced=false across all 3 runs.";
    } else if (isError) {
      actual = `Harness failed during execution with non-zero exit code (${run.exitCode}). An unhandled exception, syntax error, or environment issue occurred prior to assertion completion.`;
    } else {
      actual =
        "Harness produced inconsistent outputs or failed pre-conditions across execution iterations.";
    }

    return { expected, actual };
  };

  const { expected, actual } = getExpectedVsActual();

  // Log filtering & line numbering
  const logLines = useMemo(() => {
    return rawLogContent.split("\n");
  }, [rawLogContent]);

  const filteredLogLines = useMemo(() => {
    if (!searchQuery.trim()) {
      return logLines.map((line, idx) => ({ line, originalIndex: idx + 1 }));
    }
    const q = searchQuery.toLowerCase();
    const result = [];
    logLines.forEach((line, idx) => {
      if (line.toLowerCase().includes(q)) {
        result.push({ line, originalIndex: idx + 1 });
      }
    });
    return result;
  }, [logLines, searchQuery]);

  // Reproducer command for "Reproduce this yourself"
  const reproducerPath =
    run.reproducerId === "sqli_find_user" || run.reproducerId === "pp-repro-sqli-01"
      ? "security/reproducers/sqli_find_user.py"
      : `${run.reproducerId}.py`;

  const reproduceCommands = `# 1. Checkout the exact commit verified in this run\ngit checkout ${run.commitSha || "main"}\n\n# 2. Run the deterministic reproducer harness in Python\npython ${reproducerPath}`;

  return (
    <div className="space-y-6 font-sans w-full max-w-[1200px] mx-auto pb-12">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <Link
              href="/app/runs"
              className="hover:text-accent transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Verification runs</span>
            </Link>
            <span>/</span>
            <span className="font-mono text-text">Run {run.id.slice(0, 8)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <h1 className="text-xl font-semibold tracking-tight text-text">
              Run {run.id.slice(0, 8)}
            </h1>
            <StatusBadge status={run.status} size="md" />
            {finding && (
              <Link
                href={`/app/findings/${finding.id}`}
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                <span>{finding.title}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRerun}
            disabled={isRerunning}
            className="flex items-center gap-1.5"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRerunning ? "animate-spin" : ""}`} />
            <span>{isRerunning ? "Triggering..." : "Re-run"}</span>
          </Button>
        </div>
      </div>

      {rerunError && (
        <div className="p-3 rounded-[6px] bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{rerunError}</span>
        </div>
      )}

      {/* 1. Status Explanation Banner */}
      <div
        className={`p-4 rounded-[8px] border ${
          statusExplanation.variant === "danger"
            ? "bg-red-500/10 border-red-500/20 text-red-300"
            : statusExplanation.variant === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
            : statusExplanation.variant === "warning"
            ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
            : "bg-surface border-border text-text-secondary"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            {statusExplanation.variant === "danger" && (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            {statusExplanation.variant === "success" && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            {statusExplanation.variant === "warning" && (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            )}
            {statusExplanation.variant === "muted" && (
              <HelpCircle className="w-5 h-5 text-text-tertiary" />
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-text">
              {statusExplanation.title}
            </h2>
            <p className="text-xs leading-relaxed opacity-90">
              {statusExplanation.body}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Step Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <span>Verification Execution Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative border-l-2 border-border ml-3 pl-6 space-y-6 text-xs">
            {/* Step 1: Setup */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                1
              </span>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text">Environment & Source Setup</span>
                  <Badge variant="outline" size="sm">COMPLETED</Badge>
                </div>
                <p className="text-text-secondary text-[11px]">
                  Resolved commit <span className="font-mono text-text">{run.commitSha?.slice(0, 8)}</span>, exported repository archive, recorded reproducer sha256 hash, and initialized isolated sandbox container.
                </p>
              </div>
            </div>

            {/* Step 2-4: Run 1, Run 2, Run 3 */}
            {[1, 2, 3].map((runNum) => {
              const runData = runItems.find((r) => r.runIndex === runNum) || runItems[runNum - 1];
              const exitCode = runData?.exitCode ?? (run.exitCode || 0);
              const duration = runData?.durationMs ? `${runData.durationMs}ms` : "—";
              const assertion = runData?.assertion;
              const hasAssertion = Boolean(assertion);

              return (
                <div key={runNum} className="relative">
                  <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-surface border border-border text-[9px] font-bold text-text">
                    {runNum + 1}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text">Execution Pass {runNum} of 3</span>
                        <span className="font-mono text-[10px] text-text-tertiary">
                          ({duration})
                        </span>
                      </div>
                      <Badge
                        variant={exitCode === 0 ? "outline" : "accent"}
                        size="sm"
                        className={exitCode === 0 ? "text-emerald-400 border-emerald-500/30" : "text-red-400 border-red-500/30"}
                      >
                        exit: {exitCode}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] text-text-secondary pt-0.5">
                      {hasAssertion ? (
                        <>
                          <span className="inline-flex items-center gap-1 font-mono">
                            <span>precondition_ok:</span>
                            <span className={assertion.precondition_ok ? "text-emerald-400" : "text-red-400"}>
                              {String(assertion.precondition_ok)}
                            </span>
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 font-mono">
                            <span>reproduced:</span>
                            <span className={assertion.reproduced ? "text-red-400 font-bold" : "text-emerald-400"}>
                              {String(assertion.reproduced)}
                            </span>
                          </span>
                        </>
                      ) : (
                        <span className="text-text-tertiary italic">
                          No assertion line emitted (process terminated abnormally).
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Step 5: Verdict */}
            <div className="relative">
              <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-surface border border-accent text-[9px] font-bold text-accent">
                5
              </span>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text">Consensus Verdict Classification</span>
                  <StatusBadge status={run.status} size="sm" />
                </div>
                <p className="text-text-secondary text-[11px]">
                  Classification engine evaluated assertions across all 3 passes: <span className="text-text font-medium">{run.summary || statusExplanation.title}</span>. Total run duration: <span className="font-mono text-text">{run.durationMs ? `${(run.durationMs / 1000).toFixed(2)}s` : "—"}</span>.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Expected vs Actual Behavior & Metadata Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expected vs Actual Behavior */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <span>Behavioral Contract (Expected vs Actual)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3.5 rounded-[6px] bg-surface-elevated border border-border space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-text">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>Oracle Expected Specification</span>
                </div>
                <p className="text-text-secondary leading-relaxed pl-3.5 text-[11px]">
                  {expected}
                </p>
              </div>

              <div className="p-3.5 rounded-[6px] bg-surface-elevated border border-border space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-text">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      run.status === "REPRODUCED"
                        ? "bg-red-400"
                        : run.status === "NOT_REPRODUCED"
                        ? "bg-emerald-400"
                        : "bg-amber-400"
                    }`}
                  />
                  <span>Sandbox Observed Execution</span>
                </div>
                <p className="text-text-secondary leading-relaxed pl-3.5 text-[11px]">
                  {actual}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metadata Panel */}
        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Box className="w-4 h-4 text-accent" />
                <span>Execution Metadata</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-tertiary">Commit SHA</span>
                  {copiedField === "commitSha" && (
                    <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Copied!
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between font-mono text-text bg-surface-elevated px-2 py-1 rounded-[4px] mt-0.5 border border-border">
                  <span className="truncate">{run.commitSha || "HEAD"}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(run.commitSha || "", "commitSha")}
                    className="text-text-tertiary hover:text-text ml-2 shrink-0 p-1 rounded hover:bg-surface transition-colors"
                    title="Copy commit SHA"
                    aria-label="Copy commit SHA"
                  >
                    {copiedField === "commitSha" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-tertiary">Test Version (SHA-256)</span>
                  {copiedField === "testVersion" && (
                    <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Copied!
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between font-mono text-text bg-surface-elevated px-2 py-1 rounded-[4px] mt-0.5 border border-border">
                  <span className="truncate">{run.testVersion || "—"}</span>
                  {run.testVersion && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(run.testVersion, "testVersion")}
                      className="text-text-tertiary hover:text-text ml-2 shrink-0 p-1 rounded hover:bg-surface transition-colors"
                      title="Copy test version hash"
                      aria-label="Copy test version hash"
                    >
                      {copiedField === "testVersion" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-text-tertiary">Image Digest:</span>
                  <div className="font-mono text-text truncate">
                    {environment.imageDigest ? environment.imageDigest.slice(0, 16) + "..." : "emulated-sandbox"}
                  </div>
                </div>
                <div>
                  <span className="text-text-tertiary">Worker ID:</span>
                  <div className="font-mono text-text">{environment.workerId || "worker-main"}</div>
                </div>
                <div>
                  <span className="text-text-tertiary">Memory Limit:</span>
                  <div className="font-mono text-text">
                    {environment.sandboxLimits?.memoryMb ? `${environment.sandboxLimits.memoryMb} MB` : "512 MB"}
                  </div>
                </div>
                <div>
                  <span className="text-text-tertiary">CPU Limit:</span>
                  <div className="font-mono text-text">
                    {environment.sandboxLimits?.cpus ? `${environment.sandboxLimits.cpus} core` : "1.0 core"}
                  </div>
                </div>
                <div>
                  <span className="text-text-tertiary">Network Mode:</span>
                  <div className="font-mono text-text">
                    {environment.sandboxLimits?.network || "none (isolated)"}
                  </div>
                </div>
                <div>
                  <span className="text-text-tertiary">Docker / Runtime:</span>
                  <div className="font-mono text-text truncate">
                    {environment.dockerVersion || "emulated sandbox"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. 'Reproduce this yourself' Block */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent" />
              <span>Reproduce This Yourself</span>
            </CardTitle>
            <button
              type="button"
              onClick={() => copyToClipboard(reproduceCommands, "reproduceCommands")}
              aria-label="Copy reproduce commands"
              className="text-xs text-text-secondary hover:text-text flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-surface-elevated border border-border transition-colors"
            >
              {copiedField === "reproduceCommands" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied commands</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy commands</span>
                </>
              )}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <p className="text-text-secondary text-[11px]">
              Every PatchProof verification run is open, deterministic, and fully reproducible on any developer machine without proprietary tooling:
            </p>
            <pre className="p-3.5 rounded-[6px] bg-[#0d1117] text-[#e6edf3] font-mono text-xs overflow-x-auto border border-border">
              {reproduceCommands}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* 5. Monospace Log Viewer with Line Numbers, Search, Copy, Download */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileCode className="w-4 h-4 text-accent" />
              <span>Sandbox Execution Console Logs</span>
              <span className="text-xs text-text-tertiary font-normal">
                ({logLines.length} lines)
              </span>
            </CardTitle>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-text-tertiary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Filter execution logs"
                  className="pl-8 pr-3 py-1 text-xs bg-surface-elevated border border-border rounded-[4px] text-text placeholder:text-text-tertiary focus:outline-none focus:border-accent w-36 sm:w-48"
                />
              </div>

              {/* Copy logs */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copyToClipboard(rawLogContent, "rawLogs")}
                className="flex items-center gap-1.5"
                aria-label="Copy full console logs"
              >
                {copiedField === "rawLogs" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>

              {/* Download logs */}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadLogs}
                className="flex items-center gap-1.5"
                aria-label="Download console log artifact"
              >
                {isDownloaded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-[6px] bg-[#0d1117] text-[#c9d1d9] font-mono text-xs overflow-x-auto border border-border max-h-[500px] overflow-y-auto">
            {filteredLogLines.length === 0 ? (
              <div className="p-8 text-center text-text-tertiary italic">
                No log lines match query &quot;{searchQuery}&quot;
              </div>
            ) : (
              <table className="w-full border-collapse">
                <tbody>
                  {filteredLogLines.map(({ line, originalIndex }) => (
                    <tr
                      key={originalIndex}
                      className="hover:bg-white/[0.04] transition-colors"
                    >
                      <td className="py-0.5 pl-3 pr-4 text-right select-none text-[#484f58] border-r border-[#30363d] w-12 text-[11px]">
                        {originalIndex}
                      </td>
                      <td className="py-0.5 px-3 whitespace-pre text-[11px] leading-relaxed">
                        {line.includes("REPRODUCED") ? (
                          <span className="text-red-400 font-semibold">{line}</span>
                        ) : line.includes("NOT_REPRODUCED") ? (
                          <span className="text-emerald-400 font-semibold">{line}</span>
                        ) : line.includes("STDERR") || line.includes("error") || line.includes("Error") ? (
                          <span className="text-amber-300">{line}</span>
                        ) : (
                          line
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
