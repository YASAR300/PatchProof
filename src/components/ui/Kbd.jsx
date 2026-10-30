import React from "react";
import { cn } from "@/lib/cn";

export function Kbd({ children, className, ...props }) {
  return (
    <kbd
      className={cn(
        "hidden sm:inline-flex items-center justify-center font-mono font-medium text-[11px] leading-none select-none",
        "h-5 px-1.5 rounded-[4px]",
        "bg-surface-raised border border-border text-text-tertiary",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
