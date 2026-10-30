import React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({
  variant = "horizontal", // "horizontal" or "mark"
  size = "md", // "sm", "md", "lg"
  href = "/",
  className,
  markClassName,
  textClassName,
}) {
  const isMarkOnly = variant === "mark";

  const sizeStyles = {
    sm: { mark: "w-5 h-5", text: "text-[13px] font-semibold tracking-tight" },
    md: { mark: "w-6 h-6", text: "text-sm font-semibold tracking-tight" },
    lg: { mark: "w-8 h-8", text: "text-base font-bold tracking-tight" },
  };

  const selectedSize = sizeStyles[size] || sizeStyles.md;

  const content = (
    <div className={cn("inline-flex items-center gap-2 select-none text-text", className)}>
      {/* Precision Stitched Security Shield */}
      <svg
        className={cn("flex-shrink-0", selectedSize.mark, markClassName)}
        viewBox="0 0 64 64"
        fill="none"
        role="img"
        aria-hidden="true"
      >
        <title>PatchProof Logo</title>
        <path d="M12 12C12 12 28 8 30 8V56C25 53 12 43 12 28V12Z" fill="currentColor" />
        <path d="M52 12C52 12 36 8 34 8V56C39 53 52 43 52 28V12Z" fill="#5B6CFF" />
        <rect x="26" y="16" width="12" height="3" rx="1.5" fill="#FFFFFF" />
        <rect x="26" y="26" width="12" height="3" rx="1.5" fill="#FFFFFF" />
        <rect x="26" y="36" width="12" height="3" rx="1.5" fill="#FFFFFF" />
        <path d="M22 30L29 37L44 20" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {!isMarkOnly && (
        <span className={cn("font-bold tracking-tight text-text", selectedSize.text, textClassName)}>
          Patch<span className="text-[#5B6CFF]">Proof</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="PatchProof Home" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md">
        {content}
      </Link>
    );
  }

  return content;
}

