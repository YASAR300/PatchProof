"use client";

import React, { useState } from "react";

export function RunsSparklineChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-28 flex items-center justify-center text-xs text-text-tertiary font-mono">
        No verification runs recorded in the last 14 days.
      </div>
    );
  }

  const counts = data.map((d) => d.count);
  const maxCount = Math.max(...counts, 4); // minimum ceiling for aesthetics
  const totalRuns = counts.reduce((acc, c) => acc + c, 0);

  const height = 100;
  const barWidth = 24;
  const gap = 16;
  const chartWidth = data.length * (barWidth + gap);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-text-secondary text-[11px]">
          Runs per day (last 14 days): <strong className="text-text font-semibold">{totalRuns} total</strong>
        </span>
        {hoveredIdx !== null ? (
          <span className="text-accent text-[11px] font-semibold animate-in fade-in duration-150">
            {data[hoveredIdx].label}: {data[hoveredIdx].count} run{data[hoveredIdx].count === 1 ? "" : "s"}
          </span>
        ) : (
          <span className="text-[11px] text-text-tertiary">Hover over a bar for details</span>
        )}
      </div>

      <div className="w-full overflow-x-auto pb-1">
        <svg
          viewBox={`0 0 ${chartWidth} ${height + 24}`}
          className="w-full h-28 overflow-visible select-none font-mono"
        >
          {/* Subtle grid lines */}
          <line
            x1="0"
            y1={height * 0.25}
            x2={chartWidth}
            y2={height * 0.25}
            stroke="#27272a"
            strokeDasharray="2 4"
            strokeWidth="0.8"
          />
          <line
            x1="0"
            y1={height * 0.75}
            x2={chartWidth}
            y2={height * 0.75}
            stroke="#27272a"
            strokeDasharray="2 4"
            strokeWidth="0.8"
          />
          <line
            x1="0"
            y1={height}
            x2={chartWidth}
            y2={height}
            stroke="#3f3f46"
            strokeWidth="1"
          />

          {data.map((item, idx) => {
            const x = idx * (barWidth + gap) + gap / 2;
            const barHeight = Math.max(
              item.count > 0 ? (item.count / maxCount) * (height - 8) : 3,
              3
            );
            const y = height - barHeight;
            const isHovered = hoveredIdx === idx;
            const hasRuns = item.count > 0;

            return (
              <g
                key={item.key || idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-opacity"
              >
                {/* Hit area */}
                <rect
                  x={x - gap / 4}
                  y="0"
                  width={barWidth + gap / 2}
                  height={height + 24}
                  fill="transparent"
                />

                {/* SVG Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="3"
                  className={`transition-all duration-200 ${
                    isHovered
                      ? "fill-indigo-400 opacity-100"
                      : hasRuns
                      ? "fill-indigo-500 opacity-80 hover:opacity-100"
                      : "fill-zinc-800 opacity-40 hover:opacity-70"
                  }`}
                />

                {/* Optional bar top count for active bars */}
                {hasRuns && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 4}
                    textAnchor="middle"
                    fill={isHovered ? "#ffffff" : "#a1a1aa"}
                    fontSize="9"
                    fontWeight={isHovered ? "bold" : "normal"}
                  >
                    {item.count}
                  </text>
                )}

                {/* X-axis date label */}
                <text
                  x={x + barWidth / 2}
                  y={height + 16}
                  textAnchor="middle"
                  fill={isHovered ? "#e4e4e7" : "#71717a"}
                  fontSize="8.5"
                  fontWeight={isHovered ? "600" : "400"}
                >
                  {item.label.split(" ")[1] || item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

