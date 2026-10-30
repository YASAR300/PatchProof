"use client";

import React, { forwardRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Reusable SearchField Component adhering strictly to Phase 2.3:
 * - Single container with leading search icon (12px padding), input starting 8px after
 * - Optional clear button (accessible via keyboard)
 * - Optional submit button (equal 4px inset from container, matching border radius)
 * - Fixed heights: md = 40px default, lg = 48px
 * - Focus-within outline 2px solid accent with 2px offset (no glow)
 * - role="search" on container form
 * - Enter submits, Escape clears
 */
export const SearchField = forwardRef(function SearchField(
  {
    className,
    value = "",
    onChange,
    onSubmit,
    onClear,
    placeholder = "Search...",
    size = "md", // "md" (40px) or "lg" (48px)
    disabled = false,
    loading = false,
    submitLabel = "Search",
    showSubmit = false,
    id = "search-field-input",
    "aria-label": ariaLabel = "Search",
    ...props
  },
  ref
) {
  const containerHeight = size === "lg" ? "h-10" : "h-8"; // 40px or 32px
  const iconSize = size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5";

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (onClear) onClear();
      else if (onChange) onChange({ target: { value: "" } });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit && !disabled && !loading) {
      onSubmit(value);
    }
  };

  const handleClearClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClear) onClear();
    else if (onChange) onChange({ target: { value: "" } });
  };

  return (
    <form
      role="search"
      onSubmit={handleFormSubmit}
      className={cn(
        "relative flex items-center w-full rounded-[6px] border border-border bg-surface transition-colors duration-150",
        containerHeight,
        "focus-within:border-accent hover:border-border-strong",
        disabled && "opacity-50 cursor-not-allowed bg-surface-raised",
        className
      )}
    >
      {/* Leading Icon fixed at 12px left */}
      <div className="absolute left-3 flex items-center justify-center pointer-events-none text-text-muted">
        {loading ? (
          <Loader2 className={cn(iconSize, "animate-spin text-accent")} aria-hidden="true" />
        ) : (
          <Search className={iconSize} aria-hidden="true" />
        )}
      </div>

      {/* Main Input */}
      <input
        ref={ref}
        id={id}
        type="search"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        className={cn(
          "w-full h-full bg-transparent text-xs text-text placeholder:text-text-muted outline-none border-none",
          "pl-9", // 12px left + icon + 8px gap
          value && !disabled ? "pr-8" : "pr-3",
          showSubmit && "pr-24"
        )}
        {...props}
      />

      {/* Clear Button */}
      {value && !disabled && (
        <button
          type="button"
          onClick={handleClearClick}
          aria-label="Clear search input"
          className={cn(
            "absolute flex items-center justify-center text-text-muted hover:text-text rounded p-1 transition-colors",
            showSubmit ? "right-20" : "right-2.5",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          )}
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}

      {/* Inner Submit Button with 4px inset */}
      {showSubmit && (
        <div className="absolute right-1 inset-y-1 flex items-center">
          <button
            type="submit"
            disabled={disabled || loading}
            className={cn(
              "h-full px-3 text-2xs font-semibold rounded-md bg-accent text-accent-foreground hover:bg-accent-hover transition-colors select-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              (disabled || loading) && "opacity-50 cursor-not-allowed"
            )}
          >
            {submitLabel}
          </button>
        </div>
      )}
    </form>
  );
});

SearchField.displayName = "SearchField";

