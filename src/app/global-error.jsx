"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("[PatchProof GlobalError] Root error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans flex items-center justify-center p-6 m-0">
        <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-xl p-8 shadow-2xl flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-800/60 flex items-center justify-center text-red-400">
            <AlertOctagon className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Application Error
            </h1>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              A critical error occurred. Please refresh or retry the operation.
            </p>
          </div>

          {error?.message && (
            <div className="w-full text-left p-3 rounded bg-[#0d1117] border border-[#30363d] text-[11px] font-mono text-[#8b949e] overflow-x-auto max-h-32">
              {error.message}
            </div>
          )}

          <div className="w-full pt-2">
            <button
              onClick={() => reset()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white transition-colors cursor-pointer border border-[#2ea043]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
