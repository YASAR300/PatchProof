import React from "react";
import { cn } from "@/lib/cn";

export function PageHeader({ title, description, actions, children, className }) {
  return (
    <div className={cn("pb-6 mb-6 border-b border-border/60 space-y-1 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4", className)}>
      <div className="space-y-1">
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-text">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-text-muted leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {(actions || children) && (
        <div className="flex items-center gap-2 pt-2 sm:pt-0">
          {actions || children}
        </div>
      )}
    </div>
  );
}
