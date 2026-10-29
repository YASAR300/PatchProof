"use client";

import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  ShieldCheck,
  Search,
  Terminal,
  Send,
  AlertCircle,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  Button,
  Badge,
  StatusBadge,
  SeverityBadge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Tooltip,
  Kbd,
  Skeleton,
  EmptyState,
  Dialog,
  DialogFooter,
  useToast,
} from "@/components/ui";
import { VERIFICATION_STATUS, SEVERITY_LEVELS } from "@/lib/constants";

export default function DevUiClient() {
  const [theme, setTheme] = useState("dark");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(current);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <div className="min-h-screen bg-background text-text p-6 md:p-10 font-sans transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight">PatchProof</span>
              <Badge variant="accent" size="sm">
                UI Kitchen Sink
              </Badge>
              <Badge variant="outline" size="sm">
                Dev Only
              </Badge>
            </div>
            <p className="text-xs text-text-muted">
              Live interactive verification of all design tokens, primitives, status badges, and themes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleTheme}
              icon={theme === "dark" ? Sun : Moon}
              id="theme-toggle-btn"
            >
              Switch to {theme === "dark" ? "Light (Apple)" : "Dark (Linear)"}
            </Button>
          </div>
        </header>

        {/* Section 1: Verification Status Badges */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-tight">1. Verification Status Badges</h2>
            <p className="text-xs text-text-muted">
              Exact semantic color mapping defined once and applied globally across verification runs.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-surface">
            {Object.keys(VERIFICATION_STATUS).map((statusKey) => (
              <div
                key={statusKey}
                className="flex flex-col gap-1.5 p-2 rounded-lg bg-surface-raised/40 border border-border/40"
              >
                <div className="flex items-center justify-between">
                  <StatusBadge status={statusKey} size="md" />
                  <span className="text-2xs font-mono text-text-muted">
                    {VERIFICATION_STATUS[statusKey].color}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-2xs text-text-muted">Small size:</span>
                  <StatusBadge status={statusKey} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Severity Badges */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-tight">2. Severity Badges</h2>
            <p className="text-xs text-text-muted">
              Distinct color indicators for CRITICAL, HIGH, MEDIUM, LOW, and INFO security findings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-border bg-surface">
            {Object.keys(SEVERITY_LEVELS).map((sev) => (
              <div key={sev} className="flex items-center gap-2">
                <SeverityBadge severity={sev} size="md" />
                <SeverityBadge severity={sev} size="sm" />
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Buttons */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold tracking-tight">3. Buttons & Actions</h2>
              <p className="text-xs text-text-muted">
                Variants (primary, secondary, ghost, danger), sizes (sm, md, lg), and loading state.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={RotateCcw}
              onClick={() => setButtonLoading(!buttonLoading)}
            >
              Toggle Loading ({buttonLoading ? "ON" : "OFF"})
            </Button>
          </div>

          <div className="space-y-4 p-5 rounded-xl border border-border bg-surface">
            {/* By Variant */}
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" loading={buttonLoading} icon={Sparkles}>
                Primary Action
              </Button>
              <Button variant="secondary" loading={buttonLoading}>
                Secondary
              </Button>
              <Button variant="ghost" loading={buttonLoading}>
                Ghost
              </Button>
              <Button variant="danger" loading={buttonLoading} icon={AlertCircle}>
                Danger Action
              </Button>
              <Button variant="secondary" disabled>
                Disabled
              </Button>
            </div>

            {/* By Size */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/50">
              <Button variant="primary" size="sm">
                Small (sm)
              </Button>
              <Button variant="primary" size="md">
                Medium (md)
              </Button>
              <Button variant="primary" size="lg">
                Large (lg)
              </Button>
            </div>
          </div>
        </section>

        {/* Section 4: General Badges & Keyboards (Kbd) */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-tight">4. Badges & Keyboard Shortcuts (Kbd)</h2>
            <p className="text-xs text-text-muted">
              Lightweight counters, chips, and Linear-style keyboard badges.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="default">Default Badge</Badge>
              <Badge variant="outline">Outline Badge</Badge>
              <Badge variant="accent">Accent Badge</Badge>
              <Badge variant="muted">Muted Badge</Badge>
              <Badge variant="accent" size="sm">
                Small (sm)
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/50 text-xs text-text-muted">
              <span>Press</span>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
              <span>for quick search,</span>
              <Kbd>Esc</Kbd>
              <span>to dismiss,</span>
              <Kbd>Shift</Kbd>
              <Kbd>Enter</Kbd>
              <span>to run reproducer.</span>
            </div>
          </div>
        </section>

        {/* Section 5: Form Inputs (Input, Textarea, Select) */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-tight">5. Form Primitives</h2>
            <p className="text-xs text-text-muted">
              Input fields, Monospace code textareas, and chevron select menus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 rounded-xl border border-border bg-surface">
            <div className="space-y-3">
              <Input
                label="Repository URL"
                placeholder="https://github.com/org/repo"
                icon={Search}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText="Enter public or authenticated repo"
              />
              <Input
                label="Invalid Target (Error State)"
                defaultValue="invalid_target"
                error="Branch does not exist on remote"
              />
              <Input
                label="Disabled Input"
                defaultValue="readonly_token_3892f"
                disabled
              />
            </div>

            <div className="space-y-3">
              <Select
                label="Verification Harness"
                options={[
                  { value: "vitest", label: "Vitest Deterministic Runner" },
                  { value: "jest", label: "Jest Security Sandbox" },
                  { value: "pytest", label: "PyTest Exploit Harness" },
                ]}
                helperText="Select execution environment"
              />
              <Select
                label="Target Branch (Disabled)"
                disabled
                options={[{ value: "main", label: "main (protected)" }]}
              />
            </div>

            <div className="space-y-3">
              <Textarea
                label="Exploit Proof Script (Monospace)"
                mono
                rows={4}
                defaultValue={`// CVE-2024-XXXX reproduction test\nconst payload = '__proto__[polluted]=true';\nverify(payload);`}
                helperText="Runs inside isolated container"
              />
            </div>
          </div>
        </section>

        {/* Section 6: Tabs & Tooltips */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-tight">6. Tabs & Tooltips</h2>
            <p className="text-xs text-text-muted">Segmented tab control and hover tooltips.</p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-surface space-y-4">
            <Tabs defaultValue="reproduce">
              <TabsList>
                <TabsTrigger value="reproduce">Reproduce</TabsTrigger>
                <TabsTrigger value="patch">Validate Patch</TabsTrigger>
                <TabsTrigger value="regression">Regression Suite</TabsTrigger>
              </TabsList>
              <TabsContent value="reproduce" className="p-3 bg-surface-raised/40 rounded-lg border border-border/40 text-xs">
                Deterministic exploit harness executes to verify bug reproducibility before writing any code.
              </TabsContent>
              <TabsContent value="patch" className="p-3 bg-surface-raised/40 rounded-lg border border-border/40 text-xs">
                Applies patch diff and verifies that exploit payload now safely fails or neutralizes.
              </TabsContent>
              <TabsContent value="regression" className="p-3 bg-surface-raised/40 rounded-lg border border-border/40 text-xs">
                Executes baseline test suite to ensure normal application features continue working without regression.
              </TabsContent>
            </Tabs>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/50">
              <Tooltip content="Tooltip above element" position="top">
                <Button size="sm" variant="secondary">
                  Hover for Tooltip (Top)
                </Button>
              </Tooltip>

              <Tooltip content="Tooltip below element" position="bottom">
                <Button size="sm" variant="secondary">
                  Tooltip (Bottom)
                </Button>
              </Tooltip>

              <Tooltip content="Deterministic verification evidence" position="right">
                <Badge variant="accent">Hover Badge (Right)</Badge>
              </Tooltip>
            </div>
          </div>
        </section>

        {/* Section 7: Card, Skeleton & EmptyState */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-tight">7. Cards, Skeletons & Empty States</h2>
            <p className="text-xs text-text-muted">
              Structured cards, loading pulse placeholders, and zero-state visuals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card */}
            <Card hoverable>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>CVE-2024-3819</CardTitle>
                  <SeverityBadge severity="HIGH" size="sm" />
                </div>
                <CardDescription>Prototype pollution in query parser</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Status:</span>
                  <StatusBadge status="FIX_VERIFIED" size="sm" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Execution:</span>
                  <span className="font-mono text-2xs text-text">142ms</span>
                </div>
              </CardContent>
              <CardFooter>
                <span className="text-2xs text-text-muted font-mono">Run #1042</span>
                <Button size="sm" variant="primary">
                  View Proof
                </Button>
              </CardFooter>
            </Card>

            {/* Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48 mt-1" />
              </CardHeader>
              <CardContent className="space-y-2.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-7 w-full mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-20" />
              </CardFooter>
            </Card>

            {/* Empty State */}
            <EmptyState
              icon={ShieldCheck}
              title="No security regressions"
              description="All patches passed regression verification with zero broken tests."
              action={
                <Button size="sm" variant="secondary" icon={Plus}>
                  Add Test Harness
                </Button>
              }
            />
          </div>
        </section>

        {/* Section 8: Dialog & Toast System */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-tight">8. Dialogs & Toast Notifications</h2>
            <p className="text-xs text-text-muted">
              Interactive modals and global toast messaging system.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-surface space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                onClick={() => setIsDialogOpen(true)}
                id="open-dialog-btn"
              >
                Open Verification Dialog
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  toast({
                    title: "Status: Fix Verified",
                    description: "Patch was applied and exploit safely neutralized.",
                    variant: "success",
                  })
                }
              >
                Toast: Success
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  toast({
                    title: "Status: Regression Failure",
                    description: "2 existing tests failed after applying proposed fix.",
                    variant: "warning",
                  })
                }
              >
                Toast: Warning
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  toast({
                    title: "Status: Execution Error",
                    description: "Container harness runner timed out after 30s.",
                    variant: "danger",
                  })
                }
              >
                Toast: Danger
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  toast({
                    title: "Runner Info",
                    description: "PatchProof agent listening on port 3000.",
                    variant: "default",
                  })
                }
              >
                Toast: Info
              </Button>
            </div>
          </div>
        </section>

        {/* Interactive Dialog Demo */}
        <Dialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title="Execute Patch Verification"
          description="Confirm reproduction harness and automated patch verification parameters."
        >
          <div className="space-y-3 py-2 text-xs text-text">
            <p className="text-text-muted leading-relaxed">
              PatchProof will spin up a fresh isolated container, attempt deterministic reproduction,
              apply the pull request diff, and test for regressions.
            </p>
            <div className="p-3 rounded-lg bg-surface-raised border border-border/60 flex items-center justify-between">
              <span className="font-mono text-2xs text-text-muted">Target SHA: 7f41a89c</span>
              <StatusBadge status="NOT_REPRODUCED" size="sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Play}
              onClick={() => {
                setIsDialogOpen(false);
                toast({
                  title: "Verification Triggered",
                  description: "Worker dispatched job #2048 to sandbox cluster.",
                  variant: "success",
                });
              }}
            >
              Start Verification
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </div>
  );
}
