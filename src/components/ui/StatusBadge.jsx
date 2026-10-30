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
  red: "text-state-danger-fg bg-state-danger-bg border-state-danger-border",
  green: "text-state-success-fg bg-state-success-bg border-state-success-border",
  amber: "text-state-warning-fg bg-state-warning-bg border-state-warning-border",
  orange: "text-state-warning-fg bg-state-warning-bg border-state-warning-border",
  gray: "text-text-secondary bg-surface-raised border-border",
  neutral: "text-text-secondary bg-surface-raised border-border",
};

export function StatusBadge({
  status,
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

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-5 px-1.5 rounded-[4px] border text-[11px] font-medium font-sans select-none tracking-tight whitespace-nowrap",
        colorStyle,
        className
      )}
      title={config.description || config.label}
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
