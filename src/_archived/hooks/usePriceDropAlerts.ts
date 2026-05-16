import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AlertTier = 'elite_deal' | 'opportunity' | 'minor' | 'none';

export interface PriceDropDeal {
  property_id: string;
  property_title: string;
  city: string;
  old_price: number;
  new_price: number;
  drop_percentage: number;
  changed_at: string;
  opportunity_score: number;
  demand_heat_score: number;
  rental_yield: number;
  investment_score: number;
  property_image: string | null;
  alert_tier: AlertTier;
  ai_undervaluation: string;
}

export const ALERT_TIER_CONFIG = {
  elite_deal: {
    label: 'Elite Deal',
    emoji: '🔥',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/30',
    glow: 'shadow-[0_0_12px_hsl(var(--gold-primary)/0.25)]',
    threshold: 10,
  },
  opportunity: {
    label: 'Opportunity',
    emoji: '📈',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    glow: '',
    threshold: 5,
  },
  minor: {
    label: 'Minor Drop',
    emoji: '📉',
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/30',
    glow: '',
    threshold: 3,
  },
  none: {
    label: 'No Alert',
    emoji: '',
    color: 'text-muted-foreground',
    bg: 'bg-muted/20 border-border/30',
    glow: '',
    threshold: 0,
  },
} as const;

interface UsePriceDropDealsOptions {
  minDropPct?: number;
  city?: string | null;
  minScore?: number;
  limit?: number;
  enabled?: boolean;
}

export function usePriceDropDeals(options: UsePriceDropDealsOptions = {}) {
  const { minDropPct = 3, city = null, minScore = 0, limit = 50, enabled = true } = options;

  return useQuery({
    queryKey: ['price-drop-deals', minDropPct, city, minScore, limit],
    queryFn: async (): Promise<PriceDropDeal[]> => {
      const { data, error } = await supabase.rpc('get_price_drop_deals' as any, {
        p_min_drop_pct: minDropPct,
        p_city: city,
        p_min_score: minScore,
        p_limit: limit,
      });
      if (error) throw error;
      return (data || []) as unknown as PriceDropDeal[];
    },
    enabled,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/** Summary stats from the price drop deals */
export function usePriceDropStats() {
  const { data: deals, ...rest } = usePriceDropDeals({ limit: 200 });

  const stats = {
    total: deals?.length || 0,
    elite: deals?.filter(d => d.alert_tier === 'elite_deal').length || 0,
    opportunity: deals?.filter(d => d.alert_tier === 'opportunity').length || 0,
    minor: deals?.filter(d => d.alert_tier === 'minor').length || 0,
    avgDrop: deals?.length
      ? Math.round((deals.reduce((s, d) => s + d.drop_percentage, 0) / deals.length) * 10) / 10
      : 0,
    topCities: Object.entries(
      (deals || []).reduce<Record<string, number>>((acc, d) => {
        acc[d.city] = (acc[d.city] || 0) + 1;
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => ({ city, count })),
  };

  return { stats, ...rest };
}
