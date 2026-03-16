import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface RecentView {
  property_id: string;
  last_viewed: string;
  title: string;
  image: string;
  city: string;
  price: number;
}

export default function RecentlyViewedStrip() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: recentViews = [] } = useQuery({
    queryKey: ['recently-viewed', user?.id],
    queryFn: async (): Promise<RecentView[]> => {
      if (!user?.id) return [];

      // Get recent distinct property views from behavior tracking
      const { data: views, error } = await supabase
        .from('ai_behavior_tracking')
        .select('property_id, created_at')
        .eq('user_id', user.id)
        .eq('event_type', 'view')
        .not('property_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error || !views?.length) return [];

      // Deduplicate by property_id, keep latest
      const seen = new Map<string, string>();
      for (const v of views) {
        if (v.property_id && !seen.has(v.property_id)) {
          seen.set(v.property_id, v.created_at);
        }
      }
      const propertyIds = [...seen.keys()].slice(0, 8);
      if (!propertyIds.length) return [];

      const { data: properties } = await supabase
        .from('properties')
        .select('id, title, images, city, price')
        .in('id', propertyIds);

      if (!properties) return [];

      return propertyIds
        .map((pid) => {
          const p = properties.find((pr) => pr.id === pid);
          if (!p) return null;
          const imgs = p.images as string[] | null;
          return {
            property_id: pid,
            last_viewed: seen.get(pid) || '',
            title: p.title || 'Property',
            image: imgs?.[0] || '/placeholder.svg',
            city: p.city || '',
            price: p.price || 0,
          };
        })
        .filter(Boolean) as RecentView[];
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  if (!user || recentViews.length < 2) return null;

  const formatPrice = (p: number) => {
    if (p >= 1_000_000_000) return `Rp ${(p / 1_000_000_000).toFixed(1)}B`;
    if (p >= 1_000_000) return `Rp ${(p / 1_000_000).toFixed(0)}M`;
    return `Rp ${p.toLocaleString()}`;
  };

  return (
    <div className="w-full py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Continue Browsing</h3>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-0.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View All <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Horizontal scroll strip */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory overscroll-x-contain">
          {recentViews.map((item) => (
            <button
              key={item.property_id}
              onClick={() => navigate(`/property/${item.property_id}`)}
              className={cn(
                "flex-shrink-0 snap-start group",
                "w-[140px] sm:w-[160px] rounded-xl overflow-hidden",
                "border border-border/40 bg-card shadow-sm",
                "hover:shadow-md hover:border-primary/20 transition-all duration-200",
                "text-left touch-press"
              )}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-1 right-1 bg-background/80 backdrop-blur-sm text-[9px] text-muted-foreground px-1.5 py-0.5 rounded-md">
                  {formatDistanceToNow(new Date(item.last_viewed), { addSuffix: true })}
                </div>
              </div>
              <div className="p-2 space-y-0.5">
                <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{item.city}</p>
                <p className="text-xs font-bold text-primary">{formatPrice(item.price)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
