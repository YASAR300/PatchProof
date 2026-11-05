import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DependenciesLoading() {
  return (
    <div className="space-y-4 font-sans w-full max-w-[1200px] mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48 rounded" />
        <Skeleton className="h-4 w-96 rounded" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3 rounded-[6px] border border-border bg-surface space-y-2">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-6 w-12 rounded" />
          </div>
        ))}
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-2 flex-1">
          <Skeleton className="h-8 w-48 rounded" />
          <Skeleton className="h-8 w-32 rounded" />
          <Skeleton className="h-8 w-32 rounded" />
        </div>
        <Skeleton className="h-4 w-16 rounded" />
      </div>

      {/* Table Skeleton */}
      <div className="border border-border rounded-[6px] bg-surface overflow-hidden divide-y divide-border/60">
        <div className="h-9 bg-surface-raised/40" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 px-3.5 flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

