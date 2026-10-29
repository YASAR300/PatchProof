import React from "react";
import { cn } from "@/lib/cn";

export function Card({ className, children, hoverable = false, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface text-text shadow-sm transition-all",
        hoverable && "hover:border-border-strong hover:bg-surface-raised/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("p-4 sm:p-5 pb-3 border-b border-border/50 flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, as: Component = "h3", ...props }) {
  return (
    <Component
      className={cn("text-sm font-semibold tracking-tight text-text", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn("text-xs text-text-muted leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("p-4 sm:p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn("p-4 sm:p-5 pt-3 border-t border-border/50 flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}
