"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  FolderGit2,
  GitCommit,
  Layers,
  Sparkles,
  FileCheck,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { PageHeader } from "@/components/app/PageHeader";

export function ImportFindingsClient({ projects = [], initialProjectId = null }) {
  const router = useRouter();

  // Selected project
  const [selectedProjectId, setSelectedProjectId] = useState(
    initialProjectId || (projects[0]?.id || "")
  );

  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  // Commit SHA
  const [commitSha, setCommitSha] = useState(
    selectedProject?.lastScannedCommit || selectedProject?.latestCommitSha || "9d13f9f"
  );
  const [shaError, setShaError] = useState("");

  // Format selection
  const [format, setFormat] = useState("auto");

  // File upload state
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Wizard state: 1: Configure & Upload, 2: Preview, 3: Result Summary
  const [step, setStep] = useState(1);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewError, setPreviewError] = useState("");

  // Confirm state
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmResult, setConfirmResult] = useState(null);
  const [confirmError, setConfirmError] = useState("");

  // Quick sample loaders for effortless reviewer testing and Devfolio screenshots
  const handleLoadSample = async (samplePath, sampleName) => {
    try {
      setFileError("");
      const res = await fetch(`/samples/${sampleName}`);
      if (!res.ok) {
        throw new Error(`Failed to load ${sampleName} from /samples`);
      }
      const text = await res.text();
      setFile({ name: sampleName, size: text.length });
      setFileContent(text);
    } catch (err) {
      setFileError(`Could not load sample: ${err.message}`);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    validateAndSetFile(selected);
  };

  const validateAndSetFile = (selected) => {
    setFileError("");
    if (!selected) return;

    // Check size (max 5 MB)
    if (selected.size > 5 * 1024 * 1024) {
      setFileError(`File is too large (${(selected.size / (1024 * 1024)).toFixed(2)} MB). Maximum allowed size is 5 MB.`);
      return;
    }

    // Check extension
    const name = selected.name.toLowerCase();
    if (!name.endsWith(".json") && !name.endsWith(".sarif")) {
      setFileError(`Invalid file extension for '${selected.name}'. Only .json and .sarif files are supported.`);
      return;
    }

    setFile(selected);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target.result);
    };
    reader.readAsText(selected);
  };

  // Step 1 -> Step 2: Trigger Preview
  const handlePreview = async () => {
    setShaError("");
    setPreviewError("");

    // Validate commit SHA (7-40 hex chars)
    const cleanSha = (commitSha || "").trim();
    if (!/^[0-9a-fA-F]{7,40}$/.test(cleanSha)) {
      setShaError("Commit SHA must be a valid 7 to 40 character hexadecimal hash (e.g. '9d13f9f').");
      return;
    }

    if (!selectedProjectId) {
      setPreviewError("Please choose a project.");
      return;
    }

    if (!fileContent) {
      setFileError("Please upload a report file (.json or .sarif) to proceed.");
      return;
    }

    setIsPreviewing(true);
    try {
      const res = await fetch("/api/findings/import/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          commitSha: cleanSha,
          format,
          content: fileContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPreviewError(data.error || "Failed to parse report file.");
        setIsPreviewing(false);
        return;
      }

      setPreviewData(data);
      setStep(2);
    } catch (err) {
      setPreviewError(err.message || "Network error while parsing report.");
    } finally {
      setIsPreviewing(false);
    }
  };

  // Step 2 -> Step 3: Trigger Confirm
  const handleConfirm = async () => {
    if (!previewData || !previewData.allFindings) return;
    setIsConfirming(true);
    setConfirmError("");

    try {
      const res = await fetch("/api/findings/import/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          commitSha: previewData.commitSha,
          findings: previewData.allFindings,
          toolName: previewData.toolName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setConfirmError(data.error || "Failed to import findings.");
        setIsConfirming(false);
        return;
      }

      setConfirmResult(data.summary);
      setStep(3);
    } catch (err) {
      setConfirmError(err.message || "Failed to commit findings.");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-6 font-sans">
      <PageHeader
        title="Import Scanner Report"
        description="Ingest findings from external static analysis tools (SARIF 2.1.0 and Semgrep JSON) into your PatchProof verification queue."
        actions={
          <Link href="/app/findings">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to findings
            </Button>
          </Link>
        }
      />

      {/* Step Progress Pills */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-surface border border-border text-xs select-none">
        <div
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors ${
            step === 1 ? "bg-surface-selected text-text shadow-xs" : "text-text-tertiary"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[11px] font-bold">
            1
          </span>
          <span>Configure & Upload</span>
        </div>
        <div className="w-4 h-px bg-border flex-shrink-0" />
        <div
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors ${
            step === 2 ? "bg-surface-selected text-text shadow-xs" : "text-text-tertiary"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[11px] font-bold">
            2
          </span>
          <span>Preview & Validate</span>
        </div>
        <div className="w-4 h-px bg-border flex-shrink-0" />
        <div
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors ${
            step === 3 ? "bg-surface-selected text-text shadow-xs" : "text-text-tertiary"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[11px] font-bold">
            3
          </span>
          <span>Import Summary</span>
        </div>
      </div>

      {/* STEP 1: CONFIGURE & UPLOAD */}
      {step === 1 && (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>1. Target Project & Commit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Project selector */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-medium text-text">Destination Project</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => {
                      setSelectedProjectId(e.target.value);
                      const p = projects.find((x) => x.id === e.target.value);
                      if (p?.lastScannedCommit || p?.latestCommitSha) {
                        setCommitSha(p.lastScannedCommit || p.latestCommitSha);
                      }
                    }}
                    className="w-full h-9 px-3 rounded-[6px] border border-border bg-surface text-text text-xs outline-none focus:border-accent"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.isDemo ? "(Demo Target)" : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-text-tertiary">
                    Findings will be scoped to this repository in PatchProof.
                  </p>
                </div>

                {/* Commit SHA */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-medium text-text">Commit SHA</label>
                  <div className="relative">
                    <GitCommit className="w-3.5 h-3.5 text-text-tertiary absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={commitSha}
                      onChange={(e) => {
                        setCommitSha(e.target.value);
                        setShaError("");
                      }}
                      placeholder="e.g. 9d13f9f57a87..."
                      className="w-full h-9 pl-8 pr-3 rounded-[6px] border border-border bg-surface text-text font-mono text-xs outline-none focus:border-accent"
                    />
                  </div>
                  {shaError ? (
                    <p className="text-[11px] text-rose-400 font-medium">{shaError}</p>
                  ) : (
                    <p className="text-[11px] text-text-tertiary">
                      7 to 40 hex characters. Defaults to the repository's latest commit.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>2. Report Format & File Upload</CardTitle>
                <p className="text-[11px] text-text-tertiary mt-0.5">
                  Upload a standard SARIF 2.1.0 or Semgrep JSON report file (max 5 MB).
                </p>
              </div>

              {/* Format dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-text-tertiary">Format:</span>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="h-8 px-2.5 rounded-[6px] border border-border bg-surface text-text text-xs outline-none focus:border-accent font-medium"
                >
                  <option value="auto">Auto-detect format</option>
                  <option value="sarif">SARIF 2.1.0</option>
                  <option value="semgrep">Semgrep JSON</option>
                </select>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const dropped = e.dataTransfer.files?.[0];
                  validateAndSetFile(dropped);
                }}
                className={`relative p-8 rounded-xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? "border-accent bg-accent/5"
                    : file
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-border hover:border-text-secondary bg-surface-raised/20"
                }`}
              >
                <input
                  type="file"
                  id="report-file-input"
                  accept=".json,.sarif"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />

                {file ? (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-xs">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text">{file.name}</p>
                      <p className="text-[11px] text-text-tertiary font-mono mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB • Ready for preview
                      </p>
                    </div>
                    <span className="text-[11px] text-accent underline cursor-pointer">
                      Click or drag another file to replace
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-surface-raised border border-border text-text-secondary flex items-center justify-center">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text">
                        Drag and drop your report file here, or browse
                      </p>
                      <p className="text-[11px] text-text-tertiary mt-0.5">
                        Supports .sarif and .json files up to 5 MB
                      </p>
                    </div>
                  </>
                )}
              </div>

              {fileError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{fileError}</span>
                </div>
              )}

              {previewError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{previewError}</span>
                </div>
              )}

              {/* Sample files quick-selector banner */}
              <div className="p-3.5 rounded-xl bg-surface-raised/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-text">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="font-medium">Test with bundled sample reports:</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSample("/samples/sample.sarif", "sample.sarif")}
                    className="px-2.5 py-1 rounded-[6px] bg-surface hover:bg-surface-hover border border-border font-mono text-[11px] text-text-secondary hover:text-text transition-colors"
                  >
                    sample.sarif
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample("/samples/semgrep-sample.json", "semgrep-sample.json")}
                    className="px-2.5 py-1 rounded-[6px] bg-surface hover:bg-surface-hover border border-border font-mono text-[11px] text-text-secondary hover:text-text transition-colors"
                  >
                    semgrep-sample.json
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample("/samples/malformed.sarif", "malformed.sarif")}
                    className="px-2.5 py-1 rounded-[6px] bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 font-mono text-[11px] text-rose-400 transition-colors"
                    title="Deliberately invalid SARIF to test error handling"
                  >
                    malformed.sarif
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  disabled={!fileContent || isPreviewing}
                  onClick={handlePreview}
                >
                  {isPreviewing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Parsing and validating...
                    </>
                  ) : (
                    <>
                      Preview findings
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* STEP 2: PREVIEW & VALIDATE */}
      {step === 2 && previewData && (
        <div className="space-y-5">
          {/* Metadata Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Report Validation & Analysis</CardTitle>
                <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-text-tertiary">
                  <span className="text-text-secondary">{previewData.toolName}</span>
                  <span>•</span>
                  <span>Format: {previewData.detectedFormat.toUpperCase()}</span>
                  <span>•</span>
                  <span>Target Commit: {previewData.commitSha.slice(0, 10)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Upload different file
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirm}
                  disabled={isConfirming || previewData.newCount === 0}
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Importing...
                    </>
                  ) : (
                    <>
                      Confirm & Import {previewData.newCount} Finding{previewData.newCount === 1 ? "" : "s"}
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Severity & Duplicate Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-raised border border-border">
                  <span className="text-[11px] text-text-tertiary block">Total Parsed</span>
                  <span className="text-lg font-bold text-text tabular-nums font-mono mt-0.5 block">
                    {previewData.totalCount}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <span className="text-[11px] text-rose-400 font-medium block">Critical</span>
                  <span className="text-lg font-bold text-rose-400 tabular-nums font-mono mt-0.5 block">
                    {previewData.severityCounts.CRITICAL}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <span className="text-[11px] text-orange-400 font-medium block">High</span>
                  <span className="text-lg font-bold text-orange-400 tabular-nums font-mono mt-0.5 block">
                    {previewData.severityCounts.HIGH}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[11px] text-amber-400 font-medium block">Medium</span>
                  <span className="text-lg font-bold text-amber-400 tabular-nums font-mono mt-0.5 block">
                    {previewData.severityCounts.MEDIUM}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <span className="text-[11px] text-blue-400 font-medium block">Low / Info</span>
                  <span className="text-lg font-bold text-blue-400 tabular-nums font-mono mt-0.5 block">
                    {previewData.severityCounts.LOW + previewData.severityCounts.INFO}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface-raised border border-border">
                  <span className="text-[11px] text-text-tertiary block">Duplicates</span>
                  <span className="text-lg font-bold text-text-tertiary tabular-nums font-mono mt-0.5 block">
                    {previewData.duplicateCount}
                  </span>
                </div>
              </div>

              {previewData.duplicateCount > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    {previewData.duplicateCount} finding{previewData.duplicateCount === 1 ? "" : "s"} in this report already exist in PatchProof for this project and will be automatically skipped to prevent duplicate noise.
                  </span>
                </div>
              )}

              {confirmError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{confirmError}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* First 20 Findings Preview Table */}
          <Card>
            <CardHeader className="py-3 px-4 border-b border-border bg-surface-raised/20">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text">
                  Findings Preview ({Math.min(previewData.firstFindings.length, 20)} of {previewData.totalCount})
                </span>
                <span className="text-text-tertiary font-mono text-[11px]">
                  Tool: {previewData.toolName}
                </span>
              </div>
            </CardHeader>

            <div className="divide-y divide-border/60">
              {previewData.firstFindings.map((f, idx) => (
                <div key={idx} className="p-3.5 hover:bg-surface-hover text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <SeverityBadge severity={f.severity} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text truncate">{f.title}</span>
                        {f.isDuplicate && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Duplicate (will skip)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-tertiary font-mono">
                        <span className="text-text-secondary">{f.filePath}:{f.lineStart}</span>
                        <span>•</span>
                        <span className="truncate max-w-[200px]">{f.ruleId}</span>
                        {f.cwe && (
                          <>
                            <span>•</span>
                            <span className="text-accent">{f.cwe}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-raised border border-border text-text-secondary">
                    {previewData.toolName}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* STEP 3: RESULT SUMMARY */}
      {step === 3 && confirmResult && (
        <Card className="border-emerald-500/30 bg-surface">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-text">Import Completed Successfully</h2>
              <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                Security report from <span className="text-text font-semibold">{confirmResult.tool}</span> has been ingested and linked to project{" "}
                <span className="text-text font-semibold">{selectedProject?.name}</span> at commit{" "}
                <span className="font-mono text-accent">{confirmResult.commitSha.slice(0, 10)}</span>.
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-xs">
              <div className="p-4 rounded-xl bg-surface-raised/50 border border-border">
                <span className="text-text-tertiary text-[11px] block">Created Findings</span>
                <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
                  {confirmResult.createdCount}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-surface-raised/50 border border-border">
                <span className="text-text-tertiary text-[11px] block">Duplicates Skipped</span>
                <span className="text-2xl font-bold text-text-secondary font-mono mt-1 block">
                  {confirmResult.duplicateCount}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-surface-raised/50 border border-border">
                <span className="text-text-tertiary text-[11px] block">Total In Report</span>
                <span className="text-2xl font-bold text-text font-mono mt-1 block">
                  {confirmResult.totalReceived}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/app/findings">
                <Button variant="primary" size="md">
                  View imported findings
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setStep(1);
                  setFile(null);
                  setFileContent("");
                  setPreviewData(null);
                  setConfirmResult(null);
                }}
              >
                Import another report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

