import { Skeleton } from '@/components/ui/skeleton';

export const SearchPanelSkeleton = () => {
  return (
    <div className="w-full space-y-3 p-4 animate-in fade-in duration-300">
      {/* Search Bar Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>

      {/* Quick Filters Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <div className="flex gap-1.5 overflow-x-auto">
          <Skeleton className="h-6 w-20 rounded-lg shrink-0" />
          <Skeleton className="h-6 w-24 rounded-lg shrink-0" />
          <Skeleton className="h-6 w-20 rounded-lg shrink-0" />
          <Skeleton className="h-6 w-16 rounded-lg shrink-0" />
          <Skeleton className="h-6 w-24 rounded-lg shrink-0" />
        </div>
      </div>

      {/* Filter Buttons Skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
};

export const SearchSuggestionsSkeleton = () => {
  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-background/95 backdrop-blur-md border-2 border-border/20 rounded-xl shadow-lg p-2 space-y-2 animate-in fade-in duration-200">
      <div className="space-y-1">
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-3/4 rounded-lg" />
      </div>
    </div>
  );
};

export const PropertyCardSkeleton = () => {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in duration-300">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
};
