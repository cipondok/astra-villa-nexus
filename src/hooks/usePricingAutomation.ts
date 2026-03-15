import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ── Types ──

export type PricingSignal = 'REDUCE_PRICE' | 'INCREASE_PRICE' | 'MAINTAIN_PRICE';
export type ConfidenceLevel = 'HIGH' | 'MODERATE' | 'LOW';

export interface PricingAdjustment {
  listing_id: string;
  title: string;
  city: string;
  price: number;
  days_on_market: number;
  pricing_adjustment_signal: PricingSignal;
  confidence_level: ConfidenceLevel;
  market_reasoning: string;
  metrics: {
    deal_score: number;
    prev_deal_score: number;
    deal_trend: number;
    demand_signal: number;
    demand_momentum: number;
    liquidity: number;
    growth: number;
    stability_index: number;
  };
}

export interface PricingAutomationResult {
  adjustments: PricingAdjustment[];
  total: number;
  reduce_count: number;
  increase_count: number;
  maintain_count: number;
  analyzed_at: string;
}

// ── Pure classifiers (mirror SQL logic for testing) ──

export function classifyPricingSignal(
  dealTrend: number,
  dealScore: number,
  dom: number,
  demandMomentum: number,
  demandSignal: number,
  liquidity: number,
): PricingSignal {
  // Reduce trigger
  if ((dealTrend < -10 || (dealScore < 35 && dom > 60)) && demandMomentum <= 5) {
    return 'REDUCE_PRICE';
  }
  // Increase trigger
  if (demandMomentum > 10 && demandSignal >= 60 && liquidity >= 55) {
    return 'INCREASE_PRICE';
  }
  return 'MAINTAIN_PRICE';
}

export function classifyConfidence(
  signal: PricingSignal,
  dealTrend: number,
  dom: number,
  demandMomentum: number,
  growth: number,
  stabilityIndex: number,
): ConfidenceLevel {
  if (signal === 'REDUCE_PRICE') {
    if (dealTrend < -20 && dom > 90) return 'HIGH';
    if (dealTrend < -10) return 'MODERATE';
    return 'LOW';
  }
  if (signal === 'INCREASE_PRICE') {
    if (demandMomentum > 20 && growth >= 60) return 'HIGH';
    if (demandMomentum > 10) return 'MODERATE';
    return 'LOW';
  }
  // MAINTAIN
  if (stabilityIndex >= 70 && Math.abs(dealTrend) <= 5) return 'HIGH';
  if (stabilityIndex >= 40) return 'MODERATE';
  return 'LOW';
}

export function computeStabilityIndex(liquidity: number, dealScore: number): number {
  if (liquidity > 0 && dealScore > 0) return 100 - Math.abs(liquidity - dealScore);
  return 50;
}

// ── React hook ──

export function usePricingAutomation(limit = 15, enabled = true) {
  return useQuery({
    queryKey: ['pricing-automation', limit],
    queryFn: async (): Promise<PricingAutomationResult> => {
      const { data, error } = await supabase.rpc('detect_pricing_adjustments', { p_limit: limit });
      if (error) throw error;
      return data as unknown as PricingAutomationResult;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 180_000,
  });
}
