"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Play,
  Cpu,
  Server,
  RefreshCw,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const DEFAULT_CHECKS = [
  {
    id: "sanity",
    name: "Python execution sanity",
    description: "Evaluates standard Python process execution inside container",
  },
  {
    id: "network",
    name: "Network isolation (airgap)",
    description: "Verifies outbound sockets are neutralized (--network none)",
  },
  {
    id: "timeout",
    name: "Execution timeout enforcement",
    description: "Verifies runaway loops are killed after allotted timeout",
  },
  {
    id: "memory",
    name: "Memory quota containment",
    description: "Verifies memory cgroup quota constraints (64MB cap)",
  },
  {
    id: "filesystem",
    name: "Host filesystem isolation",
    description: "Verifies no host directories or docker.sock are mounted",
  },
];

export function WorkerSettingsSection() {
  const [workerState, setWorkerState] = useState({
    isOnline: false,
    dockerVersion: null,
    runtime: null,
    lastSeenAt: null,
    hostname: null,
    workerId: null,
  });
  const [queueDepth, setQueueDepth] = useState(0);
  const [activeJobId, setActiveJobId] = useState(null);
  const [currentJob, setCurrentJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [lastChecklist, setLastChecklist] = useState(null);

  const pollIntervalRef = useRef(null);

  // Fetch worker and job summary
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs?limit=5");
      if (!res.ok) return;
      const data = await res.json();
      if (data.ok) {
        setWorkerState(data.worker || {});
        setQueueDepth(data.queueDepth ?? 0);

        // Find most recent selftest job
        const latestSelftest = (data.jobs || []).find((j) => j.type === "selftest");
        if (latestSelftest) {
          if (!activeJobId && (latestSelftest.status === "QUEUED" || latestSelftest.status === "RUNNING")) {
            setActiveJobId(latestSelftest.id);
            setCurrentJob(latestSelftest);
          } else if (!activeJobId && latestSelftest.result) {
            setLastChecklist(latestSelftest.result);
            if (!currentJob) setCurrentJob(latestSelftest);
          }
        }
      }
    } catch {
      // transient network error
    }
  }, [activeJobId, currentJob]);

  // Fetch active job details
  const fetchActiveJob = useCallback(async (jobId) => {
    if (!jobId) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.ok && data.job) {
        setCurrentJob(data.job);
        if (data.job.result) {
          setLastChecklist(data.job.result);
        }
        if (
          data.job.status === "SUCCEEDED" ||
          data.job.status === "COMPLETED" ||
          data.job.status === "FAILED" ||
          data.job.status === "CANCELED"
        ) {
          setActiveJobId(null);
        }
      }
    } catch {
      // transient error
    }
  }, []);

  // Polling loop
  useEffect(() => {
    fetchStatus();

    const intervalMs = activeJobId ? 1500 : 6000;
    pollIntervalRef.current = setInterval(() => {
      if (activeJobId) {
        fetchActiveJob(activeJobId);
      }
      fetchStatus();
    }, intervalMs);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeJobId, fetchStatus, fetchActiveJob]);

  // Trigger self-test
  const handleRunSelfTest = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "selftest" }),
      });
      const data = await res.json();
      if (data.ok && data.job) {
        setActiveJobId(data.job.id);
        setCurrentJob(data.job);
        setLastChecklist(null);
        setShowLogs(true);
      }
    } catch (err) {
      console.error("Failed to queue self-test job:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isJobActive = currentJob && (currentJob.status === "QUEUED" || currentJob.status === "RUNNING");

  // Relative time helper
  const formatLastSeen = (isoDate) => {
    if (!isoDate) return "Never";
    const diffSec = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
    if (diffSec < 5) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    return `${diffMin}m ago`;
  };

  return (
    <Card className="border border-border/80 bg-surface">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 py-3 px-4">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-accent" />
          <CardTitle className="text-sm font-medium text-text">Worker & Sandbox Runner</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-medium border ${
              workerState.isOnline
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-surface-raised text-text-tertiary border-border"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                workerState.isOnline ? "bg-emerald-400 animate-pulse" : "bg-text-tertiary"
              }`}
            />
            {workerState.isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 text-xs">
        {/* Worker Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1">
          <div className="p-2.5 rounded-[6px] bg-surface-raised border border-border/60 space-y-1">
            <div className="text-[11px] text-text-tertiary">Heartbeat</div>
            <div className="font-mono text-xs text-text font-medium">
              {formatLastSeen(workerState.lastSeenAt)}
            </div>
          </div>
          <div className="p-2.5 rounded-[6px] bg-surface-raised border border-border/60 space-y-1">
            <div className="text-[11px] text-text-tertiary">Docker Version</div>
            <div className="font-mono text-xs text-text font-medium truncate" title={workerState.dockerVersion || "Unavailable"}>
              {workerState.dockerVersion || "Unavailable"}
            </div>
          </div>
          <div className="p-2.5 rounded-[6px] bg-surface-raised border border-border/60 space-y-1">
            <div className="text-[11px] text-text-tertiary">Sandbox Runtime</div>
            <div className="font-mono text-xs text-text font-medium">
              {workerState.runtime || "runc"}
            </div>
          </div>
          <div className="p-2.5 rounded-[6px] bg-surface-raised border border-border/60 space-y-1">
            <div className="text-[11px] text-text-tertiary">Queue Depth</div>
            <div className="font-mono text-xs text-text font-medium">
              {queueDepth} {queueDepth === 1 ? "job" : "jobs"}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div>
            <div className="text-xs font-medium text-text">Sandbox Confinement Validation</div>
            <div className="text-[11px] text-text-tertiary">
              Runs four isolation verification checks inside an airgapped container
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchStatus}
              disabled={isJobActive || isSubmitting}
              title="Refresh status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRunSelfTest}
              disabled={isJobActive || isSubmitting}
            >
              {isJobActive ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Running self-test...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  Run sandbox self-test
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Active Job State Indicator */}
        {isJobActive && (
          <div className="flex items-center justify-between p-2.5 rounded-[6px] bg-surface-raised border border-border text-[11px]">
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
              <span className="text-text font-medium">
                Job #{currentJob.id.slice(-8)} is {currentJob.status}...
              </span>
              <span className="text-text-tertiary font-mono">
                (Attempt {currentJob.attempts}/{currentJob.maxAttempts})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowLogs(!showLogs)}
              className="text-accent hover:underline flex items-center gap-1 font-mono"
            >
              <Terminal className="w-3 h-3" />
              {showLogs ? "Hide logs" : "View logs"}
            </button>
          </div>
        )}

        {/* Live Results Checklist */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Verification Checklist
          </div>
          <div className="divide-y divide-border/60 border border-border rounded-[6px] overflow-hidden bg-surface-raised">
            {DEFAULT_CHECKS.map((check) => {
              const resultCheck = lastChecklist?.checks?.find((c) => c.id === check.id);
              const isPassed = resultCheck?.passed === true;
              const isFailed = resultCheck && resultCheck.passed === false;
              const isPending = isJobActive && !resultCheck;

              return (
                <div key={check.id} className="p-3 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="mt-0.5 flex-shrink-0">
                      {isPending ? (
                        <Loader2 className="w-4 h-4 text-accent animate-spin" />
                      ) : isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isFailed ? (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-border-strong bg-surface" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-text flex items-center gap-2">
                        <span>{check.name}</span>
                        {resultCheck?.durationMs !== undefined && (
                          <span className="text-[10px] font-mono text-text-tertiary">
                            {resultCheck.durationMs}ms
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-text-tertiary mt-0.5">
                        {resultCheck?.details || check.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isPassed && (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        PASS
                      </span>
                    )}
                    {isFailed && (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-[4px] bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        FAIL
                      </span>
                    )}
                    {!resultCheck && !isPending && (
                      <span className="text-[10px] font-mono text-text-tertiary px-2 py-0.5 rounded-[4px] bg-surface border border-border">
                        READY
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Logs Console */}
        {currentJob?.logs && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-text-tertiary" />
                Execution Log
              </span>
              <button
                type="button"
                onClick={() => setShowLogs(!showLogs)}
                className="text-text-tertiary hover:text-text font-mono text-[10px]"
              >
                {showLogs ? "Collapse" : "Expand"}
              </button>
            </div>
            {showLogs && (
              <pre className="p-3 rounded-[6px] bg-[#080809] border border-border/80 font-mono text-[11px] text-text-secondary overflow-x-auto max-h-48 overflow-y-auto leading-relaxed select-text">
                {currentJob.logs}
              </pre>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

