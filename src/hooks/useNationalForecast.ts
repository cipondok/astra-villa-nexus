import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ── Types ──

export type PriceForecast = 'STRONG_GROWTH' | 'MODERATE_GROWTH' | 'STABLE' | 'DOWNSIDE_RISK';
export type ClimatePhase = 'EXPANSION_CYCLE' | 'SELECTIVE_OPPORTUNITY' | 'RISK_CONTROL';

export interface EmergingRegion {
  city: string;
  growth_score: number;
  demand_score: number;
  liquidity_score: number;
  demand_acceleration: number;
  liquidity_improvement: number;
  hotspot_score: number;
}

export interface NationalForecastResult {
  national_price_forecast: PriceForecast;
  emerging_growth_regions: EmergingRegion[];
  investment_climate_phase: ClimatePhase;
  macro_outlook_summary: string;
  composite_score: number;
  current_signals: {
    growth: number;
    demand: number;
    liquidity: number;
    deal_probability: number;
  };
  trends: {
    growth_trend: number;
    demand_trend: number;
    liquidity_trend: number;
    deal_trend: number;
  };
  lookback_days: number;
  forecasted_at: string;
}

// ── Pure classifiers ──

export function classifyPriceForecast(
  growthTrend: number,
  demandTrend: number,
  currGrowth: number,
): PriceForecast {
  if (growthTrend > 10 && demandTrend > 8 && currGrowth >= 60) return 'STRONG_GROWTH';
  if (growthTrend > 3 && currGrowth >= 45 && demandTrend >= 0) return 'MODERATE_GROWTH';
  if (Math.abs(growthTrend) <= 5 && Math.abs(demandTrend) <= 5) return 'STABLE';
  return 'DOWNSIDE_RISK';
}

export function classifyClimatePhase(
  composite: number,
  growthTrend: number,
  demandTrend: number,
): ClimatePhase {
  if (composite >= 60 && growthTrend > 5 && demandTrend > 3) return 'EXPANSION_CYCLE';
  if (composite >= 40 && (growthTrend > 0 || demandTrend > 0)) return 'SELECTIVE_OPPORTUNITY';
  return 'RISK_CONTROL';
}

export function isEmergingRegion(
  demandAccel: number,
  liqImprove: number,
  growthScore: number,
): boolean {
  return demandAccel > 3 || liqImprove > 3 || growthScore >= 55;
}

// ── React hook ──

export function useNationalForecast(lookbackDays = 90, enabled = true) {
  return useQuery({
    queryKey: ['national-forecast', lookbackDays],
    queryFn: async (): Promise<NationalForecastResult> => {
      const { data, error } = await supabase.rpc('forecast_national_market', { p_lookback_days: lookbackDays });
      if (error) throw error;
      return data as unknown as NationalForecastResult;
    },
    enabled,
    staleTime: 5 * 60_000,
    refetchInterval: 15 * 60_000,
  });
}
