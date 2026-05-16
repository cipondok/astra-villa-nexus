import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Shield, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Bid {
  id: string;
  bidder_id: string;
  bid_amount: number;
  created_at: string;
}

interface AnonymizedBidHistoryProps {
  bids: Bid[];
  currentUserId?: string;
  startingPrice: number;
}

function anonymizeBidder(bidderId: string, index: number, isCurrentUser: boolean): string {
  if (isCurrentUser) return 'You';
  const hash = bidderId.slice(-4).toUpperCase();
  return `Investor #${hash}`;
}

function getBidStrength(bidAmount: number, startingPrice: number): { label: string; color: string } {
  const ratio = bidAmount / startingPrice;
  if (ratio >= 1.5) return { label: 'Aggressive', color: 'text-destructive' };
  if (ratio >= 1.2) return { label: 'Strong', color: 'text-chart-1' };
  if (ratio >= 1.05) return { label: 'Competitive', color: 'text-chart-2' };
  return { label: 'Opening', color: 'text-muted-foreground' };
}

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const AnonymizedBidHistory = ({ bids, currentUserId, startingPrice }: AnonymizedBidHistoryProps) => {
  if (bids.length === 0) {
    return (
      <div className="text-center py-6">
        <Users className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
        <p className="text-xs text-muted-foreground">No bids yet — be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
      {/* Summary header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] text-muted-foreground">Identities anonymized for fair bidding</span>
        </div>
        <Badge variant="outline" className="text-[9px]">{bids.length} bid{bids.length !== 1 ? 's' : ''}</Badge>
      </div>

      {bids.map((bid, i) => {
        const isCurrentUser = bid.bidder_id === currentUserId;
        const isHighest = i === 0;
        const strength = getBidStrength(bid.bid_amount, startingPrice);
        const prevBid = bids[i + 1]?.bid_amount || startingPrice;
        const increment = bid.bid_amount - prevBid;

        return (
          <div
            key={bid.id}
            className={cn(
              'flex items-center justify-between p-2.5 rounded-lg transition-colors',
              isHighest ? 'bg-chart-1/10 border border-chart-1/20' :
              isCurrentUser ? 'bg-primary/5 border border-primary/20' :
              'bg-muted/30 border border-border/20'
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isHighest && <Trophy className="h-4 w-4 text-chart-3 flex-shrink-0" />}
              {!isHighest && <div className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">#{i + 1}</div>}
              <div className="min-w-0">
                <p className={cn('text-xs font-medium truncate', isCurrentUser && 'text-primary')}>
                  {anonymizeBidder(bid.bidder_id, i, isCurrentUser)}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn('text-[9px] font-medium', strength.color)}>{strength.label}</span>
                  {increment > 0 && (
                    <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                      <TrendingUp className="h-2.5 w-2.5" />
                      +{new Intl.NumberFormat('id-ID').format(increment)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className={cn('text-sm font-bold', isHighest ? 'text-chart-1' : 'text-foreground')}>
                {formatIDR(bid.bid_amount)}
              </p>
              <p className="text-[9px] text-muted-foreground">
                {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnonymizedBidHistory;
