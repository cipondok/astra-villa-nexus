import React from 'react';
import { usePropertyMarketContext } from '@/hooks/useMarketIntelligence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, MapPin, BarChart3, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketContextCardProps {
  city: string | null;
  currentPrice?: number;
}

export default function MarketContextCard({ city, currentPrice }: MarketContextCardProps) {
  const { data, isLoading } = usePropertyMarketContext(city);

  if (!city || isLoading) return null;
  if (!data?.priceTrend && !data?.hotspot) return null;

  const trend = data.priceTrend;
  const hotspot = data.hotspot;
  const rental = data.rentalInsight;

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

  const pricePosition = currentPrice && trend?.average_price
    ? ((currentPrice - trend.average_price) / trend.average_price * 100).toFixed(0)
    : null;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Market Intelligence — {city}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Average Price */}
          {trend && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Avg Price</span>
              <p className="text-sm font-bold text-foreground">{formatPrice(Number(trend.average_price))}</p>
              <div className="flex items-center gap-1">
                {trendIcon}
                <span className="text-[10px] text-muted-foreground capitalize">{trend.trend_direction}</span>
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

          {/* Hotspot Score */}
          {hotspot && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Hotspot Score</span>
              <p className="text-sm font-bold text-foreground">{Number(hotspot.hotspot_score).toFixed(0)}/100</p>
              <Badge variant="outline" className={cn(
                "text-[10px] px-1.5 py-0",
                Number(hotspot.hotspot_score) >= 70 ? "border-chart-1 text-chart-1" :
                Number(hotspot.hotspot_score) >= 40 ? "border-chart-4 text-chart-4" :
                "border-muted-foreground text-muted-foreground"
              )}>
                {hotspot.trend}
              </Badge>
            </div>
          )}

          {/* Rental Yield */}
          {rental && Number(rental.avg_rental_yield) > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Avg Yield</span>
              <p className="text-sm font-bold text-foreground">{Number(rental.avg_rental_yield).toFixed(1)}%</p>
              <span className="text-[10px] text-muted-foreground">
                Demand: {rental.demand_score}/100
              </span>
            </div>
          )}
        </div>

        {/* Listings in area */}
        {trend && (
          <div className="flex items-center gap-1.5 mt-3 text-[10px] text-muted-foreground">
            <Home className="h-3 w-3" />
            <span>{trend.property_count} active listings in {city}</span>
            {trend.price_per_sqm && Number(trend.price_per_sqm) > 0 && (
              <span className="ml-auto">Avg {formatPrice(Number(trend.price_per_sqm))}/m²</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
