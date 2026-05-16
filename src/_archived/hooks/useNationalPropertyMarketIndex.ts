import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { detectMarketCycle, type MacroCycleResult } from './useMarketCycleDetector';

// ── Types ──

export type InvestmentClimate = 'STRONG_BUY_CYCLE' | 'SELECTIVE_OPPORTUNITY' | 'RISK_CONTROL_PHASE';
export type MomentumLevel = 'HIGH' | 'MODERATE' | 'LOW';

export interface RegionalLeader {
  city: string;
  demand: number;
  growth: number;
  rental_yield: number;
  investment_score: number;
  market_status: string;
  growth_rate: number;
  composite: number;
}

export interface NationalMarketIndexData {
  national_demand: number;
  national_growth: number;
  national_liquidity: number;
  national_price_index: number;
  national_investment_score: number;
  momentum_score: number;
  total_properties: number;
  total_cities: number;
  regional_leaders: RegionalLeader[];
  generated_at: string;
}

export interface InvestmentClimateResult {
  climate: InvestmentClimate;
  climate_label: string;
  climate_emoji: string;
  macro_summary: string;
}

export interface NationalMarketIndexResult {
  raw: NationalMarketIndexData;
  cycle: MacroCycleResult;
  momentum_level: MomentumLevel;
  climate: InvestmentClimateResult;
}

// ── Pure classification logic ──

export function classifyMomentum(score: number): MomentumLevel {
  if (score >= 65) return 'HIGH';
  if (score >= 40) return 'MODERATE';
  return 'LOW';
}

export function classifyInvestmentClimate(
  demand: number,
  growth: number,
  liquidity: number,
  investmentScore: number
): InvestmentClimateResult {
  // Composite: investment_score * 0.30 + demand * 0.25 + growth * 0.25 + liquidity * 0.20
  const composite = Math.round(
    investmentScore * 0.30 + demand * 0.25 + growth * 0.25 + liquidity * 0.20
  );

  if (composite >= 65) {
    return {
      climate: 'STRONG_BUY_CYCLE',
      climate_label: 'Strong Buy Cycle',
      climate_emoji: '🟢',
      macro_summary: `National investment signals are strongly positive (index: ${composite}). Demand, growth, and liquidity aligned across regions. Favorable conditions for portfolio expansion — prioritize high-growth corridors and undervalued markets before the cycle matures.`,
    };
  }

  if (composite >= 40) {
    return {
      climate: 'SELECTIVE_OPPORTUNITY',
      climate_label: 'Selective Opportunity',
      climate_emoji: '🟡',
      macro_summary: `Mixed market signals with pockets of opportunity (index: ${composite}). National demand moderate but select regions showing above-average growth. Focus on data-driven selection — target cities with strong infrastructure catalysts and proven rental demand.`,
    };
  }

  return {
    climate: 'RISK_CONTROL_PHASE',
    climate_label: 'Risk Control Phase',
    climate_emoji: '🔴',
    macro_summary: `National market under pressure with subdued demand and liquidity (index: ${composite}). Defensive positioning recommended — preserve capital, avoid leveraged acquisitions, and monitor recovery signals in tier-1 cities for re-entry timing.`,
  };
}

export function buildNationalIndex(raw: NationalMarketIndexData): NationalMarketIndexResult {
  const cycle = detectMarketCycle({
    demand_index: raw.national_demand,
    price_index: raw.national_price_index,
    confidence_level: raw.national_investment_score,
  });

  return {
    raw,
    cycle,
    momentum_level: classifyMomentum(raw.momentum_score),
    climate: classifyInvestmentClimate(
      raw.national_demand,
      raw.national_growth,
      raw.national_liquidity,
      raw.national_investment_score
    ),
  };
}

// ── React hook ──

export function useNationalPropertyMarketIndex(enabled = true) {
  return useQuery({
    queryKey: ['national-property-market-index'],
    queryFn: async (): Promise<NationalMarketIndexResult> => {
      const { data, error } = await supabase.rpc('get_national_property_market_index');
      if (error) throw error;
      const raw = data as unknown as NationalMarketIndexData;
      return buildNationalIndex(raw);
    },
    enabled,
    staleTime: 120_000,
    refetchInterval: 300_000,
  });
}
