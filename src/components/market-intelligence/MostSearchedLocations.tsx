import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Search, Eye, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MostSearchedLocations() {
  const { data: searchData = [], isLoading } = useQuery({
    queryKey: ['most-searched-locations'],
    queryFn: async () => {
      // Get analytics with views, then fetch property locations separately
      const { data: analytics } = await supabase
        .from('property_analytics')
        .select('property_id, views')
        .gt('views', 0)
        .order('views', { ascending: false })
        .limit(200);

      if (!analytics?.length) return [];

      // Fetch property locations for those property IDs
      const propertyIds = [...new Set(analytics.map(a => a.property_id))];
      const { data: properties } = await supabase
        .from('properties')
        .select('id, city, location, state')
        .in('id', propertyIds);

      const propMap = new Map((properties || []).map(p => [p.id, p]));

      // Aggregate by city
      const byCity: Record<string, { views: number; properties: number }> = {};
      for (const a of analytics) {
        const prop = propMap.get(a.property_id);
        const city = prop?.city || prop?.location || prop?.state;
        if (!city) continue;
        if (!byCity[city]) byCity[city] = { views: 0, properties: 0 };
        byCity[city].views += a.views || 0;
        byCity[city].properties++;
      }

      return Object.entries(byCity)
        .map(([city, data]) => ({
          city,
          views: data.views,
          properties: data.properties,
          avgViews: Math.round(data.views / data.properties),
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 15);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fallback: if no analytics data, use property counts by city
  const { data: fallbackData = [] } = useQuery({
    queryKey: ['location-listing-counts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('city')
        .eq('status', 'active')
        .not('city', 'is', null);

      const byCity: Record<string, number> = {};
      for (const p of data || []) {
        if (p.city) byCity[p.city] = (byCity[p.city] || 0) + 1;
      }

      return Object.entries(byCity)
        .map(([city, count]) => ({ city, views: count * 10, properties: count, avgViews: 10 }))
        .sort((a, b) => b.properties - a.properties)
        .slice(0, 15);
    },
    enabled: searchData.length === 0,
    staleTime: 10 * 60 * 1000,
  });

  const displayData = searchData.length > 0 ? searchData : fallbackData;
  const chartColors = [
    'hsl(var(--primary))', 'hsl(var(--chart-1))', 'hsl(var(--chart-4))',
    'hsl(var(--chart-5))', 'hsl(var(--chart-3))',
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" /> Most Popular Locations
          </CardTitle>
          <CardDescription>Ranked by total property views and search interest</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-72 animate-pulse bg-muted rounded" />
          ) : displayData.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No search data available yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(300, displayData.length * 40)}>
              <BarChart data={displayData.slice(0, 10)} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis type="category" dataKey="city" width={120} tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                  formatter={(value: number) => [value.toLocaleString(), 'Views']}
                />
                <Bar dataKey="views" radius={[0, 4, 4, 0]} name="Total Views">
                  {displayData.slice(0, 10).map((_, idx) => (
                    <Cell key={idx} fill={chartColors[idx % chartColors.length]} opacity={1 - idx * 0.06} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayData.slice(0, 6).map((loc, idx) => (
          <Card key={loc.city} className={cn(
            'hover:shadow-md transition-shadow',
            idx === 0 && 'border-primary/30 shadow-sm'
          )}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-foreground">{loc.city}</h3>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {loc.views.toLocaleString()} views
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {loc.properties} properties
                    </div>
                  </div>
                </div>
                <Badge variant={idx < 3 ? 'default' : 'secondary'} className="text-xs">
                  #{idx + 1}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
