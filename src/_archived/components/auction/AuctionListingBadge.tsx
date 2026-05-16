import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Gavel, Zap, Timer, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuctionListingBadgeProps {
  type: 'auction' | 'flash_deal';
  endTime: string;
  currentBid?: number;
  discountPct?: number;
  bidCount?: number;
  className?: string;
  compact?: boolean;
}

function useCountdown(endTime: string) {
  const calc = useCallback(() => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0, expired: true, total: 0 };
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      expired: false,
      total: diff,
    };
  }, [endTime]);

  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return t;
}

const AuctionListingBadge = ({
  type, endTime, currentBid, discountPct, bidCount, className, compact = false,
}: AuctionListingBadgeProps) => {
  const t = useCountdown(endTime);
  const isUrgent = t.total < 3600000 && !t.expired;
  const isEnding = t.total < 1800000 && !t.expired;

  if (t.expired) return null;

  const timeStr = `${String(t.h).padStart(2, '0')}:${String(t.m).padStart(2, '0')}:${String(t.s).padStart(2, '0')}`;

  if (type === 'auction') {
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        {/* Live Auction Badge */}
        <Badge className={cn(
          'gap-1 text-[10px] font-bold border-0 shadow-sm',
          isUrgent
            ? 'bg-destructive text-destructive-foreground animate-pulse'
            : 'bg-primary text-primary-foreground'
        )}>
          <Gavel className="h-3 w-3" />
          {isEnding ? '🔥 ENDING SOON' : 'LIVE AUCTION'}
        </Badge>

        {/* Countdown */}
        <div className={cn(
          'flex items-center gap-1 rounded-md px-1.5 py-0.5',
          isUrgent ? 'bg-destructive/10' : 'bg-muted/50'
        )}>
          <Timer className={cn('h-3 w-3', isUrgent ? 'text-destructive animate-pulse' : 'text-muted-foreground')} />
          <span className={cn('text-[10px] font-mono font-bold', isUrgent ? 'text-destructive' : 'text-foreground')}>
            {timeStr}
          </span>
        </div>

        {/* Bid count indicator */}
        {!compact && bidCount !== undefined && bidCount > 0 && (
          <Badge variant="outline" className="text-[9px] gap-0.5 border-chart-1/30 text-chart-1">
            <Flame className="h-2.5 w-2.5" /> {bidCount} bid{bidCount !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    );
  }

  // Flash Deal Badge
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <Badge className={cn(
        'gap-1 text-[10px] font-bold border-0 shadow-sm',
        isUrgent
          ? 'bg-destructive text-destructive-foreground animate-pulse'
          : 'bg-gradient-to-r from-destructive to-chart-1 text-destructive-foreground'
      )}>
        <Zap className="h-3 w-3" />
        {discountPct ? `-${discountPct}% FLASH` : 'FLASH DEAL'}
      </Badge>

      <div className={cn(
        'flex items-center gap-1 rounded-md px-1.5 py-0.5',
        isUrgent ? 'bg-destructive/10' : 'bg-muted/50'
      )}>
        <Timer className={cn('h-3 w-3', isUrgent ? 'text-destructive animate-pulse' : 'text-muted-foreground')} />
        <span className={cn('text-[10px] font-mono font-bold', isUrgent ? 'text-destructive' : 'text-foreground')}>
          {timeStr}
        </span>
      </div>
    </div>
  );
};

export default AuctionListingBadge;
