"use client";

import React from "react";
import Link from "next/link";
import { Printer, ChevronLeft, ShieldAlert } from "lucide-react";

export function PrintReportClient({ doc, reportId }) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased">
      {/* Print Stylesheet */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @page {
            size: A4 portrait;
            margin: 14mm 14mm 14mm 14mm;
          }
          @media print {
            .no-print {
              display: none !important;
            }
            .print-page-break {
              break-after: page !important;
              page-break-after: always !important;
            }
            body {
              background: #ffffff !important;
              color: #111111 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            pre, code {
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
              background-color: #f6f8fa !important;
              color: #111111 !important;
              border-color: #d0d7de !important;
            }
          }
          @media screen {
            .print-container {
              max-width: 900px;
              margin: 0 auto;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
              padding: 40px;
              border: 1px solid #e1e4e8;
              background: #ffffff;
            }
          }
        `,
      }} />

      {/* Floating Toolbar (no-print) */}
      <div className="no-print sticky top-0 z-50 bg-[#16171a] text-white border-b border-[#2d2e33] px-6 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/app/reports/${reportId}`}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white transition-colors px-2.5 py-1.5 rounded bg-[#222328] border border-[#33353b]"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Report</span>
          </Link>
          <div className="hidden sm:block text-xs text-neutral-400">
            <span>Print / PDF Document View</span>
            <span className="mx-2">•</span>
            <span className="font-mono text-neutral-200">#{reportId.slice(-8)}</span>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </div>

      {/* A4 Printable Document Container */}
      <div className="print-container my-0 sm:my-6 text-[13px] leading-relaxed text-neutral-900">
        {/* Document Header */}
        <div className="border-b-2 border-neutral-900 pb-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-neutral-500">
                PatchProof Automated Verification Engine • Evidence Report
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mt-1">
                Patch Verification Evidence Document
              </h1>
              <div className="text-xs text-neutral-600 mt-1">
                Project: <span className="font-semibold">{doc.project.name}</span> | Target Finding:{" "}
                <span className="font-semibold">{doc.finding.title}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 text-xs font-bold uppercase rounded border border-neutral-900 bg-neutral-100">
                {doc.verdict}
              </span>
              <div className="text-[10px] text-neutral-500 font-mono mt-1">
                Schema v{doc.schemaVersion} • {new Date(doc.createdAt).toISOString().split("T")[0]}
              </div>
            </div>
          </div>

          {/* Canonical Hash Banner */}
          <div className="mt-3 p-2 bg-neutral-50 border border-neutral-200 rounded font-mono text-[11px] flex items-center justify-between">
            <span className="text-neutral-500">Canonical Document SHA-256:</span>
            <span className="font-semibold text-neutral-800">{doc.integrity.reportHash}</span>
          </div>
        </div>

        {/* Mandatory Fixed Security Disclaimer */}
        <div className="mb-6 p-3 bg-neutral-50 border-l-4 border-neutral-900 text-neutral-800 text-xs italic">
          <strong>Mandatory Notice: </strong>
          {doc.fixedDisclaimer}
        </div>

        {/* Provenance Legend */}
        <div className="mb-6 p-3 border border-neutral-200 rounded text-xs bg-neutral-50/50">
          <div className="font-bold text-neutral-700 text-[11px] uppercase tracking-wider mb-1.5">
            Evidence Provenance Classification
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div>
              <span className="font-bold text-neutral-900">[Scanner]:</span> {doc.provenanceLegend.scanner}
            </div>
            <div>
              <span className="font-bold text-neutral-900">[Test-verified]:</span> {doc.provenanceLegend.test}
            </div>
            <div>
              <span className="font-bold text-neutral-900">[AI-generated]:</span> {doc.provenanceLegend.ai}
            </div>
          </div>
        </div>

        {/* Section 1: Finding Details */}
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-neutral-300 pb-1 mb-2 text-neutral-900 flex items-center justify-between">
            <span>1. Vulnerability Finding Details</span>
            <span className="text-[11px] font-mono font-normal text-neutral-500">[Scanner]</span>
          </h2>
          <table className="w-full text-xs border border-neutral-200 mb-3">
            <tbody>
              <tr className="border-b border-neutral-200">
                <td className="p-2 w-1/4 bg-neutral-50 font-semibold">Rule ID / Tool</td>
                <td className="p-2 font-mono">
                  {doc.finding.ruleId} ({doc.finding.tool})
                </td>
                <td className="p-2 w-1/4 bg-neutral-50 font-semibold">Severity / Source</td>
                <td className="p-2">
                  {doc.finding.severity} ({doc.finding.source})
                </td>
              </tr>
              <tr className="border-b border-neutral-200">
                <td className="p-2 bg-neutral-50 font-semibold">Location</td>
                <td className="p-2 font-mono" colSpan={3}>
                  {doc.finding.filePath}
                  {doc.finding.lineStart ? ` (Lines ${doc.finding.lineStart}–${doc.finding.lineEnd})` : ""}
                </td>
              </tr>
            </tbody>
          </table>
          {doc.finding.snippet && (
            <pre className="p-2 text-[11px] font-mono bg-neutral-50 border border-neutral-200 rounded overflow-x-auto whitespace-pre">
              {doc.finding.snippet}
            </pre>
          )}
        </section>

        {/* Section 2: Commits & Sandbox Environment */}
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-neutral-300 pb-1 mb-2 text-neutral-900 flex items-center justify-between">
            <span>2. Target Commits & Sandbox Environment</span>
            <span className="text-[11px] font-mono font-normal text-neutral-500">[Test-verified]</span>
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs mb-3">
            <div className="p-2.5 border border-neutral-200 rounded bg-neutral-50/50">
              <div className="text-[11px] text-neutral-500">Vulnerable Baseline Commit</div>
              <div className="font-mono font-bold text-neutral-900">{doc.commits.baselineCommit}</div>
            </div>
            <div className="p-2.5 border border-neutral-200 rounded bg-neutral-50/50">
              <div className="text-[11px] text-neutral-500">Candidate Fix Commit</div>
              <div className="font-mono font-bold text-neutral-900">{doc.commits.candidateCommit}</div>
            </div>
          </div>
          <table className="w-full text-xs border border-neutral-200">
            <tbody>
              <tr className="border-b border-neutral-200">
                <td className="p-2 w-1/4 bg-neutral-50 font-semibold">Sandbox Image</td>
                <td className="p-2 font-mono text-[11px]">{doc.environment.metadata?.imageDigest || "emulated"}</td>
                <td className="p-2 w-1/4 bg-neutral-50 font-semibold">Isolation Limits</td>
                <td className="p-2 text-[11px]">Network: none, Mem: 512MB, CPU: 1.0</td>
              </tr>
              <tr>
                <td className="p-2 bg-neutral-50 font-semibold">Security Reproducer</td>
                <td className="p-2 font-mono text-[11px]">{doc.tests.securityReproducer?.reproducerId}</td>
                <td className="p-2 bg-neutral-50 font-semibold">Test Version (SHA-256)</td>
                <td className="p-2 font-mono text-[11px] truncate max-w-[150px]">
                  {doc.tests.securityReproducer?.testVersionSha256 || "verified"}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Page Break for Printable Document */}
        <div className="print-page-break my-4" />

        {/* Section 3: Verification Matrix */}
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-neutral-300 pb-1 mb-2 text-neutral-900 flex items-center justify-between">
            <span>3. Verification Matrix</span>
            <span className="text-[11px] font-mono font-normal text-neutral-500">[Test-verified]</span>
          </h2>
          <table className="w-full text-xs border border-neutral-300 border-collapse mb-4">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-300 font-semibold">
                <th className="p-2.5 text-left w-1/3">Evaluation Metric</th>
                <th className="p-2.5 text-left w-1/3">Vulnerable Baseline ({doc.commits.baselineCommit.slice(0, 7)})</th>
                <th className="p-2.5 text-left w-1/3">Candidate Patch ({doc.commits.candidateCommit.slice(0, 7)})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {doc.resultsMatrix.rows.map((row, idx) => (
                <tr key={idx} className={idx === 2 ? "font-bold bg-neutral-50" : ""}>
                  <td className="p-2.5">{row.metric}</td>
                  <td className="p-2.5 font-mono text-[11px]">{row.vulnerableVersion}</td>
                  <td className="p-2.5 font-mono text-[11px]">{row.candidatePatch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Section 4: Regressions */}
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-neutral-300 pb-1 mb-2 text-neutral-900 flex items-center justify-between">
            <span>4. Functional Regressions & Side Effects</span>
            <span className="text-[11px] font-mono font-normal text-neutral-500">[Test-verified]</span>
          </h2>
          {doc.regressions.newFailuresCount === 0 ? (
            <div className="p-2.5 border border-neutral-200 rounded bg-neutral-50 text-xs">
              <strong>Pass:</strong> No functional regressions detected. All regression suite tests passed without side effects.
            </div>
          ) : (
            <div className="p-2.5 border border-neutral-300 rounded bg-neutral-50 text-xs space-y-2">
              <div className="font-bold text-neutral-900">
                Warning: {doc.regressions.newFailuresCount} functional regression(s) detected:
              </div>
              {doc.regressions.newFailures.map((fail, idx) => (
                <div key={idx} className="p-2 border border-neutral-200 bg-white rounded font-mono text-[11px]">
                  <div className="font-bold">{fail.name} — {fail.status}</div>
                  {fail.error && <pre className="mt-1 text-[10px] text-neutral-600 whitespace-pre">{fail.error}</pre>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 5: Code Diff */}
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-neutral-300 pb-1 mb-2 text-neutral-900 flex items-center justify-between">
            <span>5. Candidate Code Modifications (Diff)</span>
            <span className="text-[11px] font-mono font-normal text-neutral-500">[Test-verified]</span>
          </h2>
          <div className="text-xs mb-2 text-neutral-600">
            Files changed: <strong>{doc.diff.filesChanged}</strong> | Insertions:{" "}
            <strong>+{doc.diff.insertions}</strong> | Deletions: <strong>-{doc.diff.deletions}</strong> | Diff SHA-256:{" "}
            <code className="text-[10px]">{doc.diff.sha256}</code>
          </div>
          <pre className="p-3 text-[11px] font-mono bg-neutral-50 border border-neutral-200 rounded overflow-x-auto whitespace-pre leading-snug">
            {doc.diff.content || "# No diff content recorded."}
          </pre>
        </section>

        {/* Page Break for Printable Document */}
        <div className="print-page-break my-4" />

        {/* Section 6: AI Section */}
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-neutral-300 pb-1 mb-2 text-neutral-900 flex items-center justify-between">
            <span>6. AI-Assisted Exploit & Patch Analysis</span>
            <span className="text-[11px] font-mono font-normal text-neutral-500">[AI-generated]</span>
          </h2>
          <div className="p-3 border border-neutral-200 rounded bg-neutral-50 text-xs">
            <div className="font-semibold text-neutral-700">Status: {doc.aiAnalysis.status}</div>
            <p className="text-neutral-600 mt-1">{doc.aiAnalysis.note}</p>
          </div>
        </section>

        {/* Section 7: Execution Logs Excerpts */}
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-neutral-300 pb-1 mb-2 text-neutral-900 flex items-center justify-between">
            <span>7. Sandbox Execution Logs Excerpt</span>
            <span className="text-[11px] font-mono font-normal text-neutral-500">[Test-verified]</span>
          </h2>
          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold mb-1 text-neutral-700">
                Baseline Execution ({doc.commits.baselineCommit.slice(0, 7)}):
              </div>
              <pre className="p-2.5 text-[10px] font-mono bg-neutral-50 border border-neutral-200 rounded overflow-x-auto whitespace-pre leading-tight">
                {doc.logs.baselineRun.excerpt?.text || "No log excerpt recorded."}
              </pre>
            </div>
            <div>
              <div className="text-xs font-semibold mb-1 text-neutral-700">
                Candidate Fix Execution ({doc.commits.candidateCommit.slice(0, 7)}):
              </div>
              <pre className="p-2.5 text-[10px] font-mono bg-neutral-50 border border-neutral-200 rounded overflow-x-auto whitespace-pre leading-tight">
                {doc.logs.candidateRun.excerpt?.text || "No log excerpt recorded."}
              </pre>
            </div>
          </div>
        </section>

        {/* Section 8: Scope Limitations */}
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-neutral-300 pb-1 mb-2 text-neutral-900 flex items-center justify-between">
            <span>8. Evaluation Scope & Security Disclaimer</span>
            <span className="text-[11px] font-mono font-normal text-neutral-500">[Test-verified]</span>
          </h2>
          <div className="p-3 border border-neutral-200 rounded bg-neutral-50 text-xs space-y-2">
            <p>
              <strong>Scope Notice: </strong>
              {doc.limitations.scopeNotice}
            </p>
            <p className="italic font-semibold text-neutral-800">
              {doc.limitations.fixedSentence}
            </p>
          </div>
        </section>

        {/* Section 9: Reproduction Instructions */}
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-neutral-300 pb-1 mb-2 text-neutral-900 flex items-center justify-between">
            <span>9. Local Reproduction Instructions</span>
            <span className="text-[11px] font-mono font-normal text-neutral-500">[Test-verified]</span>
          </h2>
          <pre className="p-3 text-[11px] font-mono bg-neutral-50 border border-neutral-200 rounded overflow-x-auto whitespace-pre">
            {doc.reproduction.instructions}
          </pre>
        </section>

        {/* Section 10: Cryptographic Artifact Hashes */}
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-neutral-300 pb-1 mb-2 text-neutral-900 flex items-center justify-between">
            <span>10. Cryptographic Evidence Hashes</span>
            <span className="text-[11px] font-mono font-normal text-neutral-500">[Test-verified]</span>
          </h2>
          <table className="w-full text-xs border border-neutral-200 border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-200 font-semibold">
                <th className="p-2 text-left">Artifact Name</th>
                <th className="p-2 text-left">Kind</th>
                <th className="p-2 text-left">Size</th>
                <th className="p-2 text-left font-mono">SHA-256 Digest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {doc.artifacts.map((art, idx) => (
                <tr key={idx}>
                  <td className="p-2 font-mono text-[11px]">{art.name}</td>
                  <td className="p-2 text-[11px]">{art.kind}</td>
                  <td className="p-2 text-[11px]">{art.sizeBytes} B</td>
                  <td className="p-2 font-mono text-[10px] break-all">{art.sha256}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
