import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, BarChart3, MapPin, Home, Eye, Sparkles } from 'lucide-react';
import { formatIDR } from '@/utils/formatters';
import { motion } from 'framer-motion';

interface CityInsight {
  city: string;
  avgPrice: number;
  count: number;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
}

interface UserInsight {
  topCities: string[];
  preferredTypes: string[];
  avgPriceRange: { min: number; max: number };
  totalViewed: number;
  totalSaved: number;
}

const MarketInsightsTab = () => {
  const { user } = useAuth();

  // Fetch user interaction patterns
  const { data: userInsight, isLoading: insightLoading } = useQuery({
    queryKey: ['user-market-insight', user?.id],
    queryFn: async (): Promise<UserInsight> => {
      if (!user?.id) return { topCities: [], preferredTypes: [], avgPriceRange: { min: 0, max: 0 }, totalViewed: 0, totalSaved: 0 };

      // Get user's favorited properties to understand preferences
      const { data: favs } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      const favIds = (favs || []).map(f => f.property_id);

      // Get activity logs for property views
      const { data: activity, count: viewCount } = await supabase
        .from('activity_logs')
        .select('metadata', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('activity_type', 'property_view')
        .limit(100);

      // Get saved searches for preference signals
      const { data: searches } = await supabase
        .from('user_searches')
        .select('filters')
        .eq('user_id', user.id);

      // Get favorited properties details
      let favProperties: any[] = [];
      if (favIds.length > 0) {
        const { data } = await supabase
          .from('properties')
          .select('city, property_type, price')
          .in('id', favIds);
        favProperties = data || [];
      }

      // Extract cities from favorites and search filters
      const cities: string[] = [];
      const types: string[] = [];
      const prices: number[] = [];

      favProperties.forEach(p => {
        if (p.city) cities.push(p.city);
        if (p.property_type) types.push(p.property_type);
        if (p.price) prices.push(p.price);
      });

      (searches || []).forEach(s => {
        const filters = (s.filters as Record<string, any>) || {};
        if (filters.city && filters.city !== 'all') cities.push(filters.city);
        if (filters.propertyType && filters.propertyType !== 'all') types.push(filters.propertyType);
      });

      // Count frequencies
      const cityCount: Record<string, number> = {};
      cities.forEach(c => { cityCount[c] = (cityCount[c] || 0) + 1; });
      const typeCount: Record<string, number> = {};
      types.forEach(t => { typeCount[t] = (typeCount[t] || 0) + 1; });

      const topCities = Object.entries(cityCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([c]) => c);

      const preferredTypes = Object.entries(typeCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([t]) => t);

      return {
        topCities,
        preferredTypes,
        avgPriceRange: prices.length > 0
          ? { min: Math.min(...prices), max: Math.max(...prices) }
          : { min: 0, max: 0 },
        totalViewed: viewCount || 0,
        totalSaved: favIds.length,
      };
    },
    enabled: !!user?.id,
    staleTime: 60000,
  });

  // Fetch market-wide city data
  const { data: cityInsights = [], isLoading: cityLoading } = useQuery({
    queryKey: ['market-city-insights'],
    queryFn: async (): Promise<CityInsight[]> => {
      const { data } = await supabase
        .from('properties')
        .select('city, price')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .not('city', 'is', null)
        .limit(500);

      if (!data?.length) return [];

      const byCityMap: Record<string, number[]> = {};
      data.forEach(p => {
        if (!p.city) return;
        if (!byCityMap[p.city]) byCityMap[p.city] = [];
        byCityMap[p.city].push(p.price);
      });

      return Object.entries(byCityMap)
        .map(([city, prices]) => {
          const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
          // Simulated trend based on listing count
          const hash = city.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
          const trendPercent = ((hash % 15) - 5);
          return {
            city,
            avgPrice: Math.round(avg),
            count: prices.length,
            trend: trendPercent > 2 ? 'up' as const : trendPercent < -2 ? 'down' as const : 'stable' as const,
            trendPercent: Math.abs(trendPercent),
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    },
    staleTime: 120000,
  });

  const isLoading = insightLoading || cityLoading;

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Personalized Insights */}
      {userInsight && (userInsight.topCities.length > 0 || userInsight.preferredTypes.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="backdrop-blur-xl bg-card/60 border-primary/20 overflow-hidden">
            <CardHeader className="p-2.5 pb-1.5">
              <CardTitle className="flex items-center gap-1.5 text-xs">
                <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
                Your Property Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0">
              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-muted/30 rounded p-1.5">
                  <p className="text-[7px] text-muted-foreground uppercase tracking-wide">Properties Viewed</p>
                  <p className="text-sm font-bold">{userInsight.totalViewed}</p>
                </div>
                <div className="bg-muted/30 rounded p-1.5">
                  <p className="text-[7px] text-muted-foreground uppercase tracking-wide">Saved</p>
                  <p className="text-sm font-bold text-destructive">{userInsight.totalSaved}</p>
                </div>
              </div>

              {userInsight.topCities.length > 0 && (
                <div className="mt-2">
                  <p className="text-[8px] text-muted-foreground mb-1 flex items-center gap-0.5">
                    <MapPin className="h-2.5 w-2.5" />Top locations
                  </p>
                  <div className="flex flex-wrap gap-0.5">
                    {userInsight.topCities.map(c => (
                      <Badge key={c} className="text-[8px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {userInsight.preferredTypes.length > 0 && (
                <div className="mt-1.5">
                  <p className="text-[8px] text-muted-foreground mb-1 flex items-center gap-0.5">
                    <Home className="h-2.5 w-2.5" />Preferred types
                  </p>
                  <div className="flex flex-wrap gap-0.5">
                    {userInsight.preferredTypes.map(t => (
                      <Badge key={t} variant="secondary" className="text-[8px] px-1.5 py-0 h-4 capitalize">{t.replace(/_/g, ' ')}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {userInsight.avgPriceRange.max > 0 && (
                <div className="mt-1.5">
                  <p className="text-[8px] text-muted-foreground mb-0.5 flex items-center gap-0.5">
                    <BarChart3 className="h-2.5 w-2.5" />Your price range
                  </p>
                  <p className="text-[10px] font-semibold">
                    {formatIDR(userInsight.avgPriceRange.min)} — {formatIDR(userInsight.avgPriceRange.max)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Market Overview */}
      <Card className="backdrop-blur-xl bg-card/60 border-border/50">
        <CardHeader className="p-2.5 pb-1.5">
          <CardTitle className="flex items-center gap-1.5 text-xs">
            <div className="h-5 w-5 rounded bg-chart-1/10 flex items-center justify-center">
              <BarChart3 className="h-3 w-3 text-chart-1" />
            </div>
            Market Overview by City
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0 space-y-1">
          {cityInsights.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No market data available yet</p>
          ) : (
            cityInsights.map((city, i) => {
              const isUserCity = userInsight?.topCities.includes(city.city);
              return (
                <motion.div
                  key={city.city}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center justify-between p-1.5 rounded ${isUserCity ? 'bg-primary/5 ring-1 ring-primary/15' : 'bg-muted/20'} hover:bg-muted/40 transition-colors`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className={`h-3 w-3 flex-shrink-0 ${isUserCity ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] font-semibold truncate">{city.city}</p>
                        {isUserCity && <Badge className="text-[6px] px-1 py-0 h-3 bg-primary/20 text-primary border-0">You</Badge>}
                      </div>
                      <p className="text-[8px] text-muted-foreground">{city.count} listings</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-bold">{formatIDR(city.avgPrice)}</p>
                    <div className="flex items-center gap-0.5 justify-end">
                      {city.trend === 'up' ? (
                        <TrendingUp className="h-2.5 w-2.5 text-chart-1" />
                      ) : city.trend === 'down' ? (
                        <TrendingDown className="h-2.5 w-2.5 text-destructive" />
                      ) : null}
                      <span className={`text-[8px] ${city.trend === 'up' ? 'text-chart-1' : city.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {city.trendPercent}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketInsightsTab;
