import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

export default function SettingsLoading() {
  return (
    <div className="space-y-4 max-w-[1200px] mx-auto w-full font-sans">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
        {/* Sub-nav sidebar skeleton */}
        <div className="md:col-span-1 space-y-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>

        {/* Content area skeleton */}
        <div className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-3.5 w-72" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full max-w-md rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full max-w-md rounded" />
              </div>
              <Skeleton className="h-9 w-28 rounded mt-4" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
