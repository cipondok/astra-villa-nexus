import React, { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, MapPin, Bed, Bath, Maximize, ChevronRight, RefreshCw, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const MobileHomeFeed: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch AI recommendations for logged-in users, trending for guests
  const { data: properties, isLoading, refetch } = useQuery({
    queryKey: ['mobile-feed', user?.id, refreshKey],
    queryFn: async () => {
      if (user) {
        const { data } = await supabase.functions.invoke('ai-match-engine-v2', {
          body: { user_id: user.id, limit: 12 },
        });
        if (data?.recommendations?.length) {
          const ids = data.recommendations.map((r: any) => r.property_id);
          const { data: props } = await supabase
            .from('properties')
            .select('id, title, price, city, state, bedrooms, bathrooms, area_sqm, thumbnail_url, property_type, listing_type')
            .in('id', ids)
            .eq('status', 'active');
          // Maintain AI ranking order
          const propMap = new Map((props || []).map(p => [p.id, p]));
          return ids.map((id: string) => {
            const prop = propMap.get(id);
            const rec = data.recommendations.find((r: any) => r.property_id === id);
            return prop ? { ...prop, matchScore: rec?.match_score || 0 } : null;
          }).filter(Boolean);
        }
      }
      // Guest fallback: trending properties
      const { data: props } = await supabase
        .from('properties')
        .select('id, title, price, city, state, bedrooms, bathrooms, area_sqm, thumbnail_url, property_type, listing_type')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12);
      return (props || []).map((p: any) => ({ ...p, matchScore: 0 }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const formatPrice = (price: number) => {
    if (price >= 1_000_000_000) return `Rp ${(price / 1_000_000_000).toFixed(1)}M`;
    if (price >= 1_000_000) return `Rp ${(price / 1_000_000).toFixed(0)}Jt`;
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/30">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              {user ? 'For You' : 'Trending'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {user ? 'AI-powered recommendations' : 'Popular properties'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setRefreshKey(k => k + 1); refetch(); }}
              className="p-2 rounded-full bg-muted/50 active:scale-95 transition-transform"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </button>
            {user && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-primary/10 border border-gold-primary/20">
                <Sparkles className="h-3.5 w-3.5 text-gold-primary" />
                <span className="text-xs font-semibold text-gold-primary">AI</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property Cards */}
      <div className="px-4 py-3 space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-2xl" />
          ))
        ) : (
          (properties || []).map((property: any, idx: number) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(`/properties/${property.id}`)}
              className="group relative rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={property.thumbnail_url || '/placeholder.svg'}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Match Score Badge */}
                {property.matchScore > 0 && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-gold-primary/90 backdrop-blur-sm">
                    <Star className="h-3 w-3 text-background fill-background" />
                    <span className="text-xs font-bold text-background">{property.matchScore}%</span>
                  </div>
                )}

                {/* Listing Type */}
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm">
                  <span className="text-[10px] font-semibold text-foreground uppercase">
                    {property.listing_type === 'rent' ? 'Sewa' : 'Dijual'}
                  </span>
                </div>

                {/* Price overlay */}
                <div className="absolute bottom-3 left-3">
                  <span className="text-xl font-bold text-white drop-shadow-lg">
                    {formatPrice(property.price)}
                  </span>
                  {property.listing_type === 'rent' && (
                    <span className="text-xs text-white/80 ml-1">/bulan</span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-3.5">
                <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1.5">
                  {property.title}
                </h3>
                <div className="flex items-center gap-1 text-muted-foreground mb-2.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="text-xs line-clamp-1">
                    {[property.city, property.state].filter(Boolean).join(', ')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {property.bedrooms && (
                    <span className="flex items-center gap-1">
                      <Bed className="h-3.5 w-3.5" /> {property.bedrooms}
                    </span>
                  )}
                  {property.bathrooms && (
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5" /> {property.bathrooms}
                    </span>
                  )}
                  {property.area_sqm && (
                    <span className="flex items-center gap-1">
                      <Maximize className="h-3.5 w-3.5" /> {property.area_sqm}m²
                    </span>
                  )}
                  {property.property_type && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium capitalize">
                      {property.property_type}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default MobileHomeFeed;
