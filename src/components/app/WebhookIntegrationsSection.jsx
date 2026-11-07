"use client";

import React, { useState } from "react";
import {
  Webhook,
  Key,
  Copy,
  Check,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  ExternalLink,
  GitPullRequest,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function WebhookIntegrationsSection({
  project,
  initialHasSecret = false,
  initialExecutionEnabled = false,
  initialIsAllowListed = false,
  initialAllowedRepos = [],
  initialDeliveries = [],
}) {
  const [hasSecret, setHasSecret] = useState(initialHasSecret);
  const [executionEnabled, setExecutionEnabled] = useState(initialExecutionEnabled);
  const [isAllowListed, setIsAllowListed] = useState(initialIsAllowListed);
  const [allowedRepos, setAllowedRepos] = useState(initialAllowedRepos);
  const [deliveries, setDeliveries] = useState(initialDeliveries);

  const [activeSecret, setActiveSecret] = useState(null); // revealed only once when generated
  const [isRotating, setIsRotating] = useState(false);
  const [isTogglingExecution, setIsTogglingExecution] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://patchproof-three.vercel.app";
  const webhookUrl = `${appUrl}/api/webhooks/github`;
  const repoSlug = `${project?.repoOwner || "owner"}/${project?.repoName || "repo"}`;

  const handleCopy = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleRotateSecret = async () => {
    if (!project?.id) return;
    setIsRotating(true);
    setError(null);
    try {
      const res = await fetch(`/api/repositories/${project.id}/webhook-secret`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate webhook secret.");
      }
      setActiveSecret(data.secret);
      setHasSecret(true);
    } catch (err) {
      setError(err.message || "Failed to rotate webhook secret");
    } finally {
      setIsRotating(false);
    }
  };

  const handleToggleExecution = async () => {
    if (!project?.id) return;
    setIsTogglingExecution(true);
    setError(null);
    try {
      const res = await fetch(`/api/repositories/${project.id}/integrations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ executionEnabled: !executionEnabled }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update execution setting.");
      }
      setExecutionEnabled(Boolean(data.project?.executionEnabled));
    } catch (err) {
      setError(err.message || "Failed to toggle execution setting");
    } finally {
      setIsTogglingExecution(false);
    }
  };

  const handleRefreshDeliveries = async () => {
    if (!project?.id) return;
    setRefreshing(true);
    try {
      const res = await fetch(`/api/repositories/${project.id}/integrations`);
      const data = await res.json();
      if (res.ok && data.ok) {
        setDeliveries(data.deliveries || []);
        setHasSecret(data.hasSecret);
        setExecutionEnabled(data.executionEnabled);
        setIsAllowListed(data.isAllowListed);
        setAllowedRepos(data.allowedRepos || []);
      }
    } catch {
      // non-fatal
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="py-4 px-5 border-b border-border/60 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-xs">
            <Webhook className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium">GitHub Webhook & PR Verification</CardTitle>
            <CardDescription className="text-xs">
              Automated pull-request verification, HMAC signature validation, and regression alerting.
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasSecret ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Secret Configured
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
              No Secret Set
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6 text-xs font-sans">
        {error && (
          <div className="p-3 rounded-[6px] border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* 1. Webhook Endpoint URL */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary block font-mono">
            1. Payload Webhook URL
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-9 px-3 rounded-[6px] bg-[#080809] border border-border flex items-center font-mono text-text text-xs overflow-x-auto">
              <span>{webhookUrl}</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCopy(webhookUrl, setCopiedUrl)}
              className="gap-1.5"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy URL</span>
                </>
              )}
            </Button>
          </div>
          <p className="text-[11px] text-text-tertiary">
            Add this URL to your GitHub repository settings under <strong>Webhooks &gt; Add webhook</strong>.
          </p>
        </div>

        {/* 2. Setup Guide Card */}
        <div className="p-4 rounded-[6px] border border-border bg-surface-raised/30 space-y-2.5">
          <div className="flex items-center gap-2 text-text font-semibold text-xs">
            <Info className="w-4 h-4 text-accent" />
            <span>GitHub Webhook Setup Configuration</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-text-secondary">
            <div className="p-2.5 rounded bg-surface border border-border/60 space-y-1">
              <span className="text-text-tertiary block font-mono">Content type:</span>
              <span className="font-mono text-text font-semibold">application/json</span>
            </div>
            <div className="p-2.5 rounded bg-surface border border-border/60 space-y-1">
              <span className="text-text-tertiary block font-mono">Secret:</span>
              <span className="font-mono text-text font-semibold">
                {hasSecret ? "Configured (AES-256-GCM)" : "Generate below"}
              </span>
            </div>
            <div className="p-2.5 rounded bg-surface border border-border/60 space-y-1">
              <span className="text-text-tertiary block font-mono">SSL verification:</span>
              <span className="font-mono text-text font-semibold">Enable SSL verification</span>
            </div>
            <div className="p-2.5 rounded bg-surface border border-border/60 space-y-1">
              <span className="text-text-tertiary block font-mono">Trigger events:</span>
              <span className="font-mono text-text font-semibold">Pull requests (opened, synchronize, reopened)</span>
            </div>
          </div>
        </div>

        {/* 3. Per-Project Secret Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary block font-mono">
              2. Per-Project Webhook Secret (AES-256-GCM)
            </label>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRotateSecret}
              disabled={isRotating}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? "animate-spin" : ""}`} />
              <span>{hasSecret ? "Rotate secret" : "Generate secret"}</span>
            </Button>
          </div>

          {activeSecret ? (
            <div className="p-3.5 rounded-[6px] border border-amber-500/40 bg-amber-500/10 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Save this secret now — it is only displayed once!</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-9 px-3 rounded-[6px] bg-[#080809] border border-border font-mono text-emerald-400 text-xs flex items-center overflow-x-auto select-all">
                  <span>{activeSecret}</span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleCopy(activeSecret, setCopiedSecret)}
                  className="gap-1.5"
                >
                  {copiedSecret ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-white" />
                      <span>Copy Secret</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-amber-300/80">
                Paste this secret into the <strong>Secret</strong> field of your GitHub repository Webhook settings.
              </p>
            </div>
          ) : hasSecret ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-9 px-3 rounded-[6px] bg-[#080809] border border-border font-mono text-text-tertiary text-xs flex items-center">
                <span>••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••</span>
              </div>
              <span className="text-[11px] text-text-tertiary font-mono px-2 py-1 bg-surface-raised border border-border rounded">
                Encrypted at rest
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-[6px] bg-surface border border-border text-text-secondary text-xs">
              No webhook secret configured yet. Click <strong>Generate secret</strong> above to create a cryptographically secure 32-byte secret.
            </div>
          )}
        </div>

        {/* 4. Execution Safety & Allow-list Status */}
        <div className="space-y-3 pt-2 border-t border-border">
          <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary block font-mono">
            3. Execution Safety & Allow-list Policy
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Barrier 1: executionEnabled */}
            <div className="p-3.5 rounded-[6px] border border-border bg-surface space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text text-xs">Project Execution Toggle</span>
                {executionEnabled ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    ENABLED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-surface-raised text-text-tertiary border border-border">
                    <ShieldAlert className="w-3 h-3" />
                    DISABLED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-text-tertiary">
                Permits sandbox container execution for test targets and pull-request verification runs.
              </p>
              <Button
                variant={executionEnabled ? "secondary" : "primary"}
                size="sm"
                onClick={handleToggleExecution}
                disabled={isTogglingExecution}
                className="w-full text-xs"
              >
                {executionEnabled ? "Disable Execution" : "Enable Execution"}
              </Button>
            </div>

            {/* Barrier 2: EXECUTION_ALLOWED_REPOS allow-list */}
            <div className="p-3.5 rounded-[6px] border border-border bg-surface space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text text-xs">Environment Allow-list</span>
                {isAllowListed ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    ALLOW-LISTED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="w-3 h-3" />
                    NOT ALLOW-LISTED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-text-tertiary">
                Repository <code className="font-mono text-text">{repoSlug}</code> must be in <code className="font-mono text-text">EXECUTION_ALLOWED_REPOS</code>.
              </p>
              <div className="text-[10px] font-mono p-2 bg-[#080809] border border-border rounded text-text-secondary truncate">
                Configured: {allowedRepos.length > 0 ? allowedRepos.join(", ") : "(empty allow-list)"}
              </div>
            </div>
          </div>

          {/* Guide to push demo repository to own GitHub repo */}
          <div className="p-3.5 rounded-[6px] bg-[#080809] border border-border space-y-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-text font-semibold font-sans">
              <Terminal className="w-3.5 h-3.5 text-accent" />
              <span>How to test live GitHub PR checks with your own repository:</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed font-sans">
              To test automated live PR checks with your personal GitHub account:
            </p>
            <pre className="p-2.5 bg-surface border border-border/40 rounded text-[11px] text-text-secondary leading-relaxed overflow-x-auto whitespace-pre">
{`# 1. Push demo target repository to your GitHub account:
cd .data/demo-target
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main --tags

# 2. Add your repository to the allow-list in .env:
EXECUTION_ALLOWED_REPOS="${repoSlug},<your-username>/<your-repo>"

# 3. Add webhook URL & secret in GitHub Settings > Webhooks`}
            </pre>
          </div>
        </div>

        {/* 5. Last 20 Webhook Deliveries Table */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary block font-mono">
                4. Recent Deliveries (Last 20)
              </label>
              <p className="text-[11px] text-text-tertiary">
                Audit log of ingested GitHub webhook payloads and idempotent execution outcomes.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefreshDeliveries}
              disabled={refreshing}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {deliveries.length > 0 ? (
            <div className="border border-border rounded-[6px] overflow-hidden">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-surface-raised/40 border-b border-border/60 text-[11px] font-mono text-text-tertiary">
                  <tr>
                    <th className="py-2 px-3">Delivery ID</th>
                    <th className="py-2 px-3">Event</th>
                    <th className="py-2 px-3">Action</th>
                    <th className="py-2 px-3">Outcome</th>
                    <th className="py-2 px-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono text-[11px]">
                  {deliveries.map((del) => {
                    const isSuccess = del.outcome.startsWith("enqueued");
                    const isSkipped = del.outcome.startsWith("skipped");
                    const isRejected = del.outcome.startsWith("rejected");

                    return (
                      <tr key={del.id} className="hover:bg-surface-hover/50">
                        <td className="py-2 px-3 font-semibold text-text">
                          {del.id.length > 18 ? `${del.id.slice(0, 8)}...${del.id.slice(-6)}` : del.id}
                        </td>
                        <td className="py-2 px-3 text-text-secondary">{del.event}</td>
                        <td className="py-2 px-3 text-text-tertiary">{del.action || "—"}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] ${
                              isSuccess
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : isSkipped
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : isRejected
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-surface-raised text-text-secondary border border-border"
                            }`}
                          >
                            {del.outcome}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-text-tertiary">
                          {new Date(del.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center rounded-[6px] border border-border bg-surface-raised/20 text-text-tertiary text-xs">
              No webhook deliveries recorded yet. Configure the webhook in GitHub and open a pull request to test.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

