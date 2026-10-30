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
          className="block text-[11px] font-medium text-text-tertiary select-none"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-2.5 text-text-tertiary pointer-events-none">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={cn(
            "w-full h-8 rounded-[6px] border border-border bg-surface px-2.5 text-xs text-text placeholder:text-text-tertiary transition-colors outline-none",
            "focus:border-accent hover:border-border-strong",
            Icon && "pl-8",
            EndIcon && "pr-8",
            error && "border-state-danger-border text-state-danger-fg",
            disabled && "opacity-50 cursor-not-allowed bg-surface-raised",
            className
          )}
          {...props}
        />
        {EndIcon && (
          <div className="absolute right-2.5 text-text-tertiary pointer-events-none">
            <EndIcon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-[11px] text-state-danger-fg leading-tight">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-[11px] text-text-tertiary leading-tight">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
