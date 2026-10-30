import React from "react";
import { Bot, Sparkles, Send, ShieldAlert, Code2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "AI Assistant",
  description: "Test harness synthesis and vulnerability root cause explanations",
};

export default function AssistantPage() {
  return (
    <div className="space-y-4 font-sans w-full">
      <PageHeader
        title="AI assistant"
        description="Assisted test harness synthesis, suggested fix diffs, and vulnerability root-cause analysis with strict source provenance."
      />

      {/* Compact two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (4 cols): Context & Synthesis Targets */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analysis context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] text-text-tertiary">Active Project</span>
                <div className="font-medium text-text">flask</div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-text-tertiary">Engine Capability</span>
                <div className="text-text-secondary text-xs">
                  Static analysis & harness synthesis only. Code execution disabled.
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <span className="text-[11px] text-text-tertiary">Quick Actions</span>
                <div className="space-y-1.5 mt-1.5">
                  <button className="w-full text-left px-2.5 py-1.5 rounded-[6px] bg-surface-raised border border-border text-xs text-text hover:bg-surface-hover transition-colors">
                    Explain vulnerability root-cause
                  </button>
                  <button className="w-full text-left px-2.5 py-1.5 rounded-[6px] bg-surface-raised border border-border text-xs text-text hover:bg-surface-hover transition-colors">
                    Draft pytest reproducer template
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (8 cols): Interactive Session */}
        <div className="lg:col-span-8">
          <Card className="flex flex-col min-h-[420px]">
            <CardHeader>
              <CardTitle>Session</CardTitle>
              <span className="text-[11px] font-mono text-text-tertiary">Model: Claude 3.5 Sonnet</span>
            </CardHeader>
            <div className="flex-1 p-4 flex flex-col justify-between space-y-4">
              {/* Message history */}
              <div className="space-y-3">
                <div className="p-3 rounded-[6px] border border-border bg-surface-raised/40 text-xs text-text-secondary flex items-start gap-2.5">
                  <Bot className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-text text-xs">PatchProof Assistant</p>
                    <p className="leading-relaxed">
                      I can help analyze static analysis results, explain potential exploit paths, and construct pytest-based reproducer scripts for your repositories. Select a finding or type a question below.
                    </p>
                  </div>
                </div>
              </div>

              {/* Prompt Input */}
              <div className="pt-3 border-t border-border flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask a question or request a test harness..."
                  className="flex-1 h-8 rounded-[6px] border border-border bg-surface px-3 text-xs text-text placeholder:text-text-tertiary outline-none focus:border-accent hover:border-border-strong"
                />
                <Button variant="primary" size="sm">
                  <Send className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  Send
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
