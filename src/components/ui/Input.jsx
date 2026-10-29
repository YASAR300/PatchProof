"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Input = forwardRef(function Input(
  {
    className,
    type = "text",
    label,
    error,
    helperText,
    icon: Icon,
    endIcon: EndIcon,
    disabled = false,
    id,
    ...props
  },
  ref
) {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full space-y-1.5 font-sans">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-2xs font-medium text-text-muted select-none"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-text-muted pointer-events-none">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={cn(
            "w-full h-8.5 rounded-md border border-border bg-surface px-3 text-xs text-text placeholder:text-text-muted/60 transition-colors duration-150 outline-none",
            "focus:border-accent focus:ring-1 focus:ring-accent/40",
            Icon && "pl-8.5",
            EndIcon && "pr-8.5",
            error && "border-danger focus:border-danger focus:ring-danger/30",
            disabled && "opacity-50 cursor-not-allowed bg-surface-raised",
            className
          )}
          {...props}
        />
        {EndIcon && (
          <div className="absolute right-3 text-text-muted pointer-events-none">
            <EndIcon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
      {error ? (
        <p className="text-2xs text-danger font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-2xs text-text-muted">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = "Input";
