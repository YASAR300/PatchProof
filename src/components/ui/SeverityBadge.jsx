import React from "react";
import { ShieldAlert, AlertTriangle, AlertCircle, Info, Shield } from "lucide-react";
import { cn } from "@/lib/cn";
import { SEVERITY_LEVELS } from "@/lib/constants";

const SEVERITY_ICONS = {
  CRITICAL: ShieldAlert,
  HIGH: AlertTriangle,
  MEDIUM: AlertCircle,
  LOW: Shield,
  INFO: Info,
};

const SEVERITY_COLOR_STYLES = {
  CRITICAL:
    "text-[var(--severity-critical)] bg-[var(--severity-critical-bg)] border-[var(--severity-critical-border)]",
  HIGH: "text-[var(--severity-high)] bg-[var(--severity-high-bg)] border-[var(--severity-high-border)]",
  MEDIUM:
    "text-[var(--severity-medium)] bg-[var(--severity-medium-bg)] border-[var(--severity-medium-border)]",
  LOW: "text-[var(--severity-low)] bg-[var(--severity-low-bg)] border-[var(--severity-low-border)]",
  INFO: "text-[var(--severity-info)] bg-[var(--severity-info-bg)] border-[var(--severity-info-border)]",
};

/**
 * SeverityBadge
 * Renders security issue severity indicator.
 *
 * @param {Object} props
 * @param {'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'} props.severity
 * @param {'sm' | 'md'} [props.size='md']
 * @param {boolean} [props.showIcon=true]
 * @param {string} [props.className]
 */
export function SeverityBadge({
  severity = "INFO",
  size = "md",
  showIcon = true,
  className,
  ...props
}) {
  const normalizedKey = typeof severity === "string" ? severity.toUpperCase().trim() : "INFO";
  const config = SEVERITY_LEVELS[normalizedKey] || {
    key: normalizedKey,
    label: severity || "Unknown",
  };

  const IconComponent = SEVERITY_ICONS[normalizedKey] || Info;
  const colorStyle =
    SEVERITY_COLOR_STYLES[normalizedKey] || SEVERITY_COLOR_STYLES.INFO;

  const sizeClasses = {
    sm: "text-2xs px-1.5 py-0.5 rounded gap-1 font-semibold",
    md: "text-xs px-2 py-0.5 rounded-md gap-1.5 font-semibold",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono uppercase tracking-wider border select-none transition-colors",
        colorStyle,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      {...props}
    >
      {showIcon && (
        <IconComponent
          className={cn("flex-shrink-0", iconSizes[size] || iconSizes.md)}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}
