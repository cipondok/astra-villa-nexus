import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Zap, MapPin, TrendingUp, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface HotspotCity {
  city: string;
  growth_score: number;
  new_listings_7d: number;
}

/**
 * Proactive discovery banner surfacing trending market hotspots.
 * Shows the top growing city with context, dismissable.
 */
export default function HotspotAlertBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  const { data: hotspot } = useQuery({
    queryKey: ['hotspot-alert'],
    queryFn: async (): Promise<HotspotCity | null> => {
      // Get city with most new listings in last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data, error } = await supabase
        .from('properties')
        .select('city')
        .eq('status', 'active')
        .gte('created_at', sevenDaysAgo)
        .not('city', 'is', null);

      if (error || !data?.length) return null;

      // Count by city
      const counts: Record<string, number> = {};
      for (const row of data) {
        if (row.city) counts[row.city] = (counts[row.city] || 0) + 1;
      }

      const topCity = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (!topCity || topCity[1] < 3) return null;

      return {
        city: topCity[0],
        growth_score: Math.min(99, Math.round(topCity[1] * 8)),
        new_listings_7d: topCity[1],
      };
    },
    staleTime: 30 * 60 * 1000,
  });

  if (!hotspot || dismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-chart-3/[0.08] via-chart-3/[0.04] to-transparent border-b border-chart-3/15">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
        {/* Content */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-chart-3/10 border border-chart-3/15 shrink-0">
            <Zap className="h-4 w-4 text-chart-3" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-foreground">Hotspot Alert</span>
              <span className="text-[10px] font-medium text-chart-3 bg-chart-3/10 px-1.5 py-0.5 rounded-full">
                +{hotspot.new_listings_7d} new this week
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              <MapPin className="h-3 w-3 inline mr-0.5" />
              {hotspot.city} is trending — <TrendingUp className="h-3 w-3 inline" /> {hotspot.growth_score}% growth signal
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => navigate(`/properties?location=${encodeURIComponent(hotspot.city)}`)}
            className={cn(
              "flex items-center gap-0.5 text-[11px] font-semibold text-chart-3",
              "hover:text-chart-3/80 transition-colors touch-press"
            )}
          >
            Explore <ChevronRight className="h-3 w-3" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-muted/60 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
