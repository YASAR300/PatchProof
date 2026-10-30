"use client";

import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export const Select = forwardRef(function Select(
  {
    className,
    label,
    error,
    helperText,
    options = [],
    children,
    disabled = false,
    id,
    ...props
  },
  ref
) {
  const generatedId = React.useId();
  const selectId = id || generatedId;

  return (
    <div className="w-full space-y-1.5 font-sans">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[11px] font-medium text-text-tertiary select-none"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={cn(
            "w-full h-8 appearance-none rounded-[6px] border border-border bg-surface pl-2.5 pr-8 text-xs text-text transition-colors outline-none cursor-pointer",
            "focus:border-accent hover:border-border-strong",
            error && "border-state-danger-border text-state-danger-fg",
            disabled && "opacity-50 cursor-not-allowed bg-surface-raised",
            className
          )}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>
      {error ? (
        <p className="text-[11px] text-state-danger-fg leading-tight">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-text-tertiary leading-tight">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Select.displayName = "Select";
