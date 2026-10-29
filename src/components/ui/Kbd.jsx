import React from "react";
import { cn } from "@/lib/cn";

export function Kbd({ children, className, ...props }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center font-mono font-medium text-2xs leading-none",
        "h-5 min-w-[20px] px-1.5 rounded",
        "bg-surface-raised border border-border text-text-muted shadow-[0_1px_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_1px_rgba(255,255,255,0.06)]",
        "select-none",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
