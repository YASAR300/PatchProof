"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle2,
  ExternalLink,
  GitBranch,
  GitPullRequest,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export function GitHubIntegrationSection({ user }) {
  const [isLoading, setIsLoading] = useState(false);
  const isConnected = Boolean(user?.githubId);

  const handleConnect = () => {
    setIsLoading(true);
    signIn("github", { callbackUrl: "/app/settings" });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0b0b0c] flex items-center justify-center text-white shadow-xs">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </div>
          <div>
            <CardTitle>GitHub Integration</CardTitle>
            <p className="text-[11px] text-text-tertiary">
              Link your GitHub account to import repositories and open automated patch pull requests
            </p>
          </div>
        </div>

        {isConnected ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Connected
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-raised text-text-tertiary border border-border">
            Not Linked
          </span>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {isConnected ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-surface-raised/40 border border-border flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-medium text-text flex items-center gap-2">
                  <span>GitHub Account Linked</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-[11px] text-text-tertiary">
                  Authorized for repository inspection, commit scans, and verification checks.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleConnect}
                loading={isLoading}
              >
                Re-sync Account
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-surface-raised/20 border border-border/60 text-xs">
                <div className="text-text font-medium flex items-center gap-1.5 mb-0.5">
                  <GitBranch className="w-3.5 h-3.5 text-accent" />
                  <span>Auto Branch Sync</span>
                </div>
                <span className="text-[11px] text-text-tertiary">Fetches default branches</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-raised/20 border border-border/60 text-xs">
                <div className="text-text font-medium flex items-center gap-1.5 mb-0.5">
                  <GitPullRequest className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pull Requests</span>
                </div>
                <span className="text-[11px] text-text-tertiary">Opens verified fixes</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-raised/20 border border-border/60 text-xs">
                <div className="text-text font-medium flex items-center gap-1.5 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Token Security</span>
                </div>
                <span className="text-[11px] text-text-tertiary">Encrypted OAuth session</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-text-secondary leading-relaxed">
              Connect your personal or organization GitHub account. Once linked, you can import public and private repositories with 1 click, inspect branches, and permit PatchProof to push verified patch branches.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-raised/50 border border-border">
              <div className="flex items-center gap-2 text-xs font-medium text-text">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Connect with GitHub for seamless workflow</span>
              </div>

              <button
                type="button"
                onClick={handleConnect}
                disabled={isLoading}
                className="h-9 px-4 rounded-lg bg-[#0b0b0c] hover:bg-[#1f2937] active:bg-[#111827] text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2 border border-border/80"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                )}
                <span>Connect GitHub Account</span>
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
