import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface InvestorMatch {
  property_id: string;
  title: string;
  city: string | null;
  property_type: string;
  price: number;
  thumbnail_url: string | null;
  location: string;
  listing_type: string;
  match_confidence: number;
  signals: Record<string, number>;
  rental_yield_pct: number;
  roi_pct: number;
  liquidity_score: number;
  deal_score: number;
  strategy_tag: string;
  suggested_offer: { low: number; high: number };
  exit_timing_months: number;
  demand_heat: number;
}

export interface InvestorMatchResult {
  matches: InvestorMatch[];
  count: number;
  total_evaluated: number;
  investor_signal: Record<string, unknown>;
  weights: Record<string, number>;
  computed_at: string;
}

/**
 * Fetch AI-generated property matches for the current authenticated investor.
 */
export function useInvestorMatches(topN = 5) {
  const { user } = useAuth();

  return useQuery<InvestorMatchResult | null>({
    queryKey: ['investor-matches', user?.id, topN],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase.functions.invoke('generate-investor-matches', {
        body: { user_id: user.id, top_n: topN },
      });

      if (error) throw error;
      return data as InvestorMatchResult;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60_000, // 5 minutes
  });
}

/**
 * Admin: generate matches for any investor user.
 */
export function useGenerateMatchesForUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, topN = 10 }: { userId: string; topN?: number }) => {
      const { data, error } = await supabase.functions.invoke('generate-investor-matches', {
        body: { user_id: userId, top_n: topN },
      });
      if (error) throw error;
      return data as InvestorMatchResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investor-matches'] });
    },
  });
}
