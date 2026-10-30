"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Play, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Onboarding card CTA — "Connect a repository" button with icon. */
export function ConnectRepositoryButton({ size = "md", className }) {
  return (
    <Link href="/app/repositories/new">
      <Button variant="primary" size={size} className={className}>
        <Plus className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
        Connect a repository
      </Button>
    </Link>
  );
}

/** Onboarding card CTA — "Add the demo project" button. */
export function AddDemoProjectButton({ size = "md", className }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/repositories/demo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add demo project");
      router.push(`/app/repositories/${data.project.id}`);
      router.refresh();
    } catch (err) {
      alert(err.message || "Failed to add demo project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size={size}
      className={className}
      onClick={handleAdd}
      disabled={loading}
    >
      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      {loading ? "Adding demo..." : "Add the demo project"}
    </Button>
  );
}

/** Page-header action bar for the Overview page when a project is active. */
export function OverviewHeaderActions({ repositoryId, hasScans = false }) {
  return (
    <div className="flex items-center gap-2">
      <Link href={`/app/repositories/${repositoryId}`}>
        <Button variant="secondary" size="sm">
          Repository details
        </Button>
      </Link>
      <Link href={`/app/repositories/${repositoryId}`}>
        <Button variant="primary" size="sm">
          <Play className="w-3.5 h-3.5 flex-shrink-0 fill-current" aria-hidden="true" />
          Run scan
        </Button>
      </Link>
    </div>
  );
}
