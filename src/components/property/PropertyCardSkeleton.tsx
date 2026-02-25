import { cn } from "@/lib/utils";

interface PropertyCardSkeletonProps {
  count?: number;
  className?: string;
}

const Shimmer = ({ className }: { className?: string }) => (
  <div className={cn("relative overflow-hidden rounded-md bg-muted", className)}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gold-primary/15 to-transparent" />
  </div>
);

const PropertyCardSkeletonItem = () => (
  <div className="rounded-xl border border-border bg-card overflow-hidden">
    {/* Image skeleton */}
    <div className="relative aspect-[4/3] overflow-hidden">
      <Shimmer className="w-full h-full rounded-none" />
      {/* Badge placeholders */}
      <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between">
        <Shimmer className="h-5 w-14 rounded-md" />
        <Shimmer className="h-5 w-16 rounded-full" />
      </div>
    </div>

    {/* Content skeleton */}
    <div className="p-2.5 space-y-2">
      {/* Price */}
      <div className="rounded-lg border border-border/30 px-2.5 py-2">
        <div className="flex items-baseline gap-1.5">
          <Shimmer className="h-5 w-20" />
          <Shimmer className="h-3.5 w-10" />
        </div>
      </div>

      {/* Title */}
      <Shimmer className="h-3.5 w-full" />

      {/* Location */}
      <div className="flex items-center gap-1">
        <Shimmer className="h-3 w-3 rounded-full flex-shrink-0" />
        <Shimmer className="h-3 w-3/4" />
      </div>

      {/* Specs */}
      <div className="flex items-center gap-2 pt-1.5 border-t border-border/30">
        <Shimmer className="h-3.5 w-10" />
        <Shimmer className="h-3.5 w-10" />
        <Shimmer className="h-3.5 w-14" />
      </div>
    </div>
  </div>
);

const PropertyCardSkeleton = ({ count = 12, className }: PropertyCardSkeletonProps) => (
  <div className={cn(
    "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5 sm:gap-3",
    className
  )}>
    {[...Array(count)].map((_, i) => (
      <PropertyCardSkeletonItem key={i} />
    ))}
  </div>
);

export default PropertyCardSkeleton;
