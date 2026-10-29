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
          className="block text-2xs font-medium text-text-muted select-none"
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
            "w-full h-8.5 appearance-none rounded-md border border-border bg-surface pl-3 pr-8 text-xs text-text transition-colors duration-150 outline-none cursor-pointer",
            "focus:border-accent focus:ring-1 focus:ring-accent/40",
            error && "border-danger focus:border-danger focus:ring-danger/30",
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
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>
      {error ? (
        <p className="text-2xs text-danger font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-2xs text-text-muted">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = "Select";
