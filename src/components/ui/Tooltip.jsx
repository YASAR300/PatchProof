"use client";

import React, { useState } from "react";
import { cn } from "@/lib/cn";

export function Tooltip({
  content,
  children,
  position = "top",
  delay = 150,
  className,
}) {
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const show = () => {
    const id = setTimeout(() => setVisible(true), delay);
    setTimeoutId(id);
  };

  const hide = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setVisible(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && content && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 pointer-events-none whitespace-nowrap rounded bg-surface-raised px-2 py-1 text-2xs font-medium text-text shadow-md border border-border backdrop-blur-sm animate-in fade-in zoom-in-95 duration-100",
            positionClasses[position] || positionClasses.top,
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
