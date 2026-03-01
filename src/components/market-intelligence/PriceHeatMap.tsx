import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface AreaData {
  area: string;
  avgPrice: number;
  count: number;
  avgPricePerSqm: number;
}

export default function PriceHeatMap() {
  const [metric, setMetric] = useState<'avgPrice' | 'avgPricePerSqm' | 'count'>('avgPrice');

  const { data: areaData = [], isLoading } = useQuery({
    queryKey: ['price-heatmap-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('price, location, city, state, area_sqm')
        .eq('status', 'active')
        .not('price', 'is', null)
        .gt('price', 0);

      if (error) throw error;

      // Group by location/city
      const byArea: Record<string, { prices: number[]; pricePerSqm: number[] }> = {};
      for (const p of data || []) {
        const area = p.city || p.location || p.state || 'Unknown';
        if (!byArea[area]) byArea[area] = { prices: [], pricePerSqm: [] };
        byArea[area].prices.push(p.price);
        if (p.area_sqm && p.area_sqm > 0) {
          byArea[area].pricePerSqm.push(p.price / p.area_sqm);
        }
      }

      return Object.entries(byArea)
        .map(([area, { prices, pricePerSqm }]) => ({
          area,
          avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
          count: prices.length,
          avgPricePerSqm: pricePerSqm.length > 0
            ? Math.round(pricePerSqm.reduce((a, b) => a + b, 0) / pricePerSqm.length)
            : 0,
        }))
        .filter(a => a.count >= 1)
        .sort((a, b) => b[metric] - a[metric]);
    },
    staleTime: 5 * 60 * 1000,
  });

  const maxValue = useMemo(() => {
    if (areaData.length === 0) return 1;
    return Math.max(...areaData.map(a => a[metric]));
  }, [areaData, metric]);

  const getHeatColor = (value: number) => {
    const ratio = value / maxValue;
    if (ratio > 0.8) return 'bg-destructive/90 text-destructive-foreground';
    if (ratio > 0.6) return 'bg-chart-4/80 text-foreground';
    if (ratio > 0.4) return 'bg-chart-4/50 text-foreground';
    if (ratio > 0.2) return 'bg-chart-1/40 text-foreground';
    return 'bg-chart-1/20 text-foreground';
  };

  const formatValue = (area: AreaData) => {
    const val = area[metric];
    if (metric === 'count') return val.toString();
    if (val >= 1e9) return `Rp ${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `Rp ${(val / 1e6).toFixed(0)}M`;
    return `Rp ${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Price Heat Map</CardTitle>
              <CardDescription>Market intensity by area — darker = higher value</CardDescription>
            </div>
            <Select value={metric} onValueChange={(v) => setMetric(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="avgPrice">Average Price</SelectItem>
                <SelectItem value="avgPricePerSqm">Price per m²</SelectItem>
                <SelectItem value="count">Listing Count</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 animate-pulse bg-muted rounded" />
          ) : areaData.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No data available</p>
          ) : (
            <>
              {/* Grid heat map */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {areaData.slice(0, 20).map((area) => (
                  <div
                    key={area.area}
                    className={cn(
                      'rounded-lg p-3 transition-all hover:scale-105 cursor-default',
                      getHeatColor(area[metric])
                    )}
                  >
                    <p className="text-xs font-bold truncate">{area.area}</p>
                    <p className="text-sm font-semibold mt-1">{formatValue(area)}</p>
                    <p className="text-[10px] opacity-70">{area.count} listings</p>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-2 mt-6">
                <span className="text-xs text-muted-foreground">Low</span>
                <div className="flex gap-0.5">
                  <div className="w-8 h-3 rounded-sm bg-chart-1/20" />
                  <div className="w-8 h-3 rounded-sm bg-chart-1/40" />
                  <div className="w-8 h-3 rounded-sm bg-chart-4/50" />
                  <div className="w-8 h-3 rounded-sm bg-chart-4/80" />
                  <div className="w-8 h-3 rounded-sm bg-destructive/90" />
                </div>
                <span className="text-xs text-muted-foreground">High</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Ranking table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Area Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">#</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Area</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Avg Price</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Price/m²</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Listings</th>
                </tr>
              </thead>
              <tbody>
                {areaData.slice(0, 15).map((area, idx) => (
                  <tr key={area.area} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-2.5 px-2 font-mono text-muted-foreground">{idx + 1}</td>
                    <td className="py-2.5 px-2 font-medium text-foreground">{area.area}</td>
                    <td className="py-2.5 px-2 text-right tabular-nums">
                      {area.avgPrice >= 1e9 ? `Rp ${(area.avgPrice / 1e9).toFixed(1)}B` : `Rp ${(area.avgPrice / 1e6).toFixed(0)}M`}
                    </td>
                    <td className="py-2.5 px-2 text-right tabular-nums">
                      {area.avgPricePerSqm > 0 ? `Rp ${(area.avgPricePerSqm / 1e6).toFixed(1)}M` : '—'}
                    </td>
                    <td className="py-2.5 px-2 text-right tabular-nums">{area.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
