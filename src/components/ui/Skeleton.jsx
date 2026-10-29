import React from "react";
import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-md bg-surface-raised animate-pulse border border-border/40",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
