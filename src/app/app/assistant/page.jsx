import React from "react";
import { Bot, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "AI Assistant",
  description: "Test harness synthesis and vulnerability root cause explanations",
};

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Security Assistant"
        description="Assisted test harness synthesis, suggested fix diffs, and vulnerability root-cause analysis with strict source provenance."
      />

      <EmptyState
        icon={Bot}
        title="AI Assistant ready"
        description="Select any finding or reproducer run to synthesize reproduction test scripts and explain root cause taint paths."
        action={
          <Button variant="secondary" size="sm" icon={Sparkles}>
            Start Assistant Session
          </Button>
        }
      />
    </div>
  );
}
