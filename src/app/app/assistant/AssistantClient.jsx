"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  Send,
  Terminal,
  FileCheck2,
  Bug,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  HelpCircle,
  Shield,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { AiExplanationView } from "@/components/ai/AiExplanationView";

const TASKS = [
  {
    id: "explain-finding",
    label: "1. Explain finding in plain language",
    description: "Translate scanner rule and code snippet into non-technical vulnerability summary.",
    allowedFor: ["Finding"],
  },
  {
    id: "summarize-run",
    label: "2. Summarize verification run or log",
    description: "Analyze container reproducer exit codes, test passes, and execution logs.",
    allowedFor: ["VerificationRun"],
  },
  {
    id: "explain-report",
    label: "3. Explain patch report in human-readable form",
    description: "Summarize patch verdict, matrix outcomes, regressions, and candidate diff.",
    allowedFor: ["PatchReport"],
  },
  {
    id: "suggest-tests",
    label: "4. Suggest additional test cases",
    description: "Generate boundary cases, attack payloads, and regression unit tests.",
    allowedFor: ["Finding", "VerificationRun", "PatchReport"],
  },
  {
    id: "suggest-remediation",
    label: "5. Suggest remediation options & next steps",
    description: "Propose secure parameterization patterns and tactical debugging checklist.",
    allowedFor: ["Finding", "PatchReport"],
  },
];

export function AssistantClient({
  activeProject,
  findings = [],
  runs = [],
  reports = [],
}) {
  const [targetType, setTargetType] = useState("Finding"); // "Finding" | "VerificationRun" | "PatchReport"
  const [selectedFindingId, setSelectedFindingId] = useState(() => findings[0]?.id || "");
  const [selectedRunId, setSelectedRunId] = useState(() => runs[0]?.id || "");
  const [selectedReportId, setSelectedReportId] = useState(() => reports[0]?.id || "");
  const [selectedTask, setSelectedTask] = useState("explain-finding");

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const findingSelectRef = React.useRef(null);
  const runSelectRef = React.useRef(null);
  const reportSelectRef = React.useRef(null);
  const prevProjectIdRef = React.useRef(activeProject?.id);

  // Synchronize selection ONLY when active project changes
  React.useEffect(() => {
    if (prevProjectIdRef.current !== activeProject?.id) {
      prevProjectIdRef.current = activeProject?.id;
      if (findings.length > 0) setSelectedFindingId(findings[0].id);
      else setSelectedFindingId("");
      if (runs.length > 0) setSelectedRunId(runs[0].id);
      else setSelectedRunId("");
      if (reports.length > 0) setSelectedReportId(reports[0].id);
      else setSelectedReportId("");
      setResult(null);
      setError(null);
    }
  }, [activeProject?.id, findings, runs, reports]);

  // Keep DOM <select> and React state bidirectionally synced for external automation & extensions
  React.useEffect(() => {
    const el = findingSelectRef.current;
    if (!el) return;
    const sync = () => {
      if (el.value && el.value !== selectedFindingId) {
        setSelectedFindingId(el.value);
        setResult(null);
        setError(null);
      }
    };
    el.addEventListener("change", sync);
    el.addEventListener("input", sync);
    return () => {
      el.removeEventListener("change", sync);
      el.removeEventListener("input", sync);
    };
  }, [selectedFindingId]);

  React.useEffect(() => {
    const el = runSelectRef.current;
    if (!el) return;
    const sync = () => {
      if (el.value && el.value !== selectedRunId) {
        setSelectedRunId(el.value);
        setResult(null);
        setError(null);
      }
    };
    el.addEventListener("change", sync);
    el.addEventListener("input", sync);
    return () => {
      el.removeEventListener("change", sync);
      el.removeEventListener("input", sync);
    };
  }, [selectedRunId]);

  React.useEffect(() => {
    const el = reportSelectRef.current;
    if (!el) return;
    const sync = () => {
      if (el.value && el.value !== selectedReportId) {
        setSelectedReportId(el.value);
        setResult(null);
        setError(null);
      }
    };
    el.addEventListener("change", sync);
    el.addEventListener("input", sync);
    return () => {
      el.removeEventListener("change", sync);
      el.removeEventListener("input", sync);
    };
  }, [selectedReportId]);

  // When target type changes, adjust default task and clear transient result
  const handleTargetTypeChange = (type) => {
    setTargetType(type);
    setResult(null);
    setError(null);
    if (type === "Finding") {
      setSelectedTask("explain-finding");
      if (findings.length > 0 && (!selectedFindingId || !findings.some((f) => f.id === selectedFindingId))) {
        setSelectedFindingId(findings[0].id);
      }
    } else if (type === "VerificationRun") {
      setSelectedTask("summarize-run");
      if (runs.length > 0 && (!selectedRunId || !runs.some((r) => r.id === selectedRunId))) {
        setSelectedRunId(runs[0].id);
      }
    } else if (type === "PatchReport") {
      setSelectedTask("explain-report");
      if (reports.length > 0 && (!selectedReportId || !reports.some((p) => p.id === selectedReportId))) {
        setSelectedReportId(reports[0].id);
      }
    }
  };

  const handleSelectFinding = (id) => {
    setSelectedFindingId(id);
    if (findingSelectRef.current && findingSelectRef.current.value !== id) {
      findingSelectRef.current.value = id;
    }
    setResult(null);
    setError(null);
  };

  const handleSelectRun = (id) => {
    setSelectedRunId(id);
    if (runSelectRef.current && runSelectRef.current.value !== id) {
      runSelectRef.current.value = id;
    }
    setResult(null);
    setError(null);
  };

  const handleSelectReport = (id) => {
    setSelectedReportId(id);
    if (reportSelectRef.current && reportSelectRef.current.value !== id) {
      reportSelectRef.current.value = id;
    }
    setResult(null);
    setError(null);
  };

  const getTargetEntityId = () => {
    if (targetType === "Finding") {
      const domVal = findingSelectRef.current?.value;
      if (domVal && domVal !== selectedFindingId && findings.some((f) => f.id === domVal)) {
        return domVal;
      }
      return selectedFindingId;
    }
    if (targetType === "VerificationRun") {
      const domVal = runSelectRef.current?.value;
      if (domVal && domVal !== selectedRunId && runs.some((r) => r.id === domVal)) {
        return domVal;
      }
      return selectedRunId;
    }
    if (targetType === "PatchReport") {
      const domVal = reportSelectRef.current?.value;
      if (domVal && domVal !== selectedReportId && reports.some((p) => p.id === domVal)) {
        return domVal;
      }
      return selectedReportId;
    }
    return null;
  };

  const handleRunAnalysis = async () => {
    const entityId = getTargetEntityId();
    if (!entityId) {
      setError("Please select a target entity from the list.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: selectedTask,
          entityType: targetType,
          entityId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Analysis request failed (HTTP ${res.status})`);
      }

      setResult({
        explanation: data.data,
        provider: data.provider,
        model: data.model,
        cached: Boolean(data.cached),
      });
    } catch (err) {
      console.error("Assistant execution failed:", err);
      setError(err.message || "Failed to generate AI analysis");
    } finally {
      setIsLoading(false);
    }
  };

  // Find currently selected item for details preview
  const currentTargetId = getTargetEntityId();
  const currentFinding = findings.find((f) => f.id === currentTargetId);
  const currentRun = runs.find((r) => r.id === currentTargetId);
  const currentReport = reports.find((p) => p.id === currentTargetId);

  return (
    <div className="space-y-6 font-sans w-full max-w-[1240px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-text tracking-tight">
              AI Security Assistant
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Evidence-Grounded
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Plain-language root cause explanations, test harness synthesis, and candidate patch insights.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-text-tertiary">
          <span>Project:</span>
          <span className="font-semibold text-text">{activeProject?.name || "All Workspaces"}</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Target Selection & Task Config */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-border/60 bg-surface-raised/40">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent" />
                <CardTitle className="text-sm font-medium">1. Select Target Evidence</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              {/* Entity Type Selector Tabs */}
              <div>
                <label className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider block font-mono mb-1.5">
                  Target Entity Kind
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-[#080809] rounded-[6px] border border-border">
                  <button
                    type="button"
                    onClick={() => handleTargetTypeChange("Finding")}
                    className={`py-1.5 px-2 rounded-[4px] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      targetType === "Finding"
                        ? "bg-surface-raised text-text shadow-sm"
                        : "text-text-secondary hover:text-text"
                    }`}
                  >
                    <Bug className="w-3.5 h-3.5" />
                    <span>Finding</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTargetTypeChange("VerificationRun")}
                    className={`py-1.5 px-2 rounded-[4px] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      targetType === "VerificationRun"
                        ? "bg-surface-raised text-text shadow-sm"
                        : "text-text-secondary hover:text-text"
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Run</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTargetTypeChange("PatchReport")}
                    className={`py-1.5 px-2 rounded-[4px] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      targetType === "PatchReport"
                        ? "bg-surface-raised text-text shadow-sm"
                        : "text-text-secondary hover:text-text"
                    }`}
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                </div>
              </div>

              {/* Target Entity Dropdown & Quick Selector */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider block font-mono mb-1">
                  {targetType === "Finding"
                    ? "Select Vulnerability Finding"
                    : targetType === "VerificationRun"
                    ? "Select Verification Run"
                    : "Select Patch Report"}
                </label>

                {targetType === "Finding" && (
                  findings.length > 0 ? (
                    <div className="space-y-2">
                      <select
                        ref={findingSelectRef}
                        id="assistant-finding-select"
                        name="selectedFindingId"
                        data-testid="assistant-finding-select"
                        key="select-finding"
                        value={selectedFindingId}
                        onChange={(e) => handleSelectFinding(e.target.value)}
                        onInput={(e) => handleSelectFinding(e.target.value)}
                        className="w-full h-9 rounded-[6px] border border-border bg-surface px-2.5 text-xs text-text outline-none focus:border-accent hover:border-border-strong font-sans cursor-pointer"
                      >
                        {findings.map((f) => (
                          <option key={f.id} value={f.id} data-id={f.id}>
                            [{f.severity}] {f.title} ({f.filePath}:{f.lineStart || 1})
                          </option>
                        ))}
                      </select>

                      {/* Direct Clickable Finding Cards */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] text-text-tertiary block font-mono">
                          Quick Target Selection:
                        </span>
                        <div className="space-y-1">
                          {findings.map((f) => {
                            const isSelected = f.id === (getTargetEntityId() || selectedFindingId);
                            return (
                              <button
                                key={f.id}
                                type="button"
                                data-testid={`target-finding-${f.id}`}
                                onClick={() => handleSelectFinding(f.id)}
                                className={`w-full text-left p-2 rounded-[5px] border transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                  isSelected
                                    ? "bg-purple-500/15 border-purple-500/50 text-text font-medium shadow-sm"
                                    : "bg-surface border-border text-text-secondary hover:border-border-strong hover:text-text"
                                }`}
                              >
                                <div className="truncate text-xs">
                                  <span className="text-[10px] font-mono mr-1.5 uppercase font-bold text-accent">
                                    [{f.severity}]
                                  </span>
                                  <span>{f.title}</span>
                                </div>
                                {isSelected && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 shrink-0 font-semibold">
                                    Selected
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-surface border border-border rounded text-text-tertiary text-xs">
                      No findings available in current workspace.
                    </div>
                  )
                )}

                {targetType === "VerificationRun" && (
                  runs.length > 0 ? (
                    <div className="space-y-2">
                      <select
                        ref={runSelectRef}
                        id="assistant-run-select"
                        name="selectedRunId"
                        data-testid="assistant-run-select"
                        key="select-run"
                        value={selectedRunId}
                        onChange={(e) => handleSelectRun(e.target.value)}
                        onInput={(e) => handleSelectRun(e.target.value)}
                        className="w-full h-9 rounded-[6px] border border-border bg-surface px-2.5 text-xs text-text outline-none focus:border-accent hover:border-border-strong font-mono cursor-pointer"
                      >
                        {runs.map((r) => (
                          <option key={r.id} value={r.id} data-id={r.id}>
                            [{r.status}] Run #{r.id.slice(-8)} — {r.reproducerId || "reproducer"} ({String(r.commitSha).slice(0, 7)})
                          </option>
                        ))}
                      </select>

                      {/* Direct Clickable Run Cards */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] text-text-tertiary block font-mono">
                          Quick Target Selection:
                        </span>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {runs.slice(0, 6).map((r) => {
                            const isSelected = r.id === (getTargetEntityId() || selectedRunId);
                            return (
                              <button
                                key={r.id}
                                type="button"
                                data-testid={`target-run-${r.id}`}
                                onClick={() => handleSelectRun(r.id)}
                                className={`w-full text-left p-2 rounded-[5px] border transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                  isSelected
                                    ? "bg-purple-500/15 border-purple-500/50 text-text font-medium shadow-sm"
                                    : "bg-surface border-border text-text-secondary hover:border-border-strong hover:text-text"
                                }`}
                              >
                                <div className="truncate text-xs font-mono">
                                  <span className="text-[10px] mr-1.5 font-bold text-accent">[{r.status}]</span>
                                  <span>#{r.id.slice(-8)} ({String(r.commitSha).slice(0, 7)})</span>
                                </div>
                                {isSelected && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 shrink-0 font-semibold">
                                    Selected
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-surface border border-border rounded text-text-tertiary text-xs">
                      No verification runs recorded yet.
                    </div>
                  )
                )}

                {targetType === "PatchReport" && (
                  reports.length > 0 ? (
                    <div className="space-y-2">
                      <select
                        ref={reportSelectRef}
                        id="assistant-report-select"
                        name="selectedReportId"
                        data-testid="assistant-report-select"
                        key="select-report"
                        value={selectedReportId}
                        onChange={(e) => handleSelectReport(e.target.value)}
                        onInput={(e) => handleSelectReport(e.target.value)}
                        className="w-full h-9 rounded-[6px] border border-border bg-surface px-2.5 text-xs text-text outline-none focus:border-accent hover:border-border-strong font-sans cursor-pointer"
                      >
                        {reports.map((p) => (
                          <option key={p.id} value={p.id} data-id={p.id}>
                            [{p.verdict}] Report #{p.id.slice(-8)} ({String(p.baselineCommit).slice(0, 7)} → {String(p.candidateCommit).slice(0, 7)})
                          </option>
                        ))}
                      </select>

                      {/* Direct Clickable Report Cards */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] text-text-tertiary block font-mono">
                          Quick Target Selection:
                        </span>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {reports.slice(0, 8).map((p) => {
                            const isSelected = p.id === (getTargetEntityId() || selectedReportId);
                            return (
                              <button
                                key={p.id}
                                type="button"
                                data-testid={`target-report-${p.id}`}
                                onClick={() => handleSelectReport(p.id)}
                                className={`w-full text-left p-2 rounded-[5px] border transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                  isSelected
                                    ? "bg-purple-500/15 border-purple-500/50 text-text font-medium shadow-sm"
                                    : "bg-surface border-border text-text-secondary hover:border-border-strong hover:text-text"
                                }`}
                              >
                                <div className="truncate text-xs">
                                  <span className="text-[10px] font-mono mr-1.5 font-bold text-accent">[{p.verdict}]</span>
                                  <span className="font-mono">#{p.id.slice(-8)}</span>
                                  <span className="text-text-tertiary ml-1 text-[11px] font-mono">
                                    ({String(p.baselineCommit).slice(0, 7)} → {String(p.candidateCommit).slice(0, 7)})
                                  </span>
                                </div>
                                {isSelected && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 shrink-0 font-semibold">
                                    Selected
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-surface border border-border rounded text-text-tertiary text-xs">
                      No patch reports recorded yet.
                    </div>
                  )
                )}
              </div>

              {/* Target Preview Pill */}
              <div
                data-testid="selected-target-preview"
                className="p-3 rounded-[6px] bg-[#080809] border border-border space-y-1.5 text-xs font-mono"
              >
                <div className="flex items-center justify-between text-[11px] text-text-secondary">
                  <span className="text-text-tertiary">Selected Target ID:</span>
                  <span data-testid="selected-target-id" className="text-accent font-semibold">
                    {getTargetEntityId() || "none"}
                  </span>
                </div>
                {targetType === "Finding" && currentFinding && (
                  <div className="text-text-secondary font-sans text-xs truncate border-t border-border/40 pt-1.5">
                    <span className="text-text font-medium">Target: {currentFinding.title}</span>
                  </div>
                )}
                {targetType === "PatchReport" && currentReport && (
                  <div className="text-text-secondary font-sans text-xs flex items-center justify-between border-t border-border/40 pt-1.5">
                    <span className="text-text font-medium">Verdict: {currentReport.verdict}</span>
                    <span className="text-text-tertiary font-mono">
                      {String(currentReport.baselineCommit).slice(0, 7)} → {String(currentReport.candidateCommit).slice(0, 7)}
                    </span>
                  </div>
                )}
                {targetType === "VerificationRun" && currentRun && (
                  <div className="text-text-secondary font-sans text-xs flex items-center justify-between border-t border-border/40 pt-1.5">
                    <span className="text-text font-medium">Status: {currentRun.status}</span>
                    <span className="text-text-tertiary font-mono">
                      commit: {String(currentRun.commitSha).slice(0, 7)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Task Configuration Card */}
          <Card className="border-border overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-border/60 bg-surface-raised/40">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <CardTitle className="text-sm font-medium">2. Choose Analysis Task</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="space-y-2">
                {TASKS.map((t) => {
                  const isRecommended = t.allowedFor.includes(targetType);
                  const isSelected = selectedTask === t.id;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTask(t.id)}
                      className={`w-full text-left p-3 rounded-[6px] border transition-all ${
                        isSelected
                          ? "bg-purple-500/10 border-purple-500/40 text-text"
                          : "bg-surface border-border text-text-secondary hover:border-border-strong hover:text-text"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${isSelected ? "text-purple-300 font-semibold" : ""}`}>
                          {t.label}
                        </span>
                        {isRecommended && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-raised text-text-tertiary">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-tertiary leading-relaxed">
                        {t.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="p-3 rounded-[6px] border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <Button
                variant="primary"
                size="md"
                onClick={handleRunAnalysis}
                disabled={isLoading || !getTargetEntityId()}
                className="w-full gap-2 font-medium"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing evidence...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Generate AI Analysis</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (7 cols): Analysis Results Panel */}
        <div className="lg:col-span-7">
          <Card className="border-border overflow-hidden min-h-[540px]">
            <CardHeader className="py-3 px-4 border-b border-border/60 bg-surface-raised/40 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <CardTitle className="text-sm font-medium">Assistant Findings & Recommendations</CardTitle>
              </div>

              {result && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-secondary">
                  {result.provider} / {result.model}
                </span>
              )}
            </CardHeader>

            <CardContent className="p-5">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                  <div className="space-y-1">
                    <p className="font-semibold text-text text-sm">Evaluating Grounded Evidence...</p>
                    <p className="text-xs text-text-tertiary max-w-sm">
                      Sanitizing secrets, loading execution logs, verifying cited references, and structuring recommendations.
                    </p>
                  </div>
                </div>
              ) : result ? (
                <AiExplanationView
                  explanation={result.explanation}
                  provider={result.provider}
                  model={result.model}
                  cached={result.cached}
                />
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 text-text-tertiary">
                  <div className="w-12 h-12 rounded-full bg-surface-raised border border-border flex items-center justify-center">
                    <Bot className="w-6 h-6 text-text-tertiary stroke-[1.5]" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <p className="font-semibold text-text text-sm">No analysis generated yet</p>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Select a security finding, verification run, or patch report on the left panel, choose an analysis task, and click{" "}
                      <strong>Generate AI Analysis</strong> to inspect grounded explanations and suggested tests.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

