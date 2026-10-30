import React from "react";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon,
  title = "No items found",
  description = "Get started by running a security verification or connecting a repository.",
  action,
  className,
  ...props
}) {
  const renderIcon = () => {
    if (!icon) {
      return <ShieldAlert className="w-4 h-4 text-text-secondary" aria-hidden="true" />;
    }
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, {
        className: cn("w-4 h-4 text-text-secondary", icon.props?.className),
        "aria-hidden": "true",
      });
    }
    if (typeof icon === "function" || typeof icon === "object") {
      const IconComp = icon;
      return <IconComp className="w-4 h-4 text-text-secondary" aria-hidden="true" />;
    }
    return null;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-6 sm:p-8 border border-dashed border-border rounded-[8px] bg-surface",
        className
      )}
      {...props}
    >
      <div className="w-8 h-8 rounded-[6px] bg-surface-raised border border-border flex items-center justify-center text-text-secondary mb-3">
        {renderIcon()}
      </div>
      <h3 className="text-[13px] font-medium text-text tracking-tight mb-1">{title}</h3>
      <p className="text-xs text-text-secondary max-w-sm mb-4 leading-relaxed">{description}</p>
      {action && <div className="inline-flex items-center gap-2">{action}</div>}
    </div>
  );
}
