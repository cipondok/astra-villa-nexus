import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ── Types ──

export type OpportunityLevel = 'PRIME_INVESTMENT' | 'HIGH_POTENTIAL' | 'STABLE_OPTION' | 'SPECULATIVE_RISK';
export type InvestorAction = 'ACQUIRE_NOW' | 'MONITOR_ENTRY' | 'LONG_TERM_HOLD';

export interface InvestmentRanking {
  listing_id: string;
  title: string;
  city: string;
  price: number;
  investment_rank_score: number;
  opportunity_level: OpportunityLevel;
  key_strength: string;
  investor_action_signal: InvestorAction;
  metrics: {
    growth_score: number;
    deal_score: number;
    rental_yield: number;
    liquidity_score: number;
    demand_score: number;
  };
}

export interface InvestmentRankingResult {
  rankings: InvestmentRanking[];
  total: number;
  prime_count: number;
  high_count: number;
  stable_count: number;
  speculative_count: number;
  ranked_at: string;
}

// ── Pure classification helpers ──

export function classifyOpportunity(composite: number): OpportunityLevel {
  if (composite >= 75) return 'PRIME_INVESTMENT';
  if (composite >= 55) return 'HIGH_POTENTIAL';
  if (composite >= 35) return 'STABLE_OPTION';
  return 'SPECULATIVE_RISK';
}

export function classifyAction(composite: number, dealScore: number): InvestorAction {
  if (composite >= 70 && dealScore >= 60) return 'ACQUIRE_NOW';
  if (composite >= 45) return 'MONITOR_ENTRY';
  return 'LONG_TERM_HOLD';
}

export function detectKeyStrength(
  growthScore: number,
  dealScore: number,
  rentalYield: number,
  liquidityScore: number
): 'growth' | 'deal' | 'yield' | 'liquidity' {
  const yieldNorm = Math.min(100, rentalYield * 12.5);
  const scores = [
    { key: 'growth' as const, val: growthScore },
    { key: 'deal' as const, val: dealScore },
    { key: 'yield' as const, val: yieldNorm },
    { key: 'liquidity' as const, val: liquidityScore },
  ];
  return scores.sort((a, b) => b.val - a.val)[0].key;
}

// ── React hook ──

export function useInvestmentRanking(limit = 15, enabled = true) {
  return useQuery({
    queryKey: ['investment-ranking', limit],
    queryFn: async (): Promise<InvestmentRankingResult> => {
      const { data, error } = await supabase.rpc('rank_investment_attractiveness', { p_limit: limit });
      if (error) throw error;
      return data as unknown as InvestmentRankingResult;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 180_000,
  });
}
