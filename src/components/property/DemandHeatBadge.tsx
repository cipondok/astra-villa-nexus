import { Flame, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemandHeatBadgeProps {
  /** Number of saves in the last 30 days */
  saves30d?: number;
  /** Number of views in the last 7 days */
  views7d?: number;
  className?: string;
}

/**
 * Social-proof badge showing demand heat on property cards.
 * Renders "Popular" or "Hot" based on engagement thresholds.
 */
export default function DemandHeatBadge({ saves30d = 0, views7d = 0, className }: DemandHeatBadgeProps) {
  const isHot = saves30d >= 10 || views7d >= 50;
  const isPopular = saves30d >= 5 || views7d >= 25;

  if (!isHot && !isPopular) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md border-0",
        isHot
          ? "bg-chart-3/90 text-primary-foreground"
          : "bg-chart-4/80 text-primary-foreground",
        className
      )}
    >
      {isHot ? (
        <>
          <Flame className="h-2.5 w-2.5" />
          Hot
        </>
      ) : (
        <>
          <Eye className="h-2.5 w-2.5" />
          Popular
        </>
      )}
    </span>
  );
}
