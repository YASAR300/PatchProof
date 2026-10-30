"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderGit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCode,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";

const LANGUAGE_OPTIONS = [
  { label: "JavaScript/TypeScript", value: "JavaScript/TypeScript" },
  { label: "Python", value: "Python" },
];

export function ConnectRepositoryForm({ onSuccess, onCancel }) {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [validatedData, setValidatedData] = useState(null);

  // Form fields
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("JavaScript/TypeScript");
  const [defaultBranch, setDefaultBranch] = useState("main");

  // Client-side quick syntax pre-check
  const validateUrlClient = (val) => {
    const trimmed = (val || "").trim();
    if (!trimmed) return "Repository URL is required.";

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "https:") {
        return "Repository URL must use https:// protocol.";
      }
      if (parsed.username || parsed.password) {
        return "URLs with embedded credentials are not allowed.";
      }
      if (parsed.hostname.toLowerCase() !== "github.com") {
        return `Only GitHub repositories are supported (github.com). "${parsed.hostname}" is not allowed.`;
      }
      const parts = parsed.pathname.replace(/\.git$/, "").split("/").filter(Boolean);
      if (parts.length !== 2) {
        return "Repository URL must be of the form https://github.com/owner/repo";
      }
    } catch {
      return "Invalid URL format. Provide https://github.com/owner/repo";
    }
    return null;
  };

  const handleInspect = async (e) => {
    if (e) e.preventDefault();
    setValidationError("");
    setValidatedData(null);

    const clientErr = validateUrlClient(url);
    if (clientErr) {
      setValidationError(clientErr);
      return;
    }

    setIsValidating(true);
    try {
      const res = await fetch("/api/repositories/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to validate repository on GitHub.");
      }

      setValidatedData(data);
      setName(data.name || data.repo);
      setLanguage(data.suggestedLanguage || "JavaScript/TypeScript");
      setDefaultBranch(data.defaultBranch || "main");
    } catch (err) {
      setValidationError(err.message || "Failed to validate repository.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    // If user hasn't inspected yet, or changed the URL, inspect first
    if (!validatedData || validatedData.url !== url.trim()) {
      const clientErr = validateUrlClient(url);
      if (clientErr) {
        setValidationError(clientErr);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/repositories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          name: name.trim() || validatedData?.name,
          language,
          defaultBranch: defaultBranch.trim() || validatedData?.defaultBranch || "main",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to connect repository.");
      }

      if (onSuccess) {
        onSuccess(data.project);
      } else {
        router.push(`/app/repositories/${data.project.id}`);
        router.refresh();
      }
    } catch (err) {
      setValidationError(err.message || "Failed to create project repository.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={validatedData ? handleSubmit : handleInspect} className="space-y-5">
      {/* GitHub Repository URL Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-medium text-text">
            GitHub Repository URL <span className="text-text-muted" aria-hidden="true">*</span>
          </label>
          <span className="text-2xs text-text-muted">https://github.com/owner/repo</span>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setValidationError("");
              }}
              placeholder="https://github.com/facebook/react"
              prefixIcon={FolderGit2}
              autoFocus
              disabled={isValidating || isSubmitting}
            />
          </div>
          {!validatedData && (
            <Button
              type="button"
              onClick={handleInspect}
              disabled={!url || isValidating || isSubmitting}
              loading={isValidating}
              variant="secondary"
            >
              Inspect
            </Button>
          )}
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3 rounded-lg border border-border bg-surface-raised text-text text-xs flex items-start gap-2.5 animate-in fade-in duration-150" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-text-muted" aria-hidden="true" />
          <div className="space-y-0.5">
            <div className="font-medium text-text">Validation Error</div>
            <div className="text-2xs text-text-muted leading-relaxed">{validationError}</div>
          </div>
        </div>
      )}

      {/* Inspected Repository Details */}
      {validatedData && (
        <div className="space-y-4 pt-2 border-t border-border animate-in fade-in duration-200">
          <div className="p-3 rounded-lg bg-surface-raised/40 border border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
              <div>
                <div className="text-xs font-semibold text-text">{validatedData.fullName}</div>
                <div className="text-2xs text-text-muted">
                  Default branch: <span className="font-mono">{validatedData.defaultBranch}</span> · Latest commit:{" "}
                  <span className="font-mono">{validatedData.latestCommitShortSha}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setValidatedData(null);
                setValidationError("");
              }}
              className="text-2xs text-text-muted hover:text-text underline"
            >
              Change URL
            </button>
          </div>

          {/* Project Name & Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Project Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Repository display name"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <Select
                label="Primary Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                options={LANGUAGE_OPTIONS}
                helperText="Auto-suggested from GitHub repository"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Default Branch */}
          <div>
            <Input
              label="Default Branch"
              value={defaultBranch}
              onChange={(e) => setDefaultBranch(e.target.value)}
              placeholder="main"
              disabled={isSubmitting}
              helperText="Target branch for vulnerability verification harnesses"
              required
            />
          </div>

          {/* Detected Manifests */}
          <div className="p-3 rounded-lg border border-border bg-surface text-2xs space-y-2">
            <div className="font-medium text-text flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-accent" />
              <span>Detected Package Manifests (root or 1 level down):</span>
            </div>
            {validatedData.detectedManifests && validatedData.detectedManifests.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {validatedData.detectedManifests.map((m) => (
                  <Badge key={m} variant="accent" size="sm" className="font-mono">
                    {m}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-text-muted italic">
                No matching manifests found (requirements.txt, package-lock.json, pnpm-lock.yaml, package.json, pyproject.toml).
              </div>
            )}
          </div>

          {/* Static analysis execution notice - STRICT EXACT STRING */}
          <div className="p-3 rounded-lg border border-border bg-surface text-text-muted text-2xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-text-muted mt-0.5" aria-hidden="true" />
            <span>Static analysis only. Test execution is disabled for this repository.</span>
          </div>
        </div>
      )}

      {/* Action Buttons: primary button at the bottom-left */}
      <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-border">
        {validatedData ? (
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
          >
            Create project & connect
            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 ml-1.5" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            type="submit"
            variant="primary"
            loading={isValidating}
            disabled={!url}
          >
            Inspect & continue
          </Button>
        )}

        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isValidating || isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

