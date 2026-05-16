import React, { useState } from 'react';
import { usePropertyMarketDashboard, CityMarket } from '@/hooks/usePropertyMarketDashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, TrendingDown, Flame, Snowflake, MapPin, Building2, Search, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const heatConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  very_hot: { label: 'Very Hot', color: 'bg-destructive text-destructive-foreground', icon: <Flame className="h-3.5 w-3.5" /> },
  hot: { label: 'Hot', color: 'bg-chart-1 text-white', icon: <Flame className="h-3.5 w-3.5" /> },
  warm: { label: 'Warm', color: 'bg-chart-4 text-white', icon: <TrendingUp className="h-3.5 w-3.5" /> },
  cool: { label: 'Cool', color: 'bg-muted text-muted-foreground', icon: <Snowflake className="h-3.5 w-3.5" /> },
};

const formatPrice = (v: number) => {
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `Rp ${(v / 1_000).toFixed(0)}K`;
  return `Rp ${v.toLocaleString()}`;
};

function MarketCard({ market }: { market: CityMarket }) {
  const heat = heatConfig[market.demand_heat_level] || heatConfig.cool;
  const isPositive = market.price_growth >= 0;

  return (
    <Card className="hover:shadow-lg transition-shadow border">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground text-lg">{market.city}</h3>
          </div>
          <Badge className={cn('gap-1 text-xs', heat.color)}>
            {heat.icon} {heat.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Avg Price / m²</p>
            <p className="text-base font-bold text-foreground">{formatPrice(market.avg_price_per_m2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Price Growth (YoY)</p>
            <p className={cn('text-base font-bold flex items-center gap-1', isPositive ? 'text-chart-2' : 'text-destructive')}>
              {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {isPositive ? '+' : ''}{market.price_growth.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Active Listings</p>
            <p className="text-base font-bold text-foreground">{market.total_listings.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">New (30d)</p>
            <p className="text-base font-bold text-foreground">{market.new_listings_30d}</p>
          </div>
        </div>

        {/* Mini heat bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Demand Heat</span>
            <span>{market.demand_heat_score}/100</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', 
                market.demand_heat_score >= 80 ? 'bg-destructive' :
                market.demand_heat_score >= 60 ? 'bg-chart-1' :
                market.demand_heat_score >= 40 ? 'bg-chart-4' : 'bg-muted-foreground'
              )}
              style={{ width: `${market.demand_heat_score}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PropertyMarketDashboard() {
  const { data, isLoading, error } = usePropertyMarketDashboard();
  const [search, setSearch] = useState('');
  const [heatFilter, setHeatFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('heat');

  const filtered = (data?.markets || [])
    .filter(m => m.city.toLowerCase().includes(search.toLowerCase()))
    .filter(m => heatFilter === 'all' || m.demand_heat_level === heatFilter)
    .sort((a, b) => {
      if (sortBy === 'heat') return b.demand_heat_score - a.demand_heat_score;
      if (sortBy === 'price') return b.avg_price_per_m2 - a.avg_price_per_m2;
      if (sortBy === 'growth') return b.price_growth - a.price_growth;
      if (sortBy === 'listings') return b.total_listings - a.total_listings;
      return 0;
    });

  const chartData = filtered.slice(0, 12).map(m => ({
    city: m.city.length > 10 ? m.city.slice(0, 10) + '…' : m.city,
    price: Math.round(m.avg_price_per_m2 / 1000),
    heat: m.demand_heat_score,
  }));

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md"><CardContent className="p-6 text-center text-destructive">Failed to load market data.</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-chart-2/5">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">ASTRA AI</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              Property Market
              <span className="block text-primary">Dashboard</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl">
              Real-time city-level market intelligence — average price per m², year-over-year growth, and demand heat scores powered by live listing data.
            </p>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </section>

      {/* Summary cards */}
      <section className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Markets', value: data?.total_cities?.toLocaleString() ?? '—', icon: <MapPin className="h-5 w-5 text-primary" /> },
            { label: 'Total Listings', value: data?.total_properties?.toLocaleString() ?? '—', icon: <Building2 className="h-5 w-5 text-chart-1" /> },
            { label: 'Hot Markets', value: data ? data.markets.filter(m => m.demand_heat_level === 'very_hot' || m.demand_heat_level === 'hot').length.toString() : '—', icon: <Flame className="h-5 w-5 text-destructive" /> },
            { label: 'Avg Growth', value: data ? `${(data.markets.reduce((s, m) => s + m.price_growth, 0) / (data.markets.length || 1)).toFixed(1)}%` : '—', icon: <TrendingUp className="h-5 w-5 text-chart-2" /> },
          ].map(c => (
            <Card key={c.label} className="bg-card border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">{c.icon}<span className="text-xs text-muted-foreground font-medium">{c.label}</span></div>
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Chart + filters */}
      <section className="container mx-auto px-4 py-8 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search city..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={heatFilter} onValueChange={setHeatFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Heat Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="very_hot">Very Hot</SelectItem>
              <SelectItem value="hot">Hot</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="cool">Cool</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-44"><ArrowUpDown className="h-3.5 w-3.5 mr-1" /><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="heat">Demand Heat</SelectItem>
              <SelectItem value="price">Price / m²</SelectItem>
              <SelectItem value="growth">Price Growth</SelectItem>
              <SelectItem value="listings">Listings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bar chart */}
        {!isLoading && chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Price per m² by City (K Rp)</CardTitle>
              <CardDescription>Top {chartData.length} cities by current filter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="city" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(v: number) => [`Rp ${v}K/m²`, 'Avg Price']}
                    />
                    <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.heat >= 80 ? 'hsl(var(--destructive))' : entry.heat >= 60 ? 'hsl(var(--chart-1))' : entry.heat >= 40 ? 'hsl(var(--chart-4))' : 'hsl(var(--muted-foreground))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3 p-5 rounded-lg border bg-card">
                <div className="h-5 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-2 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* City cards grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(market => (
              <MarketCard key={market.city} market={market} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground">No markets found matching your filters.</div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
