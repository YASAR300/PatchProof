import React from "react";
import {
  Bug,
  ShieldCheck,
  HelpCircle,
  AlertOctagon,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  MinusCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { VERIFICATION_STATUS } from "@/lib/constants";

const STATUS_ICONS = {
  REPRODUCED: Bug,
  NOT_REPRODUCED: ShieldCheck,
  INCONCLUSIVE: HelpCircle,
  EXECUTION_ERROR: AlertOctagon,
  FIX_VERIFIED: CheckCircle2,
  PATCH_NOT_VERIFIED: ShieldAlert,
  REGRESSION_FAILURE: AlertTriangle,
  UNVERIFIED: MinusCircle,
};

const STATUS_COLOR_STYLES = {
  red: "text-[var(--semantic-red)] bg-[var(--semantic-red-bg)] border-[var(--semantic-red-border)]",
  green: "text-[var(--semantic-green)] bg-[var(--semantic-green-bg)] border-[var(--semantic-green-border)]",
  amber: "text-[var(--semantic-amber)] bg-[var(--semantic-amber-bg)] border-[var(--semantic-amber-border)]",
  orange: "text-[var(--semantic-orange)] bg-[var(--semantic-orange-bg)] border-[var(--semantic-orange-border)]",
  gray: "text-[var(--semantic-gray)] bg-[var(--semantic-gray-bg)] border-[var(--semantic-gray-border)]",
  neutral: "text-[var(--semantic-neutral)] bg-[var(--semantic-neutral-bg)] border-[var(--semantic-neutral-border)]",
};

/**
 * StatusBadge
 * Renders verified deterministic status with semantic coloring and icon.
 *
 * @param {Object} props
 * @param {keyof typeof VERIFICATION_STATUS | string} props.status
 * @param {'sm' | 'md'} [props.size='md']
 * @param {boolean} [props.showIcon=true]
 * @param {string} [props.className]
 */
export function StatusBadge({
  status,
  size = "md",
  showIcon = true,
  className,
  ...props
}) {
  const normalizedKey = typeof status === "string" ? status.toUpperCase().trim() : "";
  const config = VERIFICATION_STATUS[normalizedKey] || {
    key: normalizedKey || "UNKNOWN",
    label: status || "Unknown",
    color: "neutral",
  };

  const IconComponent = STATUS_ICONS[normalizedKey] || MinusCircle;
  const colorStyle = STATUS_COLOR_STYLES[config.color] || STATUS_COLOR_STYLES.neutral;

  const sizeClasses = {
    sm: "text-2xs px-1.5 py-0.5 rounded gap-1",
    md: "text-xs px-2 py-0.5 rounded-md gap-1.5",
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium font-mono uppercase tracking-wider border select-none transition-colors",
        colorStyle,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      title={config.description || config.label}
      {...props}
    >
      {showIcon && (
        <IconComponent
          className={cn("flex-shrink-0", iconSizeClasses[size] || iconSizeClasses.md)}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}
