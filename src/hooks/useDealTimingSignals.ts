import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ── Types ──

export type DealSignal = 'STRONG_BUY' | 'ACCUMULATE' | 'HOLD' | 'EXIT_WARNING';
export type TimingConfidence = 'HIGH_CONVICTION' | 'MODERATE_CONVICTION' | 'EARLY_SIGNAL';

export interface DealTimingEntry {
  listing_id: string;
  title: string;
  city: string;
  price: number;
  deal_signal: DealSignal;
  confidence_level: TimingConfidence;
  strategic_reasoning: string;
  metrics: {
    investment_rank: number;
    growth_score: number;
    liquidity_score: number;
    demand_score: number;
    deal_score: number;
    rental_yield: number;
    market_cycle: string;
  };
}

export interface DealTimingResult {
  signals: DealTimingEntry[];
  total: number;
  strong_buy_count: number;
  accumulate_count: number;
  hold_count: number;
  exit_count: number;
  market_cycle: string;
  generated_at: string;
}

// ── Pure classifiers ──

export function classifyDealSignal(
  invRank: number,
  growth: number,
  demand: number,
  liquidity: number,
  cycle: string,
): DealSignal {
  if (invRank >= 65 && (cycle === 'RECOVERY' || cycle === 'EXPANSION')) return 'STRONG_BUY';
  if (growth >= 55 && demand < 60 && invRank >= 45) return 'ACCUMULATE';
  if (cycle === 'PEAK_RISK' && liquidity < 45) return 'EXIT_WARNING';
  return 'HOLD';
}

export function classifyTimingConfidence(
  signal: DealSignal,
  invRank: number,
  growth: number,
  demand: number,
  liquidity: number,
  dealScore: number,
  rentalYield: number,
): TimingConfidence {
  if (signal === 'STRONG_BUY') {
    if (invRank >= 80 && growth >= 60) return 'HIGH_CONVICTION';
    if (invRank >= 70) return 'MODERATE_CONVICTION';
    return 'EARLY_SIGNAL';
  }
  if (signal === 'ACCUMULATE') {
    if (growth >= 70 && demand < 45) return 'HIGH_CONVICTION';
    if (growth >= 60) return 'MODERATE_CONVICTION';
    return 'EARLY_SIGNAL';
  }
  if (signal === 'EXIT_WARNING') {
    if (liquidity < 30 && dealScore < 35) return 'HIGH_CONVICTION';
    if (liquidity < 40) return 'MODERATE_CONVICTION';
    return 'EARLY_SIGNAL';
  }
  // HOLD
  if (liquidity >= 55 && invRank >= 50 && rentalYield >= 4) return 'HIGH_CONVICTION';
  if (invRank >= 35) return 'MODERATE_CONVICTION';
  return 'EARLY_SIGNAL';
}

// ── React hook ──

export function useDealTimingSignals(limit = 15, enabled = true) {
  return useQuery({
    queryKey: ['deal-timing-signals', limit],
    queryFn: async (): Promise<DealTimingResult> => {
      const { data, error } = await supabase.rpc('generate_deal_timing_signals', { p_limit: limit });
      if (error) throw error;
      return data as unknown as DealTimingResult;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 180_000,
  });
}
