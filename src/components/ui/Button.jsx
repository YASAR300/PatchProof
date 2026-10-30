import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const variantStyles = {
  primary:
    "bg-accent text-white hover:bg-accent-hover active:bg-accent-hover/90 border border-transparent",
  secondary:
    "bg-surface-raised border border-border text-text hover:bg-surface-hover hover:border-border-strong active:bg-surface-selected",
  ghost:
    "bg-transparent text-text-secondary hover:text-text hover:bg-surface-hover active:bg-surface-selected border border-transparent",
  danger:
    "bg-state-danger-bg text-state-danger-fg border border-state-danger-border hover:bg-state-danger-bg/80 active:bg-state-danger-bg/90",
};

const sizeStyles = {
  sm: "h-7 px-2.5 text-xs font-medium gap-1.5 rounded-[6px]",
  md: "h-8 px-3 text-xs font-medium gap-1.5 rounded-[6px]",
  lg: "h-9 px-3.5 text-xs font-medium gap-2 rounded-[6px]",
  "icon-sm": "h-7 w-7 p-0 rounded-[6px] relative after:content-[''] after:absolute after:inset-[-6px] sm:after:hidden",
  "icon-md": "h-8 w-8 p-0 rounded-[6px] relative after:content-[''] after:absolute after:inset-[-4px] sm:after:hidden",
  "icon-lg": "h-9 w-9 p-0 rounded-[6px]",
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
    icon,
    iconPosition = "left", // "left" or "right"
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  const renderIcon = () => {
    if (loading) {
      return <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" aria-hidden="true" />;
    }
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, {
        className: cn("w-3.5 h-3.5 flex-shrink-0", icon.props?.className),
        "aria-hidden": "true",
      });
    }
    if (typeof icon === "function" || typeof icon === "object") {
      const IconComp = icon;
      return <IconComp className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />;
    }
    return null;
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading ? "true" : undefined}
      className={cn(
        "inline-flex flex-row flex-nowrap items-center justify-center whitespace-nowrap font-sans tracking-tight select-none outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variantStyles[variant] || variantStyles.secondary,
        sizeStyles[size] || sizeStyles.md,
        isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      {...props}
    >
      {iconPosition === "left" && renderIcon()}
      {children}
      {iconPosition === "right" && renderIcon()}
    </button>
  );
});

Button.displayName = "Button";
