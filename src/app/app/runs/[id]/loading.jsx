import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function RunDetailLoading() {
  return (
    <div className="space-y-6 font-sans w-full max-w-[1200px] mx-auto pb-12 animate-pulse">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-64" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      <Skeleton className="h-20 w-full rounded-[8px]" />

      <Skeleton className="h-64 w-full rounded-[8px]" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-48 rounded-[8px]" />
        <Skeleton className="h-48 rounded-[8px]" />
      </div>

      <Skeleton className="h-32 w-full rounded-[8px]" />

      <Skeleton className="h-72 w-full rounded-[8px]" />
    </div>
  );
}

