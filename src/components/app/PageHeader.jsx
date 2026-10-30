import React from "react";
import { cn } from "@/lib/cn";

export function PageHeader({ title, description, actions, children, className }) {
  return (
    <div className={cn("pb-5 space-y-1 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4", className)}>
      <div className="space-y-0.5">
        <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-text">
          {title}
        </h1>
        {description && (
          <p className="text-[13px] text-text-secondary leading-normal max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {(actions || children) && (
        <div className="flex items-center gap-2 pt-2 sm:pt-0 flex-shrink-0">
          {actions || children}
        </div>
      )}
    </div>
  );
}
