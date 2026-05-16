import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTracking } from "@/hooks/useUserTracking";
import { useDefaultPropertyImage } from "@/hooks/useDefaultPropertyImage";
import { useInvestorDNA } from "@/hooks/useInvestorDNA";
import { useWatchlistPropertyIds } from "@/hooks/useInvestorWatchlist";
import OptimizedPropertyImage from "@/components/property/OptimizedPropertyImage";
import Price from "@/components/ui/Price";
import { 
  Sparkles, 
  MapPin, 
  Home,
  TrendingUp,
  RefreshCw,
  Bed,
  Bath,
  Maximize,
  Brain,
  Flame,
} from "lucide-react";
import { Link } from "react-router-dom";
import WhyRecommended from "./WhyRecommended";
import {
  rankRecommendations,
  shouldRefreshFeed,
  type RawRecommendation,
  type RankedRecommendation,
  type RankingContext,
  type BrowsingSignal,
  type RefreshTrigger,
} from "@/utils/recommendationRanker";

interface SmartRecommendationsProps {
  limit?: number;
  className?: string;
}

const SmartRecommendations = ({ limit = 4, className = "" }: SmartRecommendationsProps) => {
  const { user } = useAuth();
  const { trackInteraction } = useUserTracking();
  const { getPropertyImage } = useDefaultPropertyImage();
  const queryClient = useQueryClient();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // ── Data sources for ranking context ──
  const { data: investorDNA } = useInvestorDNA();
  const { data: watchlistSet } = useWatchlistPropertyIds();
  const watchlistIds = watchlistSet ? Array.from(watchlistSet as Set<string>) : [];

  // Fetch browsing history for behavioral signals
  const { data: browsingHistory = [] } = useQuery<BrowsingSignal[]>({
    queryKey: ['browsing-signals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('ai_behavior_tracking')
        .select('event_data, property_id, created_at')
        .eq('user_id', user.id)
        .eq('event_type', 'property_view')
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (!data) return [];

      // Aggregate by city + type
      const agg = new Map<string, BrowsingSignal>();
      data.forEach((row: any) => {
        const city = row.event_data?.city || row.event_data?.location || '';
        const propertyType = row.event_data?.property_type || '';
        const key = `${city}|${propertyType}`;
        const existing = agg.get(key);
        if (existing) {
          existing.viewCount += 1;
          if (row.created_at > existing.lastViewedAt) existing.lastViewedAt = row.created_at;
        } else {
          agg.set(key, { city, propertyType, viewCount: 1, lastViewedAt: row.created_at });
        }
      });
      return Array.from(agg.values());
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch ignored/dismissed property IDs
  const { data: ignoredIds = [] } = useQuery<string[]>({
    queryKey: ['ignored-recommendations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('ai_feedback_signals')
        .select('property_id')
        .eq('user_id', user.id)
        .eq('user_action', 'dismiss')
        .not('property_id', 'is', null);
      return (data || []).map((r: any) => r.property_id).filter(Boolean);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch watchlist metadata for city/type affinity
  const { data: watchlistMeta } = useQuery({
    queryKey: ['watchlist-meta', user?.id],
    queryFn: async () => {
      if (!user?.id || !watchlistIds.length) return { cities: [], types: [] };
      const { data } = await supabase
        .from('properties')
        .select('city, property_type')
        .in('id', watchlistIds.slice(0, 50));
      const cities = [...new Set((data || []).map((p: any) => p.city).filter(Boolean))];
      const types = [...new Set((data || []).map((p: any) => p.property_type).filter(Boolean))];
      return { cities, types };
    },
    enabled: !!user?.id && watchlistIds.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  // ── Raw recommendations from AI engine ──
  const { data: rawData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['smart-recommendations', user?.id, limit],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-engine', {
        body: { mode: 'match_property', payload: { limit: limit * 2 } }, // Fetch more for ranking
      });
      if (error) throw error;

      const results = data?.results || [];
      if (results.length > 0 && results[0].property_id && !results[0].title) {
        const ids = results.map((r: any) => r.property_id);
        const scoreMap = new Map<string, { match_score: number; opportunity_score: number; demand_heat_score: number }>(
          results.map((r: any) => [r.property_id, {
            match_score: r.match_score || r.ai_match_score_v2 || 0,
            opportunity_score: r.opportunity_score || 0,
            demand_heat_score: r.demand_heat_score || 0,
          }])
        );
        const { data: props } = await supabase
          .from('properties')
          .select('id, title, city, location, price, property_type, images, thumbnail_url, bedrooms, bathrooms, area_sqm, opportunity_score, demand_heat_score')
          .in('id', ids);
        
        return {
          recommendations: (props || []).map((p: any) => {
            const scores = scoreMap.get(p.id) || { match_score: 0, opportunity_score: 0, demand_heat_score: 0 };
            return {
              property_id: p.id,
              title: p.title,
              city: p.city || p.location,
              price: p.price,
              property_type: p.property_type,
              image_url: p.thumbnail_url || (p.images && p.images[0]) || '/placeholder.svg',
              match_score: scores.match_score,
              bedrooms: p.bedrooms,
              bathrooms: p.bathrooms,
              area_sqm: p.area_sqm,
              opportunity_score: p.opportunity_score || scores.opportunity_score,
              demand_heat_score: p.demand_heat_score || scores.demand_heat_score,
              is_elite: (p.opportunity_score || 0) >= 85,
            } as RawRecommendation;
          }),
          userProfile: data?.user_ai_profile || {},
        };
      }

      return {
        recommendations: results.map((r: any) => ({
          property_id: r.property_id || r.id,
          title: r.title || 'Properti',
          city: r.city || r.location || 'Indonesia',
          price: r.price || 0,
          property_type: r.property_type || 'Rumah',
          image_url: r.image_url || r.thumbnail_url || '/placeholder.svg',
          match_score: r.match_score || r.ai_match_score_v2 || 0,
          bedrooms: r.bedrooms || 0,
          bathrooms: r.bathrooms || 0,
          area_sqm: r.area_sqm || 0,
          opportunity_score: r.opportunity_score || 0,
          demand_heat_score: r.demand_heat_score || 0,
          is_elite: (r.opportunity_score || 0) >= 85,
        } as RawRecommendation)),
        userProfile: data?.user_ai_profile || {},
      };
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // ── Apply intelligent ranking ──
  const rankingContext: RankingContext = {
    investorDNA: investorDNA || null,
    watchlistPropertyIds: watchlistIds as string[],
    watchlistCities: watchlistMeta?.cities || [],
    watchlistTypes: watchlistMeta?.types || [],
    ignoredPropertyIds: ignoredIds,
    browsingHistory,
  };

  const rawRecs = (rawData?.recommendations || []) as RawRecommendation[];
  const rankedRecommendations = rankRecommendations(rawRecs, rankingContext).slice(0, limit);
  const userProfile = rawData?.userProfile;

  // ── Dynamic refresh on behavior signals ──
  const triggerFeedRefresh = useCallback((trigger: RefreshTrigger) => {
    const { shouldRefresh: doRefresh, debounceMs } = shouldRefreshFeed(trigger);
    if (!doRefresh) return;

    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['smart-recommendations'] });
    }, debounceMs);
  }, [queryClient]);

  // Expose refresh trigger globally for other components
  useEffect(() => {
    (window as any).__astraRefreshFeed = triggerFeedRefresh;
    return () => { delete (window as any).__astraRefreshFeed; };
  }, [triggerFeedRefresh]);

  const trackPropertyView = async (propertyId: string, property: any) => {
    if (!user?.id) return;
    await trackInteraction('property_view', {
      propertyId,
      propertyType: property.property_type,
      location: property.city,
      price: property.price,
      source: 'ai_recommendation'
    });
  };

  if (!user) {
    return (
      <Card className={`border-primary/10 bg-card/60 backdrop-blur-xl ${className}`}>
        <CardContent className="p-6 text-center">
          <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
          <h3 className="text-base font-semibold mb-1">Rekomendasi AI</h3>
          <p className="text-sm text-muted-foreground">Masuk untuk mendapatkan rekomendasi properti yang dipersonalisasi.</p>
        </CardContent>
      </Card>
    );
  }

  const loading = isLoading || isFetching;

  const scoreColor = (s: number) =>
    s >= 80 ? 'bg-chart-2 text-chart-2-foreground'
    : s >= 60 ? 'bg-primary text-primary-foreground'
    : 'bg-muted text-muted-foreground';

  return (
    <Card className={`backdrop-blur-xl bg-card/60 border-primary/10 ${className}`}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
              <Brain className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold">Rekomendasi Cerdas</span>
              <Badge className="ml-2 bg-primary/10 text-primary text-[9px] px-1.5 py-0 border-0">AI</Badge>
            </div>
          </CardTitle>
          <Button
            onClick={() => refetch()}
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {/* Profile context badges */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground">Berdasarkan:</span>
          {investorDNA?.investor_persona && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 gap-0.5">
              <Flame className="h-2.5 w-2.5" />
              {investorDNA.investor_persona}
            </Badge>
          )}
          {userProfile?.property_type_preference && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
              {userProfile.property_type_preference}
            </Badge>
          )}
          {userProfile?.preferred_city && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
              {userProfile.preferred_city}
            </Badge>
          )}
          {watchlistIds.length > 0 && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 text-muted-foreground">
              {watchlistIds.length} watchlist
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-2 pt-0">
        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg overflow-hidden">
                <div className="h-28 bg-muted rounded-t-lg" />
                <div className="p-2 space-y-1.5">
                  <div className="h-3.5 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : rankedRecommendations.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {rankedRecommendations.map((property: RankedRecommendation) => (
              <Link
                key={property.property_id}
                to={`/property/${property.property_id}`}
                onClick={() => trackPropertyView(property.property_id, property)}
                className="block rounded-lg overflow-hidden border border-border/30 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <OptimizedPropertyImage
                    src={property.image_url || '/placeholder.svg'}
                    alt={property.title}
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

                  {/* Score badge + why recommended */}
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                    <Badge className={`text-[9px] font-bold border-0 gap-0.5 shadow-sm ${scoreColor(property.finalScore)}`}>
                      <TrendingUp className="h-2 w-2" />
                      {Math.round(property.finalScore)}%
                    </Badge>
                    <WhyRecommended
                      matchScore={property.finalScore}
                      city={property.city}
                      propertyType={property.property_type}
                      preferredCity={userProfile?.preferred_city}
                      preferredType={userProfile?.property_type_preference}
                      contextTag={property.contextTag}
                      rankSignals={property.rankSignals}
                      boosts={property.boostApplied}
                    />
                  </div>

                  {/* Elite badge */}
                  {property.is_elite && (
                    <div className="absolute top-1.5 right-1.5">
                      <Badge className="text-[8px] bg-chart-2/90 text-chart-2-foreground border-0 px-1.5 py-0 gap-0.5">
                        <Sparkles className="h-2 w-2" /> ELITE
                      </Badge>
                    </div>
                  )}

                  {/* Price overlay */}
                  <div className="absolute bottom-1.5 left-1.5">
                    <div className="bg-background/80 backdrop-blur-sm rounded-md px-1.5 py-0.5 border border-border/30">
                      <span className="text-xs font-bold text-foreground">
                        <Price amount={property.price || 0} short />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-2 space-y-1">
                  <h4 className="text-xs font-semibold text-foreground line-clamp-1">
                    {property.title}
                  </h4>

                  {/* Context tag */}
                  <p className="text-[9px] text-chart-4 font-medium line-clamp-1 italic">
                    {property.contextTag}
                  </p>

                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{property.city}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Home className="h-3 w-3 flex-shrink-0" />
                    <span>{property.property_type}</span>
                  </div>
                  {/* Specs */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border/20">
                    {Number(property.bedrooms) > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Bed className="h-2.5 w-2.5" /> {property.bedrooms}
                      </span>
                    )}
                    {Number(property.bathrooms) > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Bath className="h-2.5 w-2.5" /> {property.bathrooms}
                      </span>
                    )}
                    {Number(property.area_sqm) > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Maximize className="h-2.5 w-2.5" /> {property.area_sqm}m²
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Jelajahi properti untuk membuka rekomendasi AI!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartRecommendations;
