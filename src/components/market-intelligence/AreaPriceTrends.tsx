import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AreaPriceTrends() {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [propertyType, setPropertyType] = useState<string>('all');

  const { data: cities = [] } = useQuery({
    queryKey: ['market-cities'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('city')
        .eq('status', 'active')
        .not('city', 'is', null);
      const unique = [...new Set((data || []).map(d => d.city).filter(Boolean))];
      return unique.sort() as string[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: trendData = [], isLoading } = useQuery({
    queryKey: ['area-price-trends', selectedCity, propertyType],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('price, created_at, city, property_type, area_sqm')
        .eq('status', 'active')
        .not('price', 'is', null)
        .gt('price', 0)
        .order('created_at', { ascending: true });

      if (selectedCity !== 'all') query = query.eq('city', selectedCity);
      if (propertyType !== 'all') query = query.eq('property_type', propertyType);

      const { data, error } = await query.limit(500);
      if (error) throw error;

      // Group by month
      const byMonth: Record<string, { prices: number[]; count: number }> = {};
      for (const p of data || []) {
        const month = p.created_at?.substring(0, 7); // YYYY-MM
        if (!month) continue;
        if (!byMonth[month]) byMonth[month] = { prices: [], count: 0 };
        byMonth[month].prices.push(p.price);
        byMonth[month].count++;
      }

      return Object.entries(byMonth)
        .map(([month, { prices, count }]) => ({
          month,
          label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
          medianPrice: Math.round(prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)]),
          listings: count,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Per-city comparison
  const { data: cityComparison = [] } = useQuery({
    queryKey: ['city-price-comparison'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('price, city, area_sqm')
        .eq('status', 'active')
        .not('price', 'is', null)
        .not('city', 'is', null)
        .gt('price', 0);

      const byCity: Record<string, number[]> = {};
      for (const p of data || []) {
        if (!p.city) continue;
        (byCity[p.city] = byCity[p.city] || []).push(p.price);
      }

      return Object.entries(byCity)
        .map(([city, prices]) => ({
          city,
          avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
          count: prices.length,
          medianPrice: Math.round(prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)]),
        }))
        .filter(c => c.count >= 2)
        .sort((a, b) => b.avgPrice - a.avgPrice)
        .slice(0, 10);
    },
    staleTime: 10 * 60 * 1000,
  });

  const formatPrice = (v: number) => {
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(0)}M`;
    return v.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="land">Land</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price trend chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Average Price Trend</CardTitle>
          <CardDescription>Monthly average listing prices over the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-72 animate-pulse bg-muted rounded" />
          ) : trendData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-muted-foreground">
              No data available for selected filters
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tickFormatter={(v) => `Rp ${formatPrice(v)}`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                  formatter={(value: number) => [`Rp ${formatPrice(value)}`, '']}
                />
                <Area type="monotone" dataKey="avgPrice" stroke="hsl(var(--primary))" fill="url(#priceGradient)" strokeWidth={2} name="Avg Price" />
                <Line type="monotone" dataKey="medianPrice" stroke="hsl(var(--chart-4))" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Median" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* City comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">City Price Comparison</CardTitle>
          <CardDescription>Average listing price by city</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cityComparison.map((city, idx) => {
              const maxAvg = cityComparison[0]?.avgPrice || 1;
              const widthPct = Math.max(10, (city.avgPrice / maxAvg) * 100);
              return (
                <div key={city.city} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{city.city}</span>
                    <span className="text-muted-foreground">Rp {formatPrice(city.avgPrice)} <span className="text-xs">({city.count} listings)</span></span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        idx === 0 ? 'bg-primary' : idx < 3 ? 'bg-chart-4' : 'bg-chart-1'
                      )}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {cityComparison.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No city data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
