import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, TrendingUp, Home, DollarSign, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LuxuryArea {
  area: string;
  avgPrice: number;
  topPrice: number;
  luxuryCount: number;
  totalCount: number;
  luxuryRatio: number;
  avgPricePerSqm: number;
}

export default function TopLuxuryAreas() {
  const { data: luxuryAreas = [], isLoading } = useQuery({
    queryKey: ['top-luxury-areas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('price, city, location, area_sqm, property_type')
        .eq('status', 'active')
        .not('price', 'is', null)
        .not('city', 'is', null)
        .gt('price', 0);

      if (error) throw error;

      // Calculate luxury threshold (top 20% by price)
      const allPrices = (data || []).map(p => p.price).sort((a, b) => a - b);
      const luxuryThreshold = allPrices.length > 0
        ? allPrices[Math.floor(allPrices.length * 0.8)]
        : 5_000_000_000;

      // Group by city
      const byCity: Record<string, { prices: number[]; pricePerSqm: number[] }> = {};
      for (const p of data || []) {
        const area = p.city || p.location;
        if (!area) continue;
        if (!byCity[area]) byCity[area] = { prices: [], pricePerSqm: [] };
        byCity[area].prices.push(p.price);
        if (p.area_sqm && p.area_sqm > 0) {
          byCity[area].pricePerSqm.push(p.price / p.area_sqm);
        }
      }

      const areas: LuxuryArea[] = Object.entries(byCity)
        .map(([area, { prices, pricePerSqm }]) => {
          const luxuryPrices = prices.filter(p => p >= luxuryThreshold);
          return {
            area,
            avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
            topPrice: Math.max(...prices),
            luxuryCount: luxuryPrices.length,
            totalCount: prices.length,
            luxuryRatio: Math.round((luxuryPrices.length / prices.length) * 100),
            avgPricePerSqm: pricePerSqm.length > 0
              ? Math.round(pricePerSqm.reduce((a, b) => a + b, 0) / pricePerSqm.length)
              : 0,
          };
        })
        .filter(a => a.luxuryCount >= 1)
        .sort((a, b) => b.luxuryRatio - a.luxuryRatio || b.avgPrice - a.avgPrice);

      return areas;
    },
    staleTime: 10 * 60 * 1000,
  });

  const formatPrice = (v: number) => {
    if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}M`;
    return `Rp ${v.toLocaleString()}`;
  };

  const getTierBadge = (idx: number) => {
    if (idx === 0) return { label: 'Diamond', icon: Gem, className: 'bg-primary/10 text-primary border-primary/30' };
    if (idx < 3) return { label: 'Platinum', icon: Crown, className: 'bg-chart-5/10 text-chart-5 border-chart-5/30' };
    if (idx < 6) return { label: 'Gold', icon: Crown, className: 'bg-chart-4/10 text-chart-4 border-chart-4/30' };
    return { label: 'Premium', icon: Home, className: 'bg-muted text-muted-foreground border-border' };
  };

  return (
    <div className="space-y-6">
      {/* Top 3 luxury areas spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {luxuryAreas.slice(0, 3).map((area, idx) => {
          const tier = getTierBadge(idx);
          const TierIcon = tier.icon;
          return (
            <Card key={area.area} className={cn(
              'relative overflow-hidden',
              idx === 0 && 'border-primary/40 shadow-lg md:col-span-1'
            )}>
              {idx === 0 && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-chart-4" />
              )}
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className={cn('gap-1 text-xs', tier.className)}>
                    <TierIcon className="h-3 w-3" />
                    {tier.label}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">#{idx + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">{area.area}</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avg Price</span>
                    <span className="font-semibold text-foreground">{formatPrice(area.avgPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Top Price</span>
                    <span className="font-semibold text-foreground">{formatPrice(area.topPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Luxury Ratio</span>
                    <span className="font-semibold text-primary">{area.luxuryRatio}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Properties</span>
                    <span className="text-foreground">{area.totalCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full luxury area ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="h-5 w-5 text-chart-4" /> Luxury Area Rankings
          </CardTitle>
          <CardDescription>
            Areas ranked by concentration of premium properties (top 20% price bracket)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse bg-muted rounded" />
              ))}
            </div>
          ) : luxuryAreas.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No luxury properties found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium">#</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium">Area</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Avg Price</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Top Price</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Luxury %</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Price/m²</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Listings</th>
                  </tr>
                </thead>
                <tbody>
                  {luxuryAreas.slice(0, 20).map((area, idx) => {
                    const tier = getTierBadge(idx);
                    return (
                      <tr key={area.area} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-2.5 px-2">
                          <span className="font-mono text-muted-foreground">{idx + 1}</span>
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{area.area}</span>
                            {idx < 3 && <tier.icon className="h-3.5 w-3.5 text-chart-4" />}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-right tabular-nums">{formatPrice(area.avgPrice)}</td>
                        <td className="py-2.5 px-2 text-right tabular-nums">{formatPrice(area.topPrice)}</td>
                        <td className="py-2.5 px-2 text-right">
                          <Badge variant={area.luxuryRatio > 50 ? 'default' : 'secondary'} className="text-xs tabular-nums">
                            {area.luxuryRatio}%
                          </Badge>
                        </td>
                        <td className="py-2.5 px-2 text-right tabular-nums">
                          {area.avgPricePerSqm > 0 ? `Rp ${(area.avgPricePerSqm / 1e6).toFixed(1)}M` : '—'}
                        </td>
                        <td className="py-2.5 px-2 text-right tabular-nums">{area.totalCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
