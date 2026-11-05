import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function FindingsLoading() {
  return (
    <div className="max-w-[1200px] mx-auto w-full space-y-4 font-sans py-2">
      <div className="flex items-center justify-between pb-2">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-36 rounded" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      <div className="p-3 rounded-lg bg-surface border border-border flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-72 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden divide-y divide-border/60">
        <div className="p-3 bg-surface-raised/40 flex items-center justify-between">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-3.5 h-3.5 rounded" />
              <Skeleton className="w-14 h-5 rounded-full" />
              <div className="space-y-1.5 flex-1 max-w-md">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-20 h-5 rounded" />
              <Skeleton className="w-24 h-5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

