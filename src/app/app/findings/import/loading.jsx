import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

export default function ImportLoading() {
  return (
    <div className="max-w-[1000px] mx-auto w-full space-y-6 font-sans py-2">
      <div className="flex items-center justify-between pb-2">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64 rounded-md" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      <Skeleton className="h-12 w-full rounded-xl" />

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48 rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-56 rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
        </CardContent>
      </Card>
    </div>
  );
}

