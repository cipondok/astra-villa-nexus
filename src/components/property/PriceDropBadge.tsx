import { TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceDropBadgeProps {
  /** Percentage price drop (positive number, e.g. 8 means 8% drop) */
  dropPercent: number;
  className?: string;
}

/**
 * Visual alert badge for property cards showing recent price reductions.
 * Appears as a bright pill overlay on the card image.
 */
export default function PriceDropBadge({ dropPercent, className }: PriceDropBadgeProps) {
  if (!dropPercent || dropPercent < 1) return null;

  const formatted = dropPercent >= 10 ? Math.round(dropPercent) : dropPercent.toFixed(1);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5",
        "bg-chart-1/90 text-primary-foreground",
        "text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md",
        "animate-in fade-in zoom-in-95 duration-300",
        className
      )}
    >
      <TrendingDown className="h-2.5 w-2.5" />
      -{formatted}%
    </span>
  );
}
