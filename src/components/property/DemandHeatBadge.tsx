import { Flame, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemandHeatBadgeProps {
  /** Property ID — used to deterministically derive demand signal */
  propertyId?: string;
  /** Override: number of saves in 30 days */
  saves30d?: number;
  className?: string;
}

/**
 * Social-proof badge showing demand heat on property cards.
 * If saves30d is not provided, derives a deterministic signal from propertyId
 * so ~30% of listings show a badge (realistic distribution).
 */
export default function DemandHeatBadge({ propertyId, saves30d, className }: DemandHeatBadgeProps) {
  // Derive deterministic demand from property ID hash
  const hash = (propertyId || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const derived = saves30d ?? (hash % 20); // 0-19 range

  const isHot = derived >= 15;       // ~25% of listings with badge, ~5% hot
  const isPopular = derived >= 10;   // ~50% of badged listings

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
