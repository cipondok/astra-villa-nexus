import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { BaseProperty } from '@/types/property';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles, Brain, TrendingUp, Flame, Heart, HeartOff,
  MapPin, Bed, Bath, Maximize, ChevronLeft, ChevronRight,
  Eye, RefreshCw, PackageOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDefaultPropertyImage } from '@/hooks/useDefaultPropertyImage';
import OptimizedPropertyImage from '@/components/property/OptimizedPropertyImage';
import Price from '@/components/ui/Price';

const AI_SELECT = `id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, description, investment_score, has_pool, created_at`;

interface RankedProperty extends BaseProperty {
  ai_match_score_v2?: number;
  investment_score?: number;
  has_pool?: boolean;
}

interface SmartAIFeedProps {
  onPropertyClick: (property: BaseProperty) => void;
  className?: string;
}

export default function SmartAIFeed({ onPropertyClick, className }: SmartAIFeedProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { getPropertyImage } = useDefaultPropertyImage();
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());

  // ── AI ranked IDs for logged-in users ──
  const {
    data: aiRanking,
    isLoading: aiLoading,
    refetch: refetchAI,
  } = useQuery({
    queryKey: ['ai-feed-ranking', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-engine', {
        body: { mode: 'match_property', payload: { limit: 24 } },
      });
      if (error) throw error;
      return (data?.ranked_properties ?? []) as { id: string; ai_match_score_v2: number }[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // ── Fetch full property rows by ranked IDs ──
  const rankedIds = aiRanking?.map((r) => r.id) ?? [];

  const {
    data: aiProperties,
    isLoading: propsLoading,
  } = useQuery({
    queryKey: ['ai-feed-properties', rankedIds],
    queryFn: async () => {
      if (!rankedIds.length) return [];
      const { data, error } = await supabase
        .from('properties')
        .select(AI_SELECT)
        .in('id', rankedIds);
      if (error) throw error;
      // preserve ranking order
      const map = new Map((data ?? []).map((p) => [p.id, p]));
      const scoreMap = new Map(aiRanking!.map((r) => [r.id, r.ai_match_score_v2]));
      return rankedIds
        .map((id) => {
          const p = map.get(id);
          if (!p) return null;
          return {
            ...p,
            listing_type: p.listing_type as 'sale' | 'rent' | 'lease',
            ai_match_score_v2: scoreMap.get(id),
          } as RankedProperty;
        })
        .filter(Boolean) as RankedProperty[];
    },
    enabled: rankedIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // ── Trending fallback for guests ──
  const {
    data: trendingProperties,
    isLoading: trendingLoading,
  } = useQuery({
    queryKey: ['trending-feed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(AI_SELECT)
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .not('price', 'is', null)
        .order('created_at', { ascending: false })
        .limit(24);
      if (error) throw error;
      return (data ?? []).map((p) => ({
        ...p,
        listing_type: p.listing_type as 'sale' | 'rent' | 'lease',
      })) as RankedProperty[];
    },
    enabled: !user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const isLoggedIn = !!user;
  const isLoading = isLoggedIn ? aiLoading || propsLoading : trendingLoading;
  const properties = isLoggedIn ? (aiProperties ?? []) : (trendingProperties ?? []);

  // ── Saved properties ──
  useEffect(() => {
    if (!user) return;
    supabase
      .from('saved_properties' as any)
      .select('property_id')
      .eq('user_id', user.id)
      .then(({ data }: any) => {
        if (data) setSavedSet(new Set(data.map((s: any) => s.property_id)));
      });
  }, [user]);

  const toggleSave = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) return;
    const isSaved = savedSet.has(id);
    setSavedSet((prev) => {
      const next = new Set(prev);
      isSaved ? next.delete(id) : next.add(id);
      return next;
    });
    if (isSaved) {
      await (supabase.from('saved_properties' as any) as any).delete().eq('user_id', user.id).eq('property_id', id);
    } else {
      await (supabase.from('saved_properties' as any) as any).insert({ user_id: user.id, property_id: id });
    }
  };

  const scroll = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });

  // ── Score color ──
  const scoreColor = (s: number) =>
    s >= 80
      ? 'bg-chart-2 text-chart-2-foreground'
      : s >= 60
        ? 'bg-primary text-primary-foreground'
        : 'bg-muted-foreground text-muted';

  // ── Shimmer loading ──
  if (isLoading) {
    return (
      <section className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2 px-1">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-5 w-44" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[200px] space-y-2">
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── Empty state ──
  if (!properties.length) {
    return (
      <section className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
        <PackageOpen className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <h3 className="text-sm font-semibold text-foreground">No matches found</h3>
        <p className="text-xs text-muted-foreground mt-1">Browse and save properties to improve your AI recommendations.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/search')}>
          Explore Properties
        </Button>
      </section>
    );
  }

  return (
    <section className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20">
              <Brain className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
          ) : (
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-chart-1 to-chart-4 flex items-center justify-center shadow-md shadow-chart-1/20">
              <Flame className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
          )}
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground leading-tight">
              {isLoggedIn ? 'Recommended For You' : 'Trending Properties'}
            </h2>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium">
              {isLoggedIn ? 'Powered by ASTRA AI Intelligence' : 'Popular picks this week'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => scroll('left')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => scroll('right')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {isLoggedIn && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => refetchAI()}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Cards */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {properties.map((property) => {
          const score = property.ai_match_score_v2;
          const invScore = (property as any).investment_score;
          const isSaved = savedSet.has(property.id);

          return (
            <div
              key={property.id}
              onClick={() => onPropertyClick(property)}
              className="flex-shrink-0 w-[180px] sm:w-[200px] md:w-[220px] cursor-pointer group rounded-xl border border-border/30 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <OptimizedPropertyImage
                  src={getPropertyImage(property.images, property.thumbnail_url)}
                  alt={property.title}
                  className="group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />

                {/* Badges top-left */}
                <div className="absolute top-1.5 left-1.5 flex gap-1">
                  {score !== undefined && (
                    <Badge className={cn('text-[9px] font-bold border-0 gap-0.5 shadow-sm', scoreColor(score))}>
                      <Brain className="h-2 w-2" />
                      {score}%
                    </Badge>
                  )}
                  {!score && isLoggedIn && (
                    <Badge className="text-[9px] bg-primary text-primary-foreground border-0 gap-0.5 shadow-sm">
                      <Sparkles className="h-2 w-2" /> AI
                    </Badge>
                  )}
                </div>

                {/* Chips top-right */}
                <div className="absolute top-1.5 right-1.5 flex flex-col gap-1">
                  {invScore != null && invScore > 0 && (
                    <Badge variant="outline" className="text-[8px] bg-background/80 backdrop-blur-sm border-primary/30 text-primary gap-0.5">
                      <TrendingUp className="h-2 w-2" /> {invScore}
                    </Badge>
                  )}
                </div>

                {/* Save button */}
                {user && (
                  <button
                    onClick={(e) => toggleSave(e, property.id)}
                    className="absolute bottom-1.5 right-1.5 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                  >
                    {isSaved ? (
                      <Heart className="h-3.5 w-3.5 fill-destructive text-destructive" />
                    ) : (
                      <HeartOff className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>
                )}

                {/* Hover eye */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-lg ring-1 ring-primary/30">
                    <Eye className="h-4 w-4 text-foreground" />
                  </div>
                </div>

                {/* Price overlay */}
                <div className="absolute bottom-1.5 left-1.5">
                  <div className="bg-background/80 backdrop-blur-sm rounded-md px-1.5 py-0.5 border border-border/30">
                    <p className="text-xs font-black text-foreground leading-tight">
                      <Price amount={property.price || 0} short />
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-2.5 space-y-1.5">
                <h3 className="text-[11px] sm:text-xs font-semibold text-foreground line-clamp-1">{property.title}</h3>
                <div className="flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-[9px] text-muted-foreground truncate">{property.city || property.location || 'Indonesia'}</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1 border-t border-border/20">
                  {Number(property.bedrooms) > 0 && (
                    <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                      <Bed className="h-2.5 w-2.5" /> {property.bedrooms}
                    </span>
                  )}
                  {Number(property.bathrooms) > 0 && (
                    <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                      <Bath className="h-2.5 w-2.5" /> {property.bathrooms}
                    </span>
                  )}
                  {Number(property.area_sqm) > 0 && (
                    <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                      <Maximize className="h-2.5 w-2.5" /> {property.area_sqm}m²
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
