"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function DropdownMenu({
  trigger,
  items = [], // Array of { id, label, icon, onClick, destructive, divider, selected, disabled, shortcut, header }
  align = "start", // "start" or "end"
  className,
  panelClassName,
  minWidth = 180,
  maxHeight = 320,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, placement: "bottom" });
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const typeaheadTimeoutRef = useRef(null);
  const typeaheadStringRef = useRef("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const menuWidth = Math.max(rect.width, minWidth);

    // Collision detection: flip to top if insufficient space below
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldFlip = spaceBelow < 220 && spaceAbove > spaceBelow;

    let top = shouldFlip
      ? rect.top + scrollTop - 4
      : rect.bottom + scrollTop + 4;

    let left = rect.left + scrollLeft;
    if (align === "end") {
      left = rect.right + scrollLeft - menuWidth;
    }

    // Keep inside viewport with 8px safe margin
    if (left < 8) left = 8;
    if (left + menuWidth > viewportWidth - 8) {
      left = Math.max(8, viewportWidth - 8 - menuWidth);
    }

    setCoords({
      top,
      left,
      width: menuWidth,
      placement: shouldFlip ? "top" : "bottom",
    });
  }, [align, minWidth]);

  const handleOpen = () => {
    updatePosition();
    setIsOpen(true);
    // Find first enabled item
    const firstEnabled = items.findIndex((i) => !i.divider && !i.disabled && !i.header);
    setHighlightedIndex(firstEnabled >= 0 ? firstEnabled : 0);
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  }, []);

  // Keyboard navigation on trigger
  const handleTriggerKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  };

  // Click outside, escape, and keyboard navigation handling
  useEffect(() => {
    if (!isOpen) return;

    const validIndices = items
      .map((item, idx) => (!item.divider && !item.disabled && !item.header ? idx : null))
      .filter((idx) => idx !== null);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      } else if (e.key === "Tab") {
        handleClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const currentPos = validIndices.indexOf(prev);
          const nextPos = (currentPos + 1) % validIndices.length;
          return validIndices[nextPos];
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const currentPos = validIndices.indexOf(prev);
          const nextPos = (currentPos - 1 + validIndices.length) % validIndices.length;
          return validIndices[nextPos];
        });
      } else if (e.key === "Home") {
        e.preventDefault();
        if (validIndices.length > 0) setHighlightedIndex(validIndices[0]);
      } else if (e.key === "End") {
        e.preventDefault();
        if (validIndices.length > 0) setHighlightedIndex(validIndices[validIndices.length - 1]);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const currentItem = items[highlightedIndex];
        if (currentItem && !currentItem.disabled && currentItem.onClick) {
          currentItem.onClick();
          handleClose();
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Type-ahead support
        if (typeaheadTimeoutRef.current) clearTimeout(typeaheadTimeoutRef.current);
        typeaheadStringRef.current += e.key.toLowerCase();
        typeaheadTimeoutRef.current = setTimeout(() => {
          typeaheadStringRef.current = "";
        }, 500);

        const searchStr = typeaheadStringRef.current;
        const matchIdx = items.findIndex(
          (item, idx) =>
            validIndices.includes(idx) &&
            item.label &&
            item.label.toLowerCase().startsWith(searchStr)
        );
        if (matchIdx >= 0) {
          setHighlightedIndex(matchIdx);
        }
      }
    };

    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      updatePosition();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isOpen, highlightedIndex, items, handleClose, updatePosition]);

  const menuContent = isOpen && mounted ? (
    createPortal(
      <div
        ref={menuRef}
        role="menu"
        aria-orientation="vertical"
        style={{
          position: "absolute",
          top: coords.placement === "top" ? undefined : `${coords.top}px`,
          bottom: coords.placement === "top" ? `${window.innerHeight - coords.top + 8}px` : undefined,
          left: `${coords.left}px`,
          minWidth: `${coords.width}px`,
          maxWidth: "calc(100vw - 16px)",
          maxHeight: `${maxHeight}px`,
          zIndex: 9999,
        }}
        className={cn(
          "rounded-[8px] border border-border bg-surface p-1 shadow-md overflow-y-auto select-none outline-none",
          "transition-opacity duration-100 ease-out",
          panelClassName
        )}
      >
        {items.map((item, idx) => {
          if (item.divider) {
            return (
              <div
                key={`div-${idx}`}
                className="my-1 border-t border-border/60"
                role="separator"
              />
            );
          }

          if (item.header) {
            return (
              <div
                key={`header-${idx}`}
                className="px-2 py-1 text-[11px] font-medium text-text-tertiary select-none"
              >
                {item.header}
              </div>
            );
          }

          const isDestructive = item.destructive;
          const isSelected = item.selected;
          const isHighlighted = idx === highlightedIndex;
          const Icon = item.icon;

          return (
            <button
              key={item.id || idx}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onMouseEnter={() => setHighlightedIndex(idx)}
              onClick={() => {
                if (!item.disabled && item.onClick) {
                  item.onClick();
                  handleClose();
                }
              }}
              className={cn(
                "w-full h-8 px-2 rounded-[6px] flex items-center justify-between text-xs transition-colors outline-none select-none",
                isHighlighted && "bg-surface-hover",
                isDestructive
                  ? "text-state-danger-fg hover:bg-state-danger-bg"
                  : isSelected
                  ? "bg-surface-selected text-text font-medium"
                  : "text-text hover:bg-surface-hover",
                item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-text-secondary">
                  {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                {item.shortcut && (
                  <span className="text-[11px] font-mono text-text-tertiary px-1 py-0.5 rounded-[4px] bg-surface-raised border border-border">
                    {item.shortcut}
                  </span>
                )}
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                )}
              </div>
            </button>
          );
        })}
      </div>,
      document.body
    )
  ) : null;

  const renderedTrigger = React.isValidElement(trigger) ? (
    React.cloneElement(trigger, {
      ref: triggerRef,
      onClick: (e) => {
        trigger.props?.onClick?.(e);
        isOpen ? handleClose() : handleOpen();
      },
      onKeyDown: (e) => {
        trigger.props?.onKeyDown?.(e);
        handleTriggerKeyDown(e);
      },
      "aria-haspopup": "menu",
      "aria-expanded": isOpen,
      className: cn(trigger.props?.className, className),
    })
  ) : (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => (isOpen ? handleClose() : handleOpen())}
      onKeyDown={handleTriggerKeyDown}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      className={cn("inline-block", className)}
    >
      {trigger}
    </button>
  );

  return (
    <>
      {renderedTrigger}
      {menuContent}
    </>
  );
}
