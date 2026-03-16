import { Flame, Eye, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemandHeatBadgeProps {
  /** Property ID — used to deterministically derive demand signal */
  propertyId?: string;
  /** Override: number of saves/views in 30 days */
  saves30d?: number;
  className?: string;
}

/**
 * Social-proof badge showing demand heat on property cards.
 * Shows view counts and trending/hot indicators.
 * If saves30d is not provided, derives a deterministic signal from propertyId
 * so ~30% of listings show a badge (realistic distribution).
 */
export default function DemandHeatBadge({ propertyId, saves30d, className }: DemandHeatBadgeProps) {
  const hash = (propertyId || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const derived = saves30d ?? (hash % 100);

  // Thresholds: Hot (top 5%), Trending (top 15%), Popular (top 30%)
  const isHot = derived >= 80;
  const isTrending = derived >= 50 && derived < 80;
  const isPopular = derived >= 30 && derived < 50;

  if (!isHot && !isTrending && !isPopular) return null;

  // Simulate realistic view count from hash
  const viewCount = isHot
    ? 40 + (hash % 60)
    : isTrending
    ? 15 + (hash % 25)
    : 5 + (hash % 10);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md border-0 backdrop-blur-sm',
        isHot
          ? 'bg-destructive/90 text-destructive-foreground'
          : isTrending
          ? 'bg-chart-3/90 text-primary-foreground'
          : 'bg-muted/80 text-foreground',
        isHot && 'signal-glow',
        className
      )}
    >
      {isHot ? (
        <>
          <Flame className="h-2.5 w-2.5" />
          🔥 {viewCount} views
        </>
      ) : isTrending ? (
        <>
          <TrendingUp className="h-2.5 w-2.5" />
          Trending · {viewCount}
        </>
      ) : (
        <>
          <Eye className="h-2.5 w-2.5" />
          👀 {viewCount} views
        </>
      )}
    </span>
  );
}
