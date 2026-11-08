"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log the error to console for diagnostics
    console.error("[PatchProof ErrorBoundary] Caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-full max-w-md bg-panel border border-border rounded-xl p-8 shadow-2xl flex flex-col items-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-status-danger-bg/20 border border-status-danger-border flex items-center justify-center text-status-danger">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-text">
            Something went wrong
          </h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            An unexpected error occurred while rendering this page. Our security harnesses and data remain safe.
          </p>
        </div>

        {error?.message && (
          <div className="w-full text-left p-3 rounded bg-bg border border-border/80 text-[11px] font-mono text-text-muted overflow-x-auto max-h-32">
            {error.message}
          </div>
        )}

        <div className="flex items-center gap-3 w-full pt-2">
          <Button
            variant="secondary"
            className="flex-1 text-xs"
            onClick={() => reset()}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Try again
          </Button>
          <Link href="/app" className="flex-1">
            <Button variant="primary" className="w-full text-xs">
              <Home className="w-3.5 h-3.5 mr-1.5" />
              Return to app
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
