import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

export default function OverviewLoading() {
  return (
    <div className="max-w-[1200px] mx-auto w-full space-y-6 font-sans animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-surface-raised rounded" />
          <div className="h-3 w-80 bg-surface rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-surface-raised rounded" />
          <div className="h-8 w-28 bg-surface-raised rounded" />
        </div>
      </div>

      {/* KPI Row Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-3.5 rounded-[6px] border border-border bg-surface space-y-2">
            <div className="h-3 w-20 bg-surface-raised rounded" />
            <div className="h-7 w-12 bg-surface-raised rounded" />
            <div className="h-2.5 w-24 bg-surface-raised/60 rounded" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-4 w-40 bg-surface-raised rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-28 w-full bg-surface-raised/40 rounded" />
        </CardContent>
      </Card>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 space-y-5">
          <Card>
            <CardHeader>
              <div className="h-4 w-36 bg-surface-raised rounded" />
            </CardHeader>
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 w-full bg-surface-raised/50 rounded" />
              ))}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-5 space-y-5">
          <Card>
            <CardHeader>
              <div className="h-4 w-36 bg-surface-raised rounded" />
            </CardHeader>
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 w-full bg-surface-raised/50 rounded" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

