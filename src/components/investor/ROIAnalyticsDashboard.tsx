import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCurrencyFormatterShort } from '@/stores/currencyStore';
import { BarChart3, TrendingUp, MapPin, Gem, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '@/lib/utils';

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function ROIAnalyticsDashboard() {
  const formatPrice = getCurrencyFormatterShort();

  const { data: forecasts, isLoading } = useQuery({
    queryKey: ['roi-analytics-all'],
    queryFn: async () => {
      const { data } = await supabase
        .from('property_roi_forecast' as any)
        .select('*, property:properties!property_roi_forecast_property_id_fkey(id, title, city, state, property_type, price, listing_type)')
        .order('expected_roi', { ascending: false })
        .limit(200);
      return (data || []) as any[];
    },
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const allForecasts = forecasts || [];

  // Top ROI locations - aggregate by city
  const cityMap = new Map<string, { totalROI: number; totalYield: number; count: number; avgGrowth: number }>();
  allForecasts.forEach((f: any) => {
    const city = f.property?.city || 'Unknown';
    const entry = cityMap.get(city) || { totalROI: 0, totalYield: 0, count: 0, avgGrowth: 0 };
    entry.totalROI += f.expected_roi || 0;
    entry.totalYield += f.rental_yield || 0;
    entry.avgGrowth += f.price_growth_forecast || 0;
    entry.count += 1;
    cityMap.set(city, entry);
  });

  const topLocations = Array.from(cityMap.entries())
    .map(([city, d]) => ({
      city,
      avgROI: Math.round((d.totalROI / d.count) * 100) / 100,
      avgYield: Math.round((d.totalYield / d.count) * 100) / 100,
      avgGrowth: Math.round((d.avgGrowth / d.count) * 100) / 100,
      count: d.count,
    }))
    .sort((a, b) => b.avgROI - a.avgROI)
    .slice(0, 10);

  // Rental yield by property type
  const typeMap = new Map<string, { totalYield: number; count: number }>();
  allForecasts.forEach((f: any) => {
    const type = f.property?.property_type || 'other';
    const entry = typeMap.get(type) || { totalYield: 0, count: 0 };
    entry.totalYield += f.rental_yield || 0;
    entry.count += 1;
    typeMap.set(type, entry);
  });
  const yieldByType = Array.from(typeMap.entries())
    .map(([type, d]) => ({ type: type.charAt(0).toUpperCase() + type.slice(1), yield: Math.round((d.totalYield / d.count) * 100) / 100 }))
    .sort((a, b) => b.yield - a.yield);

  // Undervalued properties (high ROI, low risk, high confidence)
  const undervalued = allForecasts
    .filter((f: any) => f.expected_roi >= 8 && f.market_risk !== 'high' && f.confidence_score >= 50)
    .slice(0, 8);

  // Stats
  const avgROI = allForecasts.length > 0
    ? Math.round((allForecasts.reduce((s: number, f: any) => s + (f.expected_roi || 0), 0) / allForecasts.length) * 100) / 100
    : 0;
  const avgYield = allForecasts.length > 0
    ? Math.round((allForecasts.reduce((s: number, f: any) => s + (f.rental_yield || 0), 0) / allForecasts.length) * 100) / 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{allForecasts.length}</p>
            <p className="text-xs text-muted-foreground">Properties Analyzed</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{avgROI}%</p>
            <p className="text-xs text-muted-foreground">Avg Expected ROI</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 text-center">
            <MapPin className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{cityMap.size}</p>
            <p className="text-xs text-muted-foreground">Locations Covered</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 text-center">
            <Gem className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{avgYield}%</p>
            <p className="text-xs text-muted-foreground">Avg Rental Yield</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top ROI Locations */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Top ROI Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topLocations.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topLocations} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="city" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="avgROI" radius={[0, 4, 4, 0]}>
                    {topLocations.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Rental Yield by Type */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Rental Yield by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            {yieldByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={yieldByType} margin={{ left: 0, right: 10 }}>
                  <XAxis dataKey="type" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="yield" radius={[4, 4, 0, 0]}>
                    {yieldByType.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Undervalued Properties */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Gem className="h-4 w-4 text-amber-500" /> Undervalued Properties (High ROI, Low Risk)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {undervalued.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {undervalued.map((f: any) => (
                <div key={f.id} className="rounded-lg border border-border/50 p-3 bg-accent/20 space-y-1.5">
                  <p className="text-sm font-medium text-foreground truncate">{f.property?.title || 'Property'}</p>
                  <p className="text-xs text-muted-foreground">{f.property?.city || ''} • {f.property?.property_type}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-medium">{formatPrice(f.property?.price || 0)}</span>
                    <Badge variant="default" className="text-[10px]">{f.expected_roi}% ROI</Badge>
                  </div>
                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                    <span>Yield: {f.rental_yield}%</span>
                    <span>Growth: {f.price_growth_forecast}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No undervalued properties identified yet. Run ROI forecasts on more properties to discover opportunities.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
