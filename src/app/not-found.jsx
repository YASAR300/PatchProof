import React from "react";
import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center font-sans text-text">
      <div className="w-full max-w-md bg-panel border border-border rounded-xl p-8 shadow-2xl flex flex-col items-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-panel-hover border border-border flex items-center justify-center text-text-secondary">
          <FileQuestion className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <div className="text-xs font-mono font-semibold tracking-wider text-accent uppercase">
            404 Error
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Page Not Found
          </h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            The requested resource does not exist, has been removed, or you do not have permission to view it.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-2">
          <Link
            href="/app"
            className="w-full flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-accent text-accent-text hover:bg-accent-hover transition-colors shadow-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/"
            className="w-full flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-panel-hover border border-border text-text hover:bg-border/60 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
