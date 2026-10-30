"use client";

import React, { createContext, useContext, useState, useCallback, useId } from "react";
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/cn";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "default", duration = 4000 }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { id, title, description, variant, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }

      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
        role="region"
      >
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastItem({ toast, onDismiss }) {
  const { title, description, variant } = toast;

  const icons = {
    default: <Info className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />,
    success: <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />,
    warning: <AlertTriangle className="w-4 h-4 text-text-muted flex-shrink-0" aria-hidden="true" />,
    danger: <AlertCircle className="w-4 h-4 text-text-muted flex-shrink-0" aria-hidden="true" />,
  };

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg shadow-elevation-2 border border-border text-sm bg-surface transition-all animate-in fade-in slide-in-from-bottom-2"
      )}
      role="status"
    >
      <div className="mt-0.5">{icons[variant] || icons.default}</div>
      <div className="flex-1 space-y-0.5">
        {title && <div className="font-medium text-text text-xs leading-snug">{title}</div>}
        {description && <div className="text-2xs text-text-muted leading-relaxed">{description}</div>}
      </div>
      <button
        onClick={onDismiss}
        className="text-text-muted hover:text-text p-1 rounded transition-colors -mr-1 -mt-1"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
