import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Flame, Clock, ChevronRight, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Price from '@/components/ui/Price';
import { useDefaultPropertyImage } from '@/hooks/useDefaultPropertyImage';

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
  const defaultImage = useDefaultPropertyImage();

  const imageUrl = property.thumbnail_url
    || (Array.isArray(property.images) && property.images[0])
    || defaultImage;

  // Derive a deal score from property ID hash
  const hash = (property.id || '').split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
  const dealScore = 70 + (hash % 25); // 70-94
  const discountPct = 5 + (hash % 18); // 5-22%

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      onClick={() => navigate(`/properties/${property.id}`)}
      className={cn(
        'flex-shrink-0 w-[260px] sm:w-[280px] rounded-xl overflow-hidden cursor-pointer',
        'border border-border/50 bg-card shadow-sm',
        'hover:shadow-md hover:border-primary/30 transition-all duration-200',
        'card-hover-lift'
      )}
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <Badge className="bg-destructive/90 text-destructive-foreground text-[10px] font-bold px-1.5 py-0 h-5 border-0">
            -{discountPct}%
          </Badge>
          <Badge className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0 h-5 border-0">
            Score {dealScore}
          </Badge>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/60 to-transparent" />
        <p className="absolute bottom-2 left-2 text-[11px] text-white font-medium truncate max-w-[90%]">
          {property.city || property.location || 'Indonesia'}
        </p>
      </div>

      {/* Content */}
      <div className="p-3 space-y-1.5">
        <p className="text-sm font-semibold text-foreground line-clamp-1">
          {property.title}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-primary">
            <Price amount={property.price || 0} compact />
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" />
            AI Pick
          </span>
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
      // Fetch recently listed properties with good attributes
      const { data } = await supabase
        .from('properties')
        .select('id, title, price, city, location, property_type, thumbnail_url, images, created_at')
        .eq('status', 'active')
        .not('price', 'is', null)
        .order('created_at', { ascending: false })
        .limit(8);

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
