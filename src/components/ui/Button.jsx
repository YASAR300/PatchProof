"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const variantStyles = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent-hover shadow-sm active:translate-y-px border border-transparent",
  secondary:
    "bg-surface hover:bg-surface-raised text-text border border-border hover:border-border-strong active:translate-y-px",
  ghost:
    "bg-transparent hover:bg-surface-raised text-text hover:text-text active:translate-y-px border border-transparent",
  danger:
    "bg-danger text-danger-foreground hover:bg-danger-hover shadow-sm active:translate-y-px border border-transparent",
};

const sizeStyles = {
  sm: "h-7 px-2.5 text-2xs font-medium gap-1.5 rounded",
  md: "h-8.5 px-3 text-xs font-medium gap-2 rounded-md",
  lg: "h-10 px-4 text-sm font-medium gap-2.5 rounded-lg",
};

export const Button = forwardRef(function Button(
  {
    className,
    variant = "secondary",
    size = "md",
    loading = false,
    disabled = false,
    children,
    type = "button",
    icon: Icon,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center font-sans tracking-tight transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-1",
        variantStyles[variant] || variantStyles.secondary,
        sizeStyles[size] || sizeStyles.md,
        isDisabled && "opacity-50 cursor-not-allowed pointer-events-none shadow-none",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
});

Button.displayName = "Button";
