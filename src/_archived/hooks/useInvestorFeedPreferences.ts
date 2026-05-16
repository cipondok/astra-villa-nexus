import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type StrategyType = 'aggressive_growth' | 'passive_income' | 'short_term_flip' | 'luxury_preservation';

export interface InvestorFeedPreference {
  id: string;
  user_id: string;
  strategy_type: StrategyType;
  weight_rental_yield: number;
  weight_appreciation: number;
  weight_deal_score: number;
  weight_liquidity: number;
  preferred_cities: string[];
  budget_min: number;
  budget_max: number;
  risk_tolerance: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export const STRATEGY_PRESETS: Record<StrategyType, { label: string; desc: string; weights: { yield: number; appreciation: number; deal: number; liquidity: number } }> = {
  aggressive_growth: {
    label: 'Aggressive Growth',
    desc: 'High appreciation, fast capital gains',
    weights: { yield: 10, appreciation: 40, deal: 30, liquidity: 20 },
  },
  passive_income: {
    label: 'Passive Income',
    desc: 'Stable rental yield, low volatility',
    weights: { yield: 45, appreciation: 10, deal: 15, liquidity: 30 },
  },
  short_term_flip: {
    label: 'Short-term Flipper',
    desc: 'Undervalued deals, high liquidity',
    weights: { yield: 10, appreciation: 15, deal: 40, liquidity: 35 },
  },
  luxury_preservation: {
    label: 'Luxury Capital',
    desc: 'Premium assets, stable long-term value',
    weights: { yield: 20, appreciation: 30, deal: 15, liquidity: 35 },
  },
};

export function useInvestorFeedPreferences() {
  return useQuery({
    queryKey: ['investor-feed-preferences'],
    queryFn: async (): Promise<InvestorFeedPreference | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await (supabase as any)
        .from('investor_feed_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveInvestorPreferences() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      strategy_type: StrategyType;
      weight_rental_yield: number;
      weight_appreciation: number;
      weight_deal_score: number;
      weight_liquidity: number;
      preferred_cities?: string[];
      budget_min?: number;
      budget_max?: number;
      risk_tolerance?: 'low' | 'medium' | 'high';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Login required');

      const { error } = await (supabase as any)
        .from('investor_feed_preferences')
        .upsert({
          user_id: user.id,
          ...input,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investor-feed-preferences'] });
      qc.invalidateQueries({ queryKey: ['investor-feed'] });
      toast.success('Investment strategy saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save preferences');
    },
  });
}
