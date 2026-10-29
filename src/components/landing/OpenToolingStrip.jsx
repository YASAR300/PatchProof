import React from "react";

export function OpenToolingStrip() {
  const tools = ["Semgrep", "OSV", "GitHub", "Git"];

  return (
    <section className="border-y border-black/[0.08] bg-[#fbfbfd] py-10 sm:py-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <p className="text-2xs sm:text-xs font-mono uppercase tracking-widest text-[#86868b]">
          Built on open tooling
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-14 md:gap-20">
          {tools.map((tool) => (
            <div
              key={tool}
              className="text-lg sm:text-2xl font-medium tracking-tight text-[#1d1d1f]/75 hover:text-[#1d1d1f] transition-colors"
            >
              {tool}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
