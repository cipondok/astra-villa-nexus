import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ── Types ──

export type MacroCyclePhase = 'EXPANSION' | 'PEAK_RISK' | 'CORRECTION' | 'RECOVERY';
export type CycleConfidence = 'HIGH' | 'MODERATE' | 'EARLY_SIGNAL';
export type InvestmentSignal =
  | 'AGGRESSIVE_ACCUMULATION' | 'SELECTIVE_BUY' | 'MONITOR_AND_PREPARE'
  | 'TAKE_PROFIT' | 'REDUCE_EXPOSURE' | 'HEDGE_POSITIONS'
  | 'CAPITAL_PRESERVATION' | 'SELECTIVE_VALUE_BUY' | 'DEFENSIVE_ALLOCATION'
  | 'STRATEGIC_ACCUMULATION' | 'GRADUAL_ENTRY' | 'WATCH_AND_WAIT'
  | 'BALANCED_HOLD';

export interface RegionalBreakdown {
  city: string;
  demand: number;
  growth: number;
  liquidity: number;
  hotspot: number;
}

export interface MarketCyclePrediction {
  market_cycle_phase: MacroCyclePhase;
  confidence_level: CycleConfidence;
  macro_trend_summary: string;
  strategic_investment_signal: InvestmentSignal;
  composite_score: number;
  current_signals: {
    demand: number;
    liquidity: number;
    growth: number;
    deal_probability: number;
  };
  trends: {
    demand_momentum: number;
    liquidity_trend: number;
    growth_trend: number;
    deal_trend: number;
  };
  regional_breakdown: RegionalBreakdown[];
  lookback_days: number;
  analyzed_at: string;
}

// ── Pure classifiers (mirror SQL logic for unit testing) ──

export function classifyCyclePhase(
  growthTrend: number,
  demandMomentum: number,
  currGrowth: number,
  currDemand: number,
  liquidityTrend: number,
  currLiquidity: number,
  dealTrend: number,
  currDealProb: number,
  prevLiquidity: number,
): MacroCyclePhase {
  // EXPANSION
  if (growthTrend > 5 && demandMomentum > 5 && currGrowth >= 50) return 'EXPANSION';
  // PEAK RISK
  if (currGrowth >= 60 && currDemand >= 55 && liquidityTrend < -5) return 'PEAK_RISK';
  // CORRECTION
  if (demandMomentum < -5 && dealTrend < -5 && currDemand < 50) return 'CORRECTION';
  // RECOVERY
  if (liquidityTrend >= 0 && prevLiquidity < currLiquidity && currDemand < 50 && currGrowth < 50) return 'RECOVERY';

  // Fallback by composite
  const composite = Math.round(currDemand * 0.30 + currGrowth * 0.30 + currLiquidity * 0.20 + currDealProb * 0.20);
  if (composite >= 65) return 'EXPANSION';
  if (composite >= 45) return 'RECOVERY';
  return 'CORRECTION';
}

export function classifyCycleConfidence(
  phase: MacroCyclePhase,
  growthTrend: number,
  demandMomentum: number,
  currDemand: number,
  liquidityTrend: number,
  currLiquidity: number,
  dealTrend: number,
  currDealProb: number,
): CycleConfidence {
  if (phase === 'EXPANSION') {
    if (growthTrend > 15 && demandMomentum > 15 && currDemand >= 60) return 'HIGH';
    if (growthTrend > 8) return 'MODERATE';
    return 'EARLY_SIGNAL';
  }
  if (phase === 'PEAK_RISK') {
    if (liquidityTrend < -15 && currLiquidity < 45) return 'HIGH';
    if (liquidityTrend < -8) return 'MODERATE';
    return 'EARLY_SIGNAL';
  }
  if (phase === 'CORRECTION') {
    if (demandMomentum < -15 && dealTrend < -15 && currDealProb < 35) return 'HIGH';
    if (demandMomentum < -8) return 'MODERATE';
    return 'EARLY_SIGNAL';
  }
  // RECOVERY
  if (liquidityTrend > 10 && demandMomentum > 0) return 'HIGH';
  if (liquidityTrend > 3) return 'MODERATE';
  return 'EARLY_SIGNAL';
}

// ── React hook ──

export function useMarketCyclePrediction(lookbackDays = 90, enabled = true) {
  return useQuery({
    queryKey: ['market-cycle-prediction', lookbackDays],
    queryFn: async (): Promise<MarketCyclePrediction> => {
      const { data, error } = await supabase.rpc('predict_market_cycle_phase', { p_lookback_days: lookbackDays });
      if (error) throw error;
      return data as unknown as MarketCyclePrediction;
    },
    enabled,
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
  });
}
