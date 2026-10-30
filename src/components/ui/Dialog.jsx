"use client";

import React, { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "dialog-title" : undefined}
      aria-describedby={description ? "dialog-desc" : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Window: strictly 12px radius */}
      <div
        className={cn(
          "relative w-full max-w-lg rounded-[12px] border border-border bg-surface p-5 sm:p-6 shadow-2xl",
          "animate-in zoom-in-95 fade-in duration-150 z-10",
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-text-muted hover:text-text hover:bg-surface-raised transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {title && (
          <h2 id="dialog-title" className="text-sm font-semibold tracking-tight text-text pr-6">
            {title}
          </h2>
        )}

        {description && (
          <p id="dialog-desc" className="mt-1 text-xs text-text-muted leading-relaxed">
            {description}
          </p>
        )}

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function DialogFooter({ className, children, ...props }) {
  return (
    <div
      className={cn("mt-5 pt-3 border-t border-border/50 flex items-center justify-end gap-2.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}
