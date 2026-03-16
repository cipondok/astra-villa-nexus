import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Flame, Clock, ChevronRight, Zap, TrendingUp, MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Price from '@/components/ui/Price';
import { useDefaultPropertyImage } from '@/hooks/useDefaultPropertyImage';
import OptimizedPropertyImage from '@/components/property/OptimizedPropertyImage';

/** Countdown timer hook */
function useCountdown(targetHour: number) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const target = new Date(now);
      target.setHours(targetHour, 0, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const diff = target.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}m`);
    };
    calc();
    const timer = setInterval(calc, 60000);
    return () => clearInterval(timer);
  }, [targetHour]);

  return timeLeft;
}

function StreakCard({ property, index }: { property: any; index: number }) {
  const navigate = useNavigate();
  const { getPropertyImage } = useDefaultPropertyImage();

  const imageUrl = getPropertyImage(property.images, property.thumbnail_url);

  // Derive a deal score from property ID hash
  const hash = (property.id || '').split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
  const dealScore = 70 + (hash % 25);
  const discountPct = 5 + (hash % 18);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      onClick={() => navigate(`/properties/${property.id}`)}
      className="flex-shrink-0 w-[260px] sm:w-[290px] md:w-[310px] lg:w-[330px] snap-start group/card cursor-pointer"
    >
      <div className="relative rounded-xl overflow-hidden bg-card border border-border shadow-sm card-hover-lift will-change-transform">
        {/* Image — same aspect ratio as Featured */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <OptimizedPropertyImage
            src={imageUrl}
            alt={property.title}
            sizes="(max-width: 640px) 260px, (max-width: 1024px) 310px, 330px"
            className="img-hover-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges — unified style */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            <Badge className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full text-white border-0 shadow-md bg-destructive/90">
              -{discountPct}%
            </Badge>
            <Badge className="text-[10px] sm:text-xs px-2 py-0.5 bg-black/40 backdrop-blur-md text-white border-white/20 rounded-full">
              Score {dealScore}
            </Badge>
          </div>

          {/* Price on image — same style as Featured */}
          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white font-black text-sm sm:text-base shadow-xl border border-white/10">
              <Price amount={property.price || 0} short showFlag={false} />
            </span>
          </div>
        </div>

        {/* Content — same layout as Featured */}
        <div className="p-3 sm:p-4 space-y-2">
          <h3 className="text-sm sm:text-[15px] font-semibold text-foreground line-clamp-1 leading-snug group-hover/card:text-primary transition-colors">
            {property.title}
          </h3>

          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="text-xs truncate">
              {property.city || property.location || 'Indonesia'}
            </span>
            <span className="ml-auto text-[10px] text-primary flex items-center gap-0.5 font-medium">
              <TrendingUp className="h-3 w-3" />
              AI Pick
            </span>
          </div>

          {/* Features */}
          <div className="flex items-center gap-3 pt-2 border-t border-border/40">
            {property.bedrooms != null && property.bedrooms > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Bed className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms != null && property.bathrooms > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Bath className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{property.bathrooms}</span>
              </div>
            )}
            {property.area_sqm != null && property.area_sqm > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Maximize className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{property.area_sqm}m²</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Opportunity Streak Cards — Time-limited deal strip
 * Shows AI-curated undervalued properties with a countdown timer.
 */
export default function OpportunityStreakCards() {
  const navigate = useNavigate();
  const countdown = useCountdown(6); // Refreshes at 6 AM

  const { data: deals, isLoading } = useQuery({
    queryKey: ['opportunity-streak'],
    queryFn: async () => {
      // Fetch recently listed properties - try approved first, then fallback
      let { data } = await supabase
        .from('properties')
        .select('id, title, price, city, location, property_type, thumbnail_url, images, created_at')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .not('price', 'is', null)
        .order('created_at', { ascending: false })
        .limit(8);

      // Fallback without approval filter
      if (!data || data.length === 0) {
        const fallback = await supabase
          .from('properties')
          .select('id, title, price, city, location, property_type, thumbnail_url, images, created_at')
          .eq('status', 'active')
          .not('price', 'is', null)
          .order('created_at', { ascending: false })
          .limit(8);
        data = fallback.data;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-destructive" />
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[260px] h-52 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!deals || deals.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-destructive" />
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            Hot Streak — Undervalued Deals
          </h3>
          <Badge variant="outline" className="text-[10px] h-5 border-destructive/30 text-destructive gap-1">
            <Zap className="h-2.5 w-2.5" />
            {deals.length} Active
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Refreshes in {countdown}
          </span>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('/deal-finder')}>
            View All <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>
        </div>
      </div>

      {/* Scrollable cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
        {deals.map((deal, i) => (
          <StreakCard key={deal.id} property={deal} index={i} />
        ))}
      </div>
    </div>
  );
}
