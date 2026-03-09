import React from 'react';
import { usePropertyMarketContext } from '@/hooks/useMarketIntelligence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, BarChart3, Home, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  hot: '🔥 Hot Market',
  emerging: '📈 Emerging',
  stable: '📊 Stable',
  cooling: '❄️ Cooling',
};
const statusStyles: Record<string, string> = {
  hot: 'border-destructive/40 text-destructive',
  emerging: 'border-chart-4/40 text-chart-4',
  stable: 'border-chart-1/40 text-chart-1',
  cooling: 'border-muted-foreground text-muted-foreground',
};

interface MarketContextCardProps {
  city: string | null;
  currentPrice?: number;
}

export default function MarketContextCard({ city, currentPrice }: MarketContextCardProps) {
  const { data, isLoading } = usePropertyMarketContext(city);

  if (!city || isLoading) return null;

  const trend = data?.priceTrend;
  const hotspot = data?.hotspot;
  const rental = data?.rentalInsight;
  const insight = data?.marketInsight;

  if (!trend && !hotspot && !insight) return null;

  const trendIcon = trend?.trend_direction === 'rising'
    ? <TrendingUp className="h-3.5 w-3.5 text-chart-1" />
    : trend?.trend_direction === 'cooling'
    ? <TrendingDown className="h-3.5 w-3.5 text-destructive" />
    : <Minus className="h-3.5 w-3.5 text-muted-foreground" />;

  const formatPrice = (v: number) => {
    if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}M`;
    return `Rp ${v.toLocaleString()}`;
  };

  const avgPrice = insight ? Number(insight.avg_price) : trend ? Number(trend.average_price) : 0;
  const pricePosition = currentPrice && avgPrice
    ? ((currentPrice - avgPrice) / avgPrice * 100).toFixed(0)
    : null;

  const marketStatus = insight?.market_status || (hotspot?.trend as string) || 'stable';

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Market Intelligence — {city}
          {insight && (
            <Badge variant="outline" className={cn("ml-auto text-[10px]", statusStyles[marketStatus] || '')}>
              {statusLabels[marketStatus] || marketStatus}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Average Price */}
          {avgPrice > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Avg Price</span>
              <p className="text-sm font-bold text-foreground">{formatPrice(avgPrice)}</p>
              <div className="flex items-center gap-1">
                {trendIcon}
                <span className="text-[10px] text-muted-foreground capitalize">{trend?.trend_direction || 'stable'}</span>
              </div>
            </div>
          )}

          {/* Price Position */}
          {pricePosition && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">vs Market</span>
              <p className={cn("text-sm font-bold", Number(pricePosition) > 0 ? "text-destructive" : "text-chart-1")}>
                {Number(pricePosition) > 0 ? '+' : ''}{pricePosition}%
              </p>
              <span className="text-[10px] text-muted-foreground">
                {Number(pricePosition) > 10 ? 'Above market' : Number(pricePosition) < -10 ? 'Below market' : 'At market'}
              </span>
            </div>
          )}

          {/* ROI */}
          {insight && Number(insight.avg_roi) > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Avg ROI</span>
              <p className="text-sm font-bold text-foreground">{Number(insight.avg_roi).toFixed(1)}%</p>
              <span className="text-[10px] text-muted-foreground">
                Growth: {Number(insight.market_growth_rate).toFixed(1)}%
              </span>
            </div>
          )}

          {/* Hotspot / Score */}
          {(hotspot || insight) && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {insight ? 'Inv. Score' : 'Hotspot'}
              </span>
              <p className="text-sm font-bold text-foreground">
                {insight ? Number(insight.avg_investment_score).toFixed(0) : Number(hotspot!.hotspot_score).toFixed(0)}/100
              </p>
              {rental && Number(rental.avg_rental_yield) > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  Yield: {Number(rental.avg_rental_yield).toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {(trend || insight) && (
          <div className="flex items-center gap-1.5 mt-3 text-[10px] text-muted-foreground">
            <Home className="h-3 w-3" />
            <span>{insight?.listing_volume || trend?.property_count || 0} active listings in {city}</span>
            {(insight?.avg_price_per_sqm || trend?.price_per_sqm) && (
              <span className="ml-auto">
                Avg {formatPrice(Number(insight?.avg_price_per_sqm || trend?.price_per_sqm))}/m²
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
