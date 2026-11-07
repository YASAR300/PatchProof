"use client";

import React, { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const AI_SUGGESTION_BANNER =
  "AI-generated suggestion. Not verified. Review and test before use.";

/**
 * Renders an AI suggested code snippet with the required unverified warning banner and copy button.
 *
 * @param {object} props
 * @param {string} props.code - Raw code string
 * @param {string} [props.title] - Optional title for the code block
 * @param {string} [props.language] - Code language label
 */
export function AiSuggestionCodeBlock({ code, title, language = "python" }) {
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-[6px] border border-amber-500/30 overflow-hidden my-2 bg-[#080809]">
      {/* Mandatory Safety Banner */}
      <div className="px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-[11px] font-sans flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>{AI_SUGGESTION_BANNER}</span>
        </div>
        {title && <span className="text-text-tertiary text-[10px] font-mono">{title}</span>}
      </div>

      {/* Code Header & Copy Button */}
      <div className="px-3 py-1.5 bg-surface-raised/40 border-b border-border/40 flex items-center justify-between text-[11px] font-mono text-text-tertiary">
        <span>{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2 text-[10px] gap-1 hover:text-text"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Code Body */}
      <pre className="p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed select-text">
        {code}
      </pre>
    </div>
  );
}
