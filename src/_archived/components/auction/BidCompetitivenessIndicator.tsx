import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Shield, Zap, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BidCompetitivenessIndicatorProps {
  proposedBid: number;
  currentBid: number;
  startingPrice: number;
  minimumIncrement: number;
  totalBids: number;
}

const BidCompetitivenessIndicator = ({
  proposedBid, currentBid, startingPrice, minimumIncrement, totalBids,
}: BidCompetitivenessIndicatorProps) => {
  const minBid = currentBid + minimumIncrement;
  const bidAboveMin = proposedBid - minBid;
  const ratio = proposedBid / startingPrice;

  let level: { label: string; color: string; icon: typeof Zap; pct: number; tip: string };

  if (proposedBid < minBid) {
    level = { label: 'Below Minimum', color: 'text-destructive', icon: Shield, pct: 10, tip: `Minimum bid is Rp ${minBid.toLocaleString('id-ID')}` };
  } else if (bidAboveMin < minimumIncrement) {
    level = { label: 'Minimum Bid', color: 'text-muted-foreground', icon: Target, pct: 30, tip: 'Meets minimum — may be outbid quickly' };
  } else if (ratio < 1.15) {
    level = { label: 'Competitive', color: 'text-chart-2', icon: TrendingUp, pct: 55, tip: 'Good positioning in the bidding range' };
  } else if (ratio < 1.3) {
    level = { label: 'Strong Bid', color: 'text-chart-1', icon: TrendingUp, pct: 75, tip: 'Strong competitive advantage' };
  } else {
    level = { label: 'Dominant', color: 'text-chart-3', icon: Zap, pct: 95, tip: 'Significantly above competition' };
  }

  return (
    <div className="rounded-lg border border-border/30 bg-muted/20 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <level.icon className={cn('h-3.5 w-3.5', level.color)} />
          <span className={cn('text-xs font-semibold', level.color)}>{level.label}</span>
        </div>
        <Badge variant="outline" className="text-[9px]">
          {totalBids} competing bid{totalBids !== 1 ? 's' : ''}
        </Badge>
      </div>
      <Progress value={level.pct} className="h-1.5" />
      <p className="text-[10px] text-muted-foreground">{level.tip}</p>
    </div>
  );
};

export default BidCompetitivenessIndicator;
