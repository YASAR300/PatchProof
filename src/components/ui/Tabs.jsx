"use client";

import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/cn";

const TabsContext = createContext(null);

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  children,
  className,
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeValue = value !== undefined ? value : internalValue;

  const setActiveValue = (val) => {
    if (value === undefined) {
      setInternalValue(val);
    }
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue }}>
      <div className={cn("w-full space-y-3 font-sans", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children, ...props }) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-8 items-center justify-start rounded-lg bg-surface-raised p-1 text-text-muted border border-border/60 gap-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className, disabled = false, ...props }) {
  const { activeValue, setActiveValue } = useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => setActiveValue(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded px-2.5 py-1 text-xs font-medium transition-all select-none outline-none",
        isActive
          ? "bg-surface text-text shadow-sm"
          : "text-text-muted hover:text-text hover:bg-surface/50",
        disabled && "pointer-events-none opacity-40",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className, ...props }) {
  const { activeValue } = useContext(TabsContext);
  if (activeValue !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn("outline-none text-text animate-in fade-in duration-150", className)}
      {...props}
    >
      {children}
    </div>
  );
}
