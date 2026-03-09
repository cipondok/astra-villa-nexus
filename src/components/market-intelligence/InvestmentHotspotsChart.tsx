import React from 'react';
import { useInvestmentHotspots, useLocationPriceTrends, useRentalMarketInsights } from '@/hooks/useMarketIntelligence';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import { Flame, TrendingUp, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InvestmentHotspotsChart() {
  const { data: hotspots = [], isLoading: loadingHotspots } = useInvestmentHotspots(15);
  const { data: trends = [], isLoading: loadingTrends } = useLocationPriceTrends(15);
  const { data: rental = [], isLoading: loadingRental } = useRentalMarketInsights(15);

  const isLoading = loadingHotspots || loadingTrends || loadingRental;

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />)}</div>;
  }

  const noData = hotspots.length === 0 && trends.length === 0 && rental.length === 0;
  if (noData) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">No market intelligence data yet. Run the AI jobs to generate insights.</p>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (v: number) => {
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(0)}M`;
    return v.toLocaleString();
  };

  const hotspotColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="space-y-6">
      {/* Hotspot Rankings */}
      {hotspots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-chart-4" />
              Investment Hotspot Rankings
            </CardTitle>
            <CardDescription>Cities ranked by composite investment potential</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hotspots.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="city" width={100} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `${v.toFixed(0)}/100`} />
                <Bar dataKey="hotspot_score" name="Hotspot Score" radius={[0, 4, 4, 0]}>
                  {hotspots.slice(0, 10).map((_: any, i: number) => (
                    <Cell key={i} fill={hotspotColors[i % hotspotColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Hotspot cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-4">
              {hotspots.slice(0, 10).map((h: any) => (
                <div key={h.id} className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-bold truncate text-foreground">{h.city}</p>
                  <p className="text-lg font-bold text-primary">{Number(h.hotspot_score).toFixed(0)}</p>
                  <Badge variant="outline" className={cn(
                    "text-[10px]",
                    h.trend === 'rising' ? 'border-chart-1 text-chart-1' :
                    h.trend === 'cooling' ? 'border-destructive text-destructive' :
                    'border-muted-foreground text-muted-foreground'
                  )}>
                    {h.trend}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Trends by City */}
      {trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Average Price by City
            </CardTitle>
            <CardDescription>Average property prices across top markets</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trends.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="city" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${formatPrice(v)}`} />
                <Tooltip formatter={(v: number) => `Rp ${formatPrice(v)}`} />
                <Bar dataKey="average_price" name="Avg Price" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Rental Yield Distribution */}
      {rental.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-chart-1" />
              Rental Yield & Demand
            </CardTitle>
            <CardDescription>Rental yield percentage and demand scores by city</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium">#</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium">City</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Avg Yield</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Demand</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Occupancy</th>
                    <th className="text-right py-2 px-2 text-muted-foreground font-medium">Rentals</th>
                  </tr>
                </thead>
                <tbody>
                  {rental.slice(0, 15).map((r: any, idx: number) => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-2.5 px-2 font-mono text-muted-foreground">{idx + 1}</td>
                      <td className="py-2.5 px-2 font-medium text-foreground">{r.city}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums font-semibold">
                        <span className={cn(Number(r.avg_rental_yield) >= 6 ? 'text-chart-1' : 'text-foreground')}>
                          {Number(r.avg_rental_yield).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums">{r.demand_score}/100</td>
                      <td className="py-2.5 px-2 text-right tabular-nums">{Number(r.occupancy_prediction).toFixed(0)}%</td>
                      <td className="py-2.5 px-2 text-right tabular-nums">{r.rental_property_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
