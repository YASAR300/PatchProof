"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Textarea = forwardRef(function Textarea(
  {
    className,
    label,
    error,
    helperText,
    disabled = false,
    mono = false,
    id,
    rows = 4,
    ...props
  },
  ref
) {
  const generatedId = React.useId();
  const textareaId = id || generatedId;

  return (
    <div className="w-full space-y-1.5 font-sans">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-2xs font-medium text-text-muted select-none"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        className={cn(
          "w-full rounded-md border border-border bg-surface p-2.5 text-xs text-text placeholder:text-text-muted/60 transition-colors duration-150 outline-none resize-y",
          mono && "font-mono text-2xs",
          "focus:border-accent hover:border-border-strong",
          error && "border-state-danger-border text-state-danger-fg",
          disabled && "opacity-50 cursor-not-allowed bg-surface-raised",
          className
        )}
        {...props}
      />
      {error ? (
        <p className="text-2xs text-danger font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-2xs text-text-muted">{helperText}</p>
      ) : null}
    </div>
  );
});

Textarea.displayName = "Textarea";
