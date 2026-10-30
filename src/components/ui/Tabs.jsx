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
      <div className={cn("w-full font-sans", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children, ...props }) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-6 border-b border-border text-xs w-full select-none",
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
        "relative py-2.5 text-xs font-medium transition-colors select-none outline-none whitespace-nowrap -mb-px flex items-center gap-2",
        isActive
          ? "text-text border-b-2 border-accent"
          : "text-text-secondary hover:text-text border-b-2 border-transparent",
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
      className={cn("pt-4 outline-none text-text", className)}
      {...props}
    >
      {children}
    </div>
  );
}
