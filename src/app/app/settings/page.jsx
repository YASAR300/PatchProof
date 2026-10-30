import React from "react";
import { Settings, Save, Shield, Sliders, Bell, Key, Server } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { WorkerSettingsSection } from "@/components/app/WorkerSettingsSection";

export const metadata = {
  title: "Settings",
  description: "Workspace configuration and execution boundaries",
};

export default function SettingsPage() {
  return (
    <div className="max-w-[1200px] mx-auto w-full space-y-5 font-sans">
      <PageHeader
        title="Settings"
        description="Configure workspace preferences, execution parameters, and security policies."
        actions={
          <Button variant="primary" size="sm">
            <Save className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            Save changes
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Sub-navigation */}
        <aside className="w-full md:w-48 flex-shrink-0 space-y-0.5 text-xs select-none">
          <button className="w-full h-8 px-2.5 rounded-[6px] flex items-center gap-2 bg-surface-selected text-text font-medium text-left">
            <Sliders className="w-3.5 h-3.5 text-text" />
            <span>General</span>
          </button>
          <a
            href="#worker-section"
            className="w-full h-8 px-2.5 rounded-[6px] flex items-center gap-2 text-text-secondary hover:text-text hover:bg-surface-hover transition-colors text-left"
          >
            <Server className="w-3.5 h-3.5 text-text-tertiary" />
            <span>Worker & Runner</span>
          </a>
          <button className="w-full h-8 px-2.5 rounded-[6px] flex items-center gap-2 text-text-secondary hover:text-text hover:bg-surface-hover transition-colors text-left">
            <Shield className="w-3.5 h-3.5 text-text-tertiary" />
            <span>Execution limits</span>
          </button>
          <button className="w-full h-8 px-2.5 rounded-[6px] flex items-center gap-2 text-text-secondary hover:text-text hover:bg-surface-hover transition-colors text-left">
            <Key className="w-3.5 h-3.5 text-text-tertiary" />
            <span>API & tokens</span>
          </button>
          <button className="w-full h-8 px-2.5 rounded-[6px] flex items-center gap-2 text-text-secondary hover:text-text hover:bg-surface-hover transition-colors text-left">
            <Bell className="w-3.5 h-3.5 text-text-tertiary" />
            <span>Notifications</span>
          </button>
        </aside>

        {/* Sections in Panels */}
        <div className="flex-1 w-full space-y-4">
          {/* Worker Service & Sandbox Runner Section */}
          <div id="worker-section">
            <WorkerSettingsSection />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Workspace details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-md">
                <Input
                  label="Workspace Name"
                  defaultValue="Security Team"
                  helperText="Display name visible across verification reports"
                />
              </div>
              <div className="max-w-md">
                <Input
                  label="Default Target Branch"
                  defaultValue="main"
                  helperText="Fallback branch monitored when no PR branch is specified"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Execution boundaries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <div>
                  <div className="font-medium text-text">Default Execution Mode</div>
                  <div className="text-[11px] text-text-tertiary">
                    Repositories added via GitHub URL default to static analysis only
                  </div>
                </div>
                <span className="text-[11px] font-mono text-text-secondary px-2 py-0.5 rounded-[4px] bg-surface-raised border border-border">
                  Static Analysis
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="font-medium text-text">Timeout Limits</div>
                  <div className="text-[11px] text-text-tertiary">
                    Maximum duration per verification test harness execution
                  </div>
                </div>
                <span className="text-[11px] font-mono text-text-secondary px-2 py-0.5 rounded-[4px] bg-surface-raised border border-border">
                  120s
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
