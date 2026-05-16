import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePriceDropDeals, ALERT_TIER_CONFIG, type AlertTier } from '@/hooks/usePriceDropAlerts';
import { TrendingDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

function formatPrice(v: number) {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

export default memo(function PriceDropAlertsFeed() {
  const { data: deals, isLoading } = usePriceDropDeals({ limit: 8 });
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="bg-card/80 backdrop-blur border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-emerald-500" /> Price Drop Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  if (!deals?.length) {
    return (
      <Card className="bg-card/80 backdrop-blur border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-emerald-500" /> Price Drop Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground text-center py-4">
            No price drops detected. Monitoring market prices.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-emerald-500" /> Price Drop Alerts
          </span>
          <button
            onClick={() => navigate('/price-drop-deals')}
            className="flex items-center gap-1 text-[10px] text-primary hover:underline"
          >
            View all <ArrowRight className="h-3 w-3" />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-80 overflow-y-auto">
        {deals.map(deal => {
          const tier = ALERT_TIER_CONFIG[deal.alert_tier as AlertTier] || ALERT_TIER_CONFIG.minor;
          return (
            <div
              key={`${deal.property_id}-${deal.changed_at}`}
              onClick={() => navigate(`/properties/${deal.property_id}`)}
              className={cn(
                'rounded-lg border px-3 py-2.5 cursor-pointer transition-all hover:scale-[1.01]',
                tier.bg,
                tier.glow
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-tight truncate">
                    {tier.emoji} {deal.property_title || 'Untitled Property'}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Price reduced {deal.drop_percentage.toFixed(1)}% — potential high ROI opportunity detected.
                  </p>
                </div>
                <Badge variant="outline" className={cn('text-[9px] h-5 shrink-0', tier.color)}>
                  -{deal.drop_percentage.toFixed(0)}%
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {deal.city && <Badge variant="outline" className="text-[9px] h-4">{deal.city}</Badge>}
                <span className="text-[9px] text-muted-foreground line-through">
                  {formatPrice(deal.old_price)}
                </span>
                <span className="text-[9px] font-semibold text-emerald-500">
                  {formatPrice(deal.new_price)}
                </span>
                {deal.opportunity_score >= 65 && (
                  <Badge variant="secondary" className="text-[9px] h-4">
                    Score: {deal.opportunity_score}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
});
