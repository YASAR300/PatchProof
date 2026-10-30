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
  CRITICAL: "text-state-danger-fg bg-state-danger-bg border-state-danger-border",
  HIGH: "text-state-warning-fg bg-state-warning-bg border-state-warning-border",
  MEDIUM: "text-state-warning-fg bg-state-warning-bg border-state-warning-border",
  LOW: "text-state-info-fg bg-state-info-bg border-state-info-border",
  INFO: "text-text-secondary bg-surface-raised border-border",
};

export function SeverityBadge({
  severity = "INFO",
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
  const colorStyle = SEVERITY_COLOR_STYLES[normalizedKey] || SEVERITY_COLOR_STYLES.INFO;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-5 px-1.5 rounded-[4px] border text-[11px] font-medium font-sans select-none tracking-tight whitespace-nowrap",
        colorStyle,
        className
      )}
      title={`Severity: ${config.label}`}
      {...props}
    >
      {showIcon && (
        <IconComponent
          className="w-3 h-3 flex-shrink-0"
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}
