import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function RunsLoading() {
  return (
    <div className="space-y-4 font-sans w-full max-w-[1200px] mx-auto animate-pulse">
      <div className="space-y-2 border-b border-border pb-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="flex items-center gap-3 py-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-8 w-60 ml-auto" />
      </div>

      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-[8px]" />
        ))}
      </div>
    </div>
  );
}

