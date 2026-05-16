import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ZoneSkeletonProps {
  /** Number of card placeholders to show */
  cards?: number;
  /** Zone label */
  label?: string;
}

/**
 * Skeleton placeholder for an AI intelligence zone in the right sidebar.
 * Shows a zone header line + N card-shaped skeletons.
 */
const ZoneSkeleton = React.memo(function ZoneSkeleton({ cards = 3, label }: ZoneSkeletonProps) {
  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center gap-2 px-1">
          <div className="h-px flex-1 bg-gradient-to-r from-muted/40 to-transparent" />
          <Skeleton className="h-3 w-24" />
        </div>
      )}
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border/30 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-8 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
});

export default ZoneSkeleton;
