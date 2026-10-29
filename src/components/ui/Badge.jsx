import React from "react";
import { cn } from "@/lib/cn";

const badgeVariants = {
  default: "bg-surface-raised text-text border border-border",
  outline: "bg-transparent text-text border border-border",
  accent: "bg-accent/10 text-accent border border-accent/20",
  muted: "bg-surface text-text-muted border border-border/50",
};

const badgeSizes = {
  sm: "text-2xs px-1.5 py-0.5 rounded",
  md: "text-xs px-2 py-0.5 rounded-md",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium font-sans leading-none select-none tracking-tight",
        badgeVariants[variant] || badgeVariants.default,
        badgeSizes[size] || badgeSizes.md,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
