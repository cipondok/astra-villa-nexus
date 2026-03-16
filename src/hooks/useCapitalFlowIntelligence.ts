import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ── Types ──

export type CapitalFlowSignal = 'CAPITAL_INFLOW' | 'CAPITAL_OUTFLOW' | 'SPECULATIVE_HEAT' | 'STABLE';
export type FlowStrength = 'STRONG_INFLOW' | 'MODERATE_ROTATION' | 'CAPITAL_EXIT_RISK';

export interface RegionFlowMetrics {
  velocity_trend: number;
  deal_trend: number;
  liquidity_trend: number;
  growth_acceleration: number;
  current_deal_score: number;
  current_liquidity: number;
  current_growth: number;
  listing_change: number;
  speculative_risk: boolean;
}

export interface RegionCapitalFlow {
  region: string;
  capital_flow_signal: CapitalFlowSignal;
  flow_strength: FlowStrength;
  strategic_market_note: string;
  metrics: RegionFlowMetrics;
}

export interface CapitalFlowResult {
  regions: RegionCapitalFlow[];
  total_regions: number;
  inflow_count: number;
  outflow_count: number;
  speculative_count: number;
  analyzed_at: string;
}

// ── Pure classifiers ──

export function classifyFlowSignal(
  velocityTrend: number,
  dealTrend: number,
  currDeal: number,
  liquidityTrend: number,
  listingChange: number,
  growthAccel: number,
  currGrowth: number,
): CapitalFlowSignal {
  // Speculative heat
  if (growthAccel > 15 && dealTrend > 10 && currGrowth > 65) return 'SPECULATIVE_HEAT';
  // Inflow
  if (velocityTrend > 0 && dealTrend > 3 && currDeal >= 45) return 'CAPITAL_INFLOW';
  // Outflow
  if (liquidityTrend < -5 && listingChange > 0) return 'CAPITAL_OUTFLOW';
  return 'STABLE';
}

export function classifyFlowStrength(
  signal: CapitalFlowSignal,
  velocityTrend: number,
  dealTrend: number,
  liquidityTrend: number,
): FlowStrength {
  if (signal === 'SPECULATIVE_HEAT') return 'CAPITAL_EXIT_RISK';
  if (signal === 'CAPITAL_INFLOW') {
    if (velocityTrend > 5 && dealTrend > 8) return 'STRONG_INFLOW';
    return 'MODERATE_ROTATION';
  }
  if (signal === 'CAPITAL_OUTFLOW') {
    if (liquidityTrend < -12) return 'CAPITAL_EXIT_RISK';
    return 'MODERATE_ROTATION';
  }
  return 'MODERATE_ROTATION';
}

// ── React hook ──

export function useCapitalFlowIntelligence(lookbackDays = 90, enabled = true) {
  return useQuery({
    queryKey: ['capital-flow-intelligence', lookbackDays],
    queryFn: async (): Promise<CapitalFlowResult> => {
      const { data, error } = await supabase.rpc('detect_capital_flow_trends', { p_lookback_days: lookbackDays });
      if (error) throw error;
      return data as unknown as CapitalFlowResult;
    },
    enabled,
    staleTime: 5 * 60_000,
    refetchInterval: 15 * 60_000,
  });
}
