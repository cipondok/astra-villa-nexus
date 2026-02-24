import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Filter } from 'lucide-react';
import { formatIDR } from '@/utils/currency';

interface PropertyRecord {
  price: number;
  city: string | null;
  property_type: string | null;
  listing_type: string | null;
  created_at: string;
}

const MarketTrendsChart = () => {
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [listingFilter, setListingFilter] = useState<string>('all');

  const { data: properties, isLoading } = useQuery({
    queryKey: ['market-trends-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('price, city, property_type, listing_type, created_at')
        .eq('status', 'active')
        .eq('approval_status', 'approved');
      if (error) throw error;
      return (data || []) as PropertyRecord[];
    },
  });

  const cities = useMemo(() => {
    if (!properties) return [];
    return [...new Set(properties.map(p => p.city).filter(Boolean))] as string[];
  }, [properties]);

  const propertyTypes = useMemo(() => {
    if (!properties) return [];
    return [...new Set(properties.map(p => p.property_type).filter(Boolean))] as string[];
  }, [properties]);

  const chartData = useMemo(() => {
    if (!properties) return [];

    const filtered = properties.filter(p => {
      if (cityFilter !== 'all' && p.city !== cityFilter) return false;
      if (typeFilter !== 'all' && p.property_type !== typeFilter) return false;
      if (listingFilter !== 'all' && p.listing_type !== listingFilter) return false;
      return true;
    });

    const grouped: Record<string, number[]> = {};
    filtered.forEach(p => {
      const month = new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(p.price);
    });

    return Object.entries(grouped)
      .map(([month, prices]) => {
        const sorted = [...prices].sort((a, b) => a - b);
        const avg = prices.reduce((s, v) => s + v, 0) / prices.length;
        const median = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
        return { month, avgPrice: Math.round(avg), medianPrice: Math.round(median), listings: prices.length };
      })
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [properties, cityFilter, typeFilter, listingFilter]);

  if (isLoading) {
    return <div className="space-y-3">{[1,2].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-48 bg-muted rounded" /></CardContent></Card>)}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="bg-transparent dark:bg-muted/10 border-border/30 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Filters</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="City" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {propertyTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={listingFilter} onValueChange={setListingFilter}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Listing" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="lease">Lease</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Price Trends */}
      <Card className="bg-transparent dark:bg-muted/10 border-border/30 backdrop-blur-sm">
        <CardHeader className="p-3">
          <CardTitle className="text-xs md:text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Price Trends (Avg & Median)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-3">
          {chartData.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No data available for selected filters</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} />
                <Tooltip formatter={(value: number) => formatIDR(value)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="avgPrice" name="Average" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="medianPrice" name="Median" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Listing Volume */}
      <Card className="bg-transparent dark:bg-muted/10 border-border/30 backdrop-blur-sm">
        <CardHeader className="p-3">
          <CardTitle className="text-xs md:text-sm">Listing Volume Over Time</CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-3">
          {chartData.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="listings" name="Listings" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3) / 0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketTrendsChart;
