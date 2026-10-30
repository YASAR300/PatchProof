import React from "react";
import { cn } from "@/lib/cn";

export function Card({ className, children, hoverable = false, ...props }) {
  return (
    <div
      className={cn(
        "rounded-[8px] border border-border bg-surface text-text transition-colors duration-150 overflow-hidden",
        hoverable && "hover:border-border-strong hover:bg-surface-raised",
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
    <div
      className={cn(
        "h-10 px-3.5 border-b border-border flex items-center justify-between gap-3 text-xs bg-surface select-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, as: Component = "h2", ...props }) {
  return (
    <Component
      className={cn("text-[13px] font-medium tracking-tight text-text flex items-center gap-2", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn("text-xs text-text-secondary leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("p-3.5 sm:p-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn("px-3.5 py-2.5 border-t border-border flex items-center justify-between bg-surface-raised/40", className)}
      {...props}
    >
      {children}
    </div>
  );
}
