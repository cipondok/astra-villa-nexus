import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

export interface DealHunterOpportunity {
  id: string;
  property_id: string;
  deal_opportunity_signal_score: number;
  deal_strength_index: number;
  undervaluation_percent: number;
  estimated_fair_value: number;
  deal_classification: 'hot_deal' | 'silent_opportunity' | 'long_term_value' | 'speculative';
  urgency_score: number;
  sell_probability_30d: number;
  price_velocity: number;
  optimal_entry_window_days: number;
  deal_tier: 'public' | 'vip' | 'institutional';
  signals: string[];
  signal_metadata: Record<string, any>;
  surfaced_at: string;
  expires_at: string | null;
  scan_version: number;
  // Joined property fields
  property?: {
    title: string;
    price: number;
    city: string;
    property_type: string;
    thumbnail_url: string | null;
    bedrooms: number | null;
    area_sqm: number | null;
  };
}

/** Fetch top deal hunter opportunities */
export function useDealHunterFeed(limit = 20) {
  return useQuery({
    queryKey: ['deal-hunter-feed', limit],
    queryFn: async (): Promise<DealHunterOpportunity[]> => {
      const { data, error } = await supabase
        .from('deal_hunter_opportunities' as any)
        .select('*, property:properties!deal_hunter_opportunities_property_id_fkey(title, price, city, property_type, thumbnail_url, bedrooms, area_sqm)')
        .gte('deal_opportunity_signal_score', 30)
        .order('deal_opportunity_signal_score', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as DealHunterOpportunity[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Fetch hot deals for homepage hero */
export function useDealHunterHero() {
  return useQuery({
    queryKey: ['deal-hunter-hero'],
    queryFn: async (): Promise<DealHunterOpportunity[]> => {
      const { data, error } = await supabase
        .from('deal_hunter_opportunities' as any)
        .select('*, property:properties!deal_hunter_opportunities_property_id_fkey(title, price, city, property_type, thumbnail_url, bedrooms, area_sqm)')
        .in('deal_classification', ['hot_deal', 'silent_opportunity'])
        .gte('urgency_score', 40)
        .order('urgency_score', { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data || []) as unknown as DealHunterOpportunity[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Run deal hunter scan (admin trigger) */
export function useRunDealHunterScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'deal_hunter_scan' },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['deal-hunter-feed'] });
      queryClient.invalidateQueries({ queryKey: ['deal-hunter-hero'] });
      const count = data?.opportunities_found || 0;
      if (count > 0) {
        toast.success(`Deal Hunter: ${count} opportunities found, ${data.alerts_created || 0} alerts sent`);
      } else {
        toast.info('Deal Hunter scan complete — no new opportunities');
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Deal Hunter scan failed');
    },
  });
}

/** Classification metadata */
export const DEAL_CLASSIFICATIONS = {
  hot_deal: { label: 'Hot Deal', color: 'text-red-500 bg-red-500/10', icon: '🔥' },
  silent_opportunity: { label: 'Silent Opportunity', color: 'text-blue-500 bg-blue-500/10', icon: '🤫' },
  long_term_value: { label: 'Long-term Value', color: 'text-emerald-500 bg-emerald-500/10', icon: '📈' },
  speculative: { label: 'Speculative', color: 'text-amber-500 bg-amber-500/10', icon: '⚡' },
} as const;

export const DEAL_TIERS = {
  public: { label: 'Public', color: 'text-muted-foreground' },
  vip: { label: 'VIP', color: 'text-primary' },
  institutional: { label: 'Institutional', color: 'text-purple-500' },
} as const;
