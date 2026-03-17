import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BaseProperty } from '@/types/property';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePropertyComparison } from '@/contexts/PropertyComparisonContext';
import Price from '@/components/ui/Price';
import OptimizedPropertyImage from '@/components/property/OptimizedPropertyImage';
import { useDefaultPropertyImage } from '@/hooks/useDefaultPropertyImage';
import {
  Brain, Flame, TrendingUp, TrendingDown, MapPin, Bed, Bath, Maximize,
  Heart, HeartOff, Eye, RefreshCw, Sparkles, BarChart3, Home,
  Zap, Scale, Bookmark, ChevronLeft, ChevronRight, Rocket, Shield,
  Building2, PackageOpen
} from 'lucide-react';

// ── Types ──

interface IntelligenceProperty extends BaseProperty {
  opportunity_score?: number | null;
  investment_score?: number | null;
  demand_score?: number | null;
  rental_yield?: number | null;
  market_heat_score?: number | null;
  ai_estimated_price?: number | null;
  ai_match_score_v2?: number;
  has_pool?: boolean;
  price_change_pct?: number | null;
}

type FeedCategory = 'all' | 'elite' | 'price_drop' | 'rental_yield' | 'trending' | 'new_launch';

interface AIInvestmentFeedProps {
  onPropertyClick: (property: BaseProperty) => void;
  className?: string;
}

// ── AI Tags ──

function getAITags(p: IntelligenceProperty): { label: string; color: string; icon: React.ElementType }[] {
  const tags: { label: string; color: string; icon: React.ElementType }[] = [];
  const os = p.opportunity_score ?? 0;
  const ry = p.rental_yield ?? 0;
  const mh = p.market_heat_score ?? 0;
  const priceDiff = p.ai_estimated_price && p.price ? ((p.ai_estimated_price - p.price) / p.price) * 100 : 0;

  if (os >= 85) tags.push({ label: 'Strong Buy', color: 'bg-chart-2/20 text-chart-2 border-chart-2/30', icon: Zap });
  else if (os >= 70) tags.push({ label: 'Early Growth', color: 'bg-chart-1/20 text-chart-1 border-chart-1/30', icon: Rocket });
  if (ry >= 8) tags.push({ label: 'Rental Income', color: 'bg-chart-4/20 text-chart-4 border-chart-4/30', icon: Home });
  if (priceDiff > 10) tags.push({ label: 'Undervalued', color: 'bg-chart-3/20 text-chart-3 border-chart-3/30', icon: TrendingDown });
  if (mh >= 75) tags.push({ label: 'Hot Zone', color: 'bg-destructive/15 text-destructive border-destructive/30', icon: Flame });

  return tags.slice(0, 2);
}

// ── Score Ring SVG ──

function OpportunityScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 85 ? 'hsl(var(--chart-2))' : score >= 70 ? 'hsl(var(--primary))' : score >= 50 ? 'hsl(var(--chart-4))' : 'hsl(var(--muted-foreground))';
  const isElite = score >= 85;

  return (
    <div className={cn('relative', isElite && 'drop-shadow-[0_0_8px_hsl(var(--chart-2)/0.4)]')}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={circumference - progress}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-black text-foreground">{score}</span>
      </div>
    </div>
  );
}

// ── Constants ──

const SELECT_FIELDS = `id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, description, investment_score, opportunity_score, demand_score, rental_yield, market_heat_score, ai_estimated_price, has_pool, created_at`;

const CATEGORIES: { key: FeedCategory; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'For You', icon: Brain },
  { key: 'elite', label: 'Elite Deals', icon: Zap },
  { key: 'price_drop', label: 'Price Drops', icon: TrendingDown },
  { key: 'rental_yield', label: 'Top Yield', icon: BarChart3 },
  { key: 'trending', label: 'Hot Zones', icon: Flame },
  { key: 'new_launch', label: 'New Launch', icon: Rocket },
];

// ── Main Component ──

export default function AIInvestmentFeed({ onPropertyClick, className }: AIInvestmentFeedProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { getPropertyImage } = useDefaultPropertyImage();
  const { addToComparison, isInComparison } = usePropertyComparison();
  const [category, setCategory] = useState<FeedCategory>('all');
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());

  // ── Fetch intelligence-enriched properties ──
  const { data: properties = [], isLoading, refetch } = useQuery({
    queryKey: ['ai-investment-feed', user?.id],
    queryFn: async () => {
      // For logged-in users, try AI ranking first
      if (user) {
        try {
          const { data: aiData } = await supabase.functions.invoke('ai-engine', {
            body: { mode: 'match_property', payload: { limit: 30 } },
          });
          const rankedIds = (aiData?.ranked_properties ?? []).map((r: any) => r.id);
          const scoreMap = new Map((aiData?.ranked_properties ?? []).map((r: any) => [r.id, r.ai_match_score_v2]));

          if (rankedIds.length > 0) {
            const { data: props } = await supabase.from('properties').select(SELECT_FIELDS).in('id', rankedIds);
            if (props?.length) {
              const map = new Map(props.map(p => [p.id, p]));
              return rankedIds
                .map((id: string) => {
                  const p = map.get(id);
                  if (!p) return null;
                  return { ...p, listing_type: p.listing_type as any, ai_match_score_v2: scoreMap.get(id) } as IntelligenceProperty;
                })
                .filter(Boolean) as IntelligenceProperty[];
            }
          }
        } catch {
          // fallback to direct query
        }
      }

      // Fallback: fetch top-scored properties
      const { data, error } = await supabase
        .from('properties')
        .select(SELECT_FIELDS)
        .eq('status', 'active')
        .not('price', 'is', null)
        .order('opportunity_score', { ascending: false, nullsFirst: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []).map(p => ({ ...p, listing_type: p.listing_type as any })) as IntelligenceProperty[];
    },
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // ── Saved state ──
  useEffect(() => {
    if (!user) return;
    supabase.from('saved_properties' as any).select('property_id').eq('user_id', user.id)
      .then(({ data }: any) => { if (data) setSavedSet(new Set(data.map((s: any) => s.property_id))); });
  }, [user]);

  const toggleSave = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) return;
    const isSaved = savedSet.has(id);
    setSavedSet(prev => {
      const next = new Set(prev);
      isSaved ? next.delete(id) : next.add(id);
      return next;
    });
    if (isSaved) {
      await (supabase.from('saved_properties' as any) as any).delete().eq('user_id', user.id).eq('property_id', id);
    } else {
      await (supabase.from('saved_properties' as any) as any).insert({ user_id: user.id, property_id: id });
    }
  }, [user, savedSet]);

  // ── Filter by category ──
  const filtered = useMemo(() => {
    if (category === 'all') return properties;
    return properties.filter(p => {
      switch (category) {
        case 'elite': return (p.opportunity_score ?? 0) >= 85;
        case 'price_drop': return (p.ai_estimated_price && p.price) ? p.ai_estimated_price > p.price * 1.05 : false;
        case 'rental_yield': return (p.rental_yield ?? 0) >= 6;
        case 'trending': return (p.market_heat_score ?? 0) >= 65;
        case 'new_launch': {
          const created = new Date(p.created_at);
          const daysAgo = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo <= 14;
        }
        default: return true;
      }
    });
  }, [properties, category]);

  const scroll = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });

  // ── Loading ──
  if (isLoading) {
    return (
      <section className={cn('space-y-4', className)}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <div className="flex gap-2"><Skeleton className="h-8 w-20 rounded-full" /><Skeleton className="h-8 w-24 rounded-full" /><Skeleton className="h-8 w-20 rounded-full" /></div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[280px] space-y-3">
              <Skeleton className="h-44 rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── Empty ──
  if (!properties.length) {
    return (
      <section className={cn('flex flex-col items-center justify-center py-14 text-center', className)}>
        <PackageOpen className="h-14 w-14 text-muted-foreground/30 mb-4" />
        <h3 className="text-sm font-bold text-foreground">No opportunities detected</h3>
        <p className="text-xs text-muted-foreground mt-1">Browse properties to unlock AI-powered recommendations</p>
        <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => navigate('/search')}>
          <Eye className="h-3.5 w-3.5" /> Explore Properties
        </Button>
      </section>
    );
  }

  return (
    <section className={cn('space-y-4', className)}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary via-chart-1 to-chart-3 flex items-center justify-center shadow-lg shadow-primary/25"
          >
            <Brain className="h-4.5 w-4.5 text-primary-foreground" />
          </motion.div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
              {user ? 'AI Investment Intelligence' : 'Investment Opportunities'}
            </h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {user ? 'Personalized opportunities powered by ASTRA AI' : 'Top investment picks this week'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => scroll('left')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => scroll('right')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {user && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => refetch()}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Category Pills ── */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={category === key ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'text-xs h-8 gap-1.5 shrink-0 rounded-full transition-all',
              category === key && 'shadow-md shadow-primary/20'
            )}
            onClick={() => setCategory(key)}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            {key === 'elite' && properties.filter(p => (p.opportunity_score ?? 0) >= 85).length > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[9px] ml-0.5 bg-chart-2/20 text-chart-2">
                {properties.filter(p => (p.opportunity_score ?? 0) >= 85).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* ── Feed Cards ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm text-muted-foreground">No properties in this category yet</p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((property, idx) => (
              <IntelligenceCard
                key={property.id}
                property={property}
                index={idx}
                isSaved={savedSet.has(property.id)}
                isInComparison={isInComparison(property.id)}
                onToggleSave={toggleSave}
                onCompare={(e) => { e.stopPropagation(); addToComparison(property); }}
                onClick={() => onPropertyClick(property)}
                getPropertyImage={getPropertyImage}
                isLoggedIn={!!user}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── CTA strip ── */}
      {user && (
        <div className="flex items-center justify-center gap-3 pt-1">
          <Button variant="outline" size="sm" className="text-xs gap-1.5 rounded-full" onClick={() => navigate('/recommendations')}>
            <Sparkles className="h-3.5 w-3.5" /> View All Recommendations
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1.5 rounded-full" onClick={() => navigate('/deal-finder')}>
            <Zap className="h-3.5 w-3.5" /> Deal Finder
          </Button>
        </div>
      )}
    </section>
  );
}

// ── Intelligence Card ──

function IntelligenceCard({
  property, index, isSaved, isInComparison, onToggleSave, onCompare, onClick, getPropertyImage, isLoggedIn,
}: {
  property: IntelligenceProperty;
  index: number;
  isSaved: boolean;
  isInComparison: boolean;
  onToggleSave: (e: React.MouseEvent, id: string) => void;
  onCompare: (e: React.MouseEvent) => void;
  onClick: () => void;
  getPropertyImage: (images: any, thumb: any) => string;
  isLoggedIn: boolean;
}) {
  const score = property.opportunity_score ?? property.investment_score ?? 0;
  const isElite = score >= 85;
  const tags = getAITags(property);
  const rentalYield = property.rental_yield ?? 0;
  const demandScore = property.demand_score ?? 0;
  const heatScore = property.market_heat_score ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className={cn(
        'flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px] rounded-2xl border bg-card overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1.5',
        isElite
          ? 'border-chart-2/40 shadow-lg shadow-chart-2/10 hover:shadow-xl hover:shadow-chart-2/20'
          : 'border-border/40 shadow-sm hover:shadow-lg'
      )}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <OptimizedPropertyImage
          src={getPropertyImage(property.images, property.thumbnail_url)}
          alt={property.title}
          className="group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />

        {/* Elite glow overlay */}
        {isElite && (
          <div className="absolute inset-0 bg-gradient-to-t from-chart-2/10 to-transparent pointer-events-none animate-pulse" style={{ animationDuration: '3s' }} />
        )}

        {/* Score ring */}
        {score > 0 && (
          <div className="absolute top-2.5 left-2.5">
            <OpportunityScoreRing score={score} />
          </div>
        )}

        {/* AI tags */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1">
          {tags.map((tag, i) => (
            <Badge key={i} variant="outline" className={cn('text-[9px] font-bold gap-0.5 border backdrop-blur-md bg-background/60', tag.color)}>
              <tag.icon className="h-2.5 w-2.5" /> {tag.label}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="absolute bottom-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {isLoggedIn && (
            <>
              <button
                onClick={(e) => onToggleSave(e, property.id)}
                className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
              >
                {isSaved ? <Heart className="h-3.5 w-3.5 fill-destructive text-destructive" /> : <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
              <button
                onClick={onCompare}
                className={cn(
                  'h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform',
                  isInComparison && 'ring-2 ring-primary'
                )}
              >
                <Scale className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </>
          )}
        </div>

        {/* Price */}
        <div className="absolute bottom-2.5 left-2.5">
          <div className="bg-background/85 backdrop-blur-md rounded-lg px-2 py-1 border border-border/30">
            <p className="text-sm font-black text-foreground leading-tight">
              <Price amount={property.price || 0} short />
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">{property.title}</h3>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-[10px] text-muted-foreground truncate">{property.city || property.location || 'Indonesia'}</span>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          {Number(property.bedrooms) > 0 && <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" /> {property.bedrooms}</span>}
          {Number(property.bathrooms) > 0 && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" /> {property.bathrooms}</span>}
          {Number(property.area_sqm) > 0 && <span className="flex items-center gap-0.5"><Maximize className="h-3 w-3" /> {property.area_sqm}m²</span>}
        </div>

        {/* Intelligence metrics strip */}
        <div className="flex items-center gap-2 pt-1.5 border-t border-border/30">
          {rentalYield > 0 && (
            <div className="flex items-center gap-0.5 text-[9px]">
              <BarChart3 className="h-2.5 w-2.5 text-chart-4" />
              <span className="font-semibold text-chart-4">{rentalYield.toFixed(1)}%</span>
              <span className="text-muted-foreground">yield</span>
            </div>
          )}
          {demandScore > 0 && (
            <div className="flex items-center gap-0.5 text-[9px]">
              <TrendingUp className="h-2.5 w-2.5 text-chart-1" />
              <span className="font-semibold text-chart-1">{demandScore}</span>
              <span className="text-muted-foreground">demand</span>
            </div>
          )}
          {heatScore > 0 && (
            <div className="flex items-center gap-0.5 text-[9px]">
              <Flame className="h-2.5 w-2.5 text-destructive" />
              <span className="font-semibold text-destructive">{heatScore}</span>
              <span className="text-muted-foreground">heat</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
