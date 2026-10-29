import React from "react";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon: Icon = ShieldAlert,
  title = "No items found",
  description = "Get started by running a security verification or adding a test harness.",
  action,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border rounded-xl bg-surface/40",
        className
      )}
      {...props}
    >
      <div className="w-10 h-10 rounded-full bg-surface-raised border border-border flex items-center justify-center text-text-muted mb-3.5">
        <Icon className="w-5 h-5 text-text-muted" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-text tracking-tight mb-1">{title}</h3>
      <p className="text-xs text-text-muted max-w-sm mb-5 leading-relaxed">{description}</p>
      {action && <div className="inline-flex items-center gap-2">{action}</div>}
    </div>
  );
}
