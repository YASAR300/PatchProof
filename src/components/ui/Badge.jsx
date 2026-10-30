import React from "react";
import { cn } from "@/lib/cn";

const badgeVariants = {
  default: "bg-surface-raised text-text-secondary border border-border",
  outline: "bg-transparent text-text-secondary border border-border",
  accent: "bg-accent/10 text-accent border border-accent/20",
  muted: "bg-surface-raised/50 text-text-tertiary border border-border",
  danger: "bg-state-danger-bg text-state-danger-fg border border-state-danger-border",
  warning: "bg-state-warning-bg text-state-warning-fg border border-state-warning-border",
  success: "bg-state-success-bg text-state-success-fg border border-state-success-border",
  info: "bg-state-info-bg text-state-info-fg border border-state-info-border",
};

export function Badge({
  children,
  variant = "default",
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-5 px-1.5 rounded-[4px] text-[11px] font-medium leading-none select-none tracking-tight whitespace-nowrap",
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
