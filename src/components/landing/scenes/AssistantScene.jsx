"use client";

import React from "react";
import { Bot, Sparkles, FileCode, Check } from "lucide-react";

export function AssistantScene({ className = "" }) {
  return (
    <div
      className={`w-full min-h-[380px] rounded-[16px] border border-white/[0.1] bg-[#0b0b0c] text-slate-100 shadow-xl overflow-hidden font-sans select-none flex flex-col justify-between ${className}`}
    >
      <div className="h-11 px-5 bg-[#111113] border-b border-white/[0.08] flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-accent" />
          <span className="font-semibold text-white">AI Security Assistant</span>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-[#21180f] text-[#fbbf24] border border-[#3d2b17]">
          <Sparkles className="w-3 h-3" /> AI-Generated
        </span>
      </div>

      <div className="p-5 flex-1 space-y-4">
        {/* Assistant Explanation Box */}
        <div className="p-4 rounded-[10px] bg-[#141721] border border-white/[0.08] space-y-2">
          <p className="text-[14px] text-slate-200 leading-relaxed">
            I analyzed the SQL injection finding in <code className="font-mono text-accent">users.py:42</code>. The user-controlled <code className="font-mono text-white">id</code> parameter is formatted directly into an unsanitized raw string query without bind parameters.
          </p>
          <p className="text-[13px] text-slate-400">
            Below is a synthesized pytest reproducer script that asserts unauthorized database records are returned when given a standard exploit payload:
          </p>
        </div>

        {/* Synthesized reproducer code */}
        <div className="rounded-[8px] bg-[#0e1017] border border-white/[0.08] p-4 font-mono text-[12px] text-slate-300 leading-relaxed overflow-x-auto">
          <div className="text-slate-400"># Generated Pytest Reproducer (Human Review Required)</div>
          <div className="text-white">def test_sqli_find_user_exploit(client):</div>
          <div className="text-slate-300">    payload = &quot;' OR '1'='1&quot;</div>
          <div className="text-slate-300">    res = client.get(f&quot;/api/users?id={'{payload}'}&quot;)</div>
          <div className="text-[#f87171]">    # Vulnerable if arbitrary users are leaked</div>
          <div className="text-white">    assert res.status_code == 200</div>
          <div className="text-white">    assert len(res.json()[&quot;users&quot;]) &gt; 1</div>
        </div>
      </div>

      <div className="h-10 px-5 bg-[#111113] border-t border-white/[0.08] flex items-center justify-between text-[12px] font-mono text-slate-400">
        <span>Target: tests/reproducers/test_sqli_find_user.py</span>
        <span className="text-slate-300">Requires engineer approval</span>
      </div>
    </div>
  );
}

