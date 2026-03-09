import React from 'react';
import { useLocationMarketInsights, useHotMarkets } from '@/hooks/useMarketIntelligence';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Flame, TrendingUp, MapPin, BarChart3, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  hot: 'bg-destructive/15 text-destructive border-destructive/30',
  emerging: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  stable: 'bg-chart-1/15 text-chart-1 border-chart-1/30',
  cooling: 'bg-muted text-muted-foreground border-border',
};

const statusLabels: Record<string, string> = {
  hot: '🔥 Hot Market',
  emerging: '📈 Emerging',
  stable: '📊 Stable',
  cooling: '❄️ Cooling',
};

const formatPrice = (v: number) => {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}M`;
  return `Rp ${v.toLocaleString()}`;
};

export default function MarketIntelligencePanel() {
  const { data: insights = [], isLoading } = useLocationMarketInsights(20);
  const { data: hotMarkets = [] } = useHotMarkets();

  if (isLoading) {
    return <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />)}</div>;
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No market intelligence data. Run <code className="text-xs bg-muted px-1.5 py-0.5 rounded">update_market_insights</code> job to generate.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartColors = ['hsl(var(--primary))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  // Prepare radar data for top 6 cities
  const radarData = insights.slice(0, 6).map((i: any) => ({
    city: i.city,
    Investment: Number(i.avg_investment_score) || 0,
    ROI: Math.min(100, (Number(i.avg_roi) || 0) * 8),
    Demand: i.demand_score || 0,
    Growth: Math.min(100, (Number(i.market_growth_rate) || 0) * 10),
    Yield: Math.min(100, (Number(i.avg_rental_yield) || 0) * 12),
  }));

  return (
    <div className="space-y-4">
      {/* Hot Markets Banner */}
      {hotMarkets.length > 0 && (
        <Card className="border-chart-4/30 bg-chart-4/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="h-4 w-4 text-chart-4" />
              Hot & Emerging Markets ({hotMarkets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {hotMarkets.map((m: any) => (
                <Badge key={m.id} variant="outline" className={cn("text-xs", statusColors[m.market_status] || '')}>
                  {m.city} — {statusLabels[m.market_status]}
                  {m.avg_roi > 0 && <span className="ml-1 opacity-70">{Number(m.avg_roi).toFixed(1)}% ROI</span>}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investment Score Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Investment Score by City
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={insights.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="city" width={90} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => `${v}/100`} />
              <Bar dataKey="avg_investment_score" name="Inv. Score" radius={[0, 4, 4, 0]}>
                {insights.slice(0, 10).map((_: any, i: number) => (
                  <Cell key={i} fill={chartColors[i % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Market Radar Chart */}
      {radarData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-chart-4" />
              Multi-Factor Market Comparison
            </CardTitle>
            <CardDescription className="text-xs">Top cities compared across 5 investment factors</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={[
                { factor: 'Investment', ...Object.fromEntries(radarData.map(r => [r.city, r.Investment])) },
                { factor: 'ROI', ...Object.fromEntries(radarData.map(r => [r.city, r.ROI])) },
                { factor: 'Demand', ...Object.fromEntries(radarData.map(r => [r.city, r.Demand])) },
                { factor: 'Growth', ...Object.fromEntries(radarData.map(r => [r.city, r.Growth])) },
                { factor: 'Yield', ...Object.fromEntries(radarData.map(r => [r.city, r.Yield])) },
              ]}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fontSize: 8 }} domain={[0, 100]} />
                {radarData.slice(0, 3).map((r, i) => (
                  <Radar key={r.city} name={r.city} dataKey={r.city}
                    stroke={chartColors[i]} fill={chartColors[i]} fillOpacity={0.15} strokeWidth={2} />
                ))}
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Full Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-chart-5" />
            All Market Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-1.5 text-muted-foreground font-medium">#</th>
                  <th className="text-left py-2 px-1.5 text-muted-foreground font-medium">City</th>
                  <th className="text-left py-2 px-1.5 text-muted-foreground font-medium">Status</th>
                  <th className="text-right py-2 px-1.5 text-muted-foreground font-medium">Avg Price</th>
                  <th className="text-right py-2 px-1.5 text-muted-foreground font-medium">ROI</th>
                  <th className="text-right py-2 px-1.5 text-muted-foreground font-medium">Yield</th>
                  <th className="text-right py-2 px-1.5 text-muted-foreground font-medium">Score</th>
                  <th className="text-right py-2 px-1.5 text-muted-foreground font-medium">Demand</th>
                  <th className="text-right py-2 px-1.5 text-muted-foreground font-medium">Listings</th>
                </tr>
              </thead>
              <tbody>
                {insights.map((m: any, idx: number) => (
                  <tr key={m.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-2 px-1.5 font-mono text-muted-foreground">{idx + 1}</td>
                    <td className="py-2 px-1.5 font-medium text-foreground">{m.city}</td>
                    <td className="py-2 px-1.5">
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", statusColors[m.market_status] || '')}>
                        {statusLabels[m.market_status] || m.market_status}
                      </Badge>
                    </td>
                    <td className="py-2 px-1.5 text-right tabular-nums">{formatPrice(Number(m.avg_price))}</td>
                    <td className="py-2 px-1.5 text-right tabular-nums">{Number(m.avg_roi).toFixed(1)}%</td>
                    <td className="py-2 px-1.5 text-right tabular-nums">{Number(m.avg_rental_yield).toFixed(1)}%</td>
                    <td className="py-2 px-1.5 text-right tabular-nums font-semibold">{Number(m.avg_investment_score).toFixed(0)}</td>
                    <td className="py-2 px-1.5 text-right tabular-nums">{m.demand_score}/100</td>
                    <td className="py-2 px-1.5 text-right tabular-nums">{m.listing_volume}</td>
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
