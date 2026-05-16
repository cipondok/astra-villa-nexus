import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ── Types ──

export type CycleSignal = 'OPTIMIZATION_IMPROVING' | 'STABLE_CONDITION' | 'INTERVENTION_REQUIRED';
export type PrimaryAction = 'PRICING_ADJUSTMENT' | 'SEO_OPTIMIZATION' | 'BUYER_MATCH_ESCALATION' | 'MONITOR';
export type PerformanceTrend = 'IMPROVING' | 'STABLE' | 'DECLINING';
export type NextFocus = 'DUAL_PRICE_SEO' | 'CONVERSION_PUSH' | 'VISIBILITY_BOOST' | 'MOMENTUM_MAINTAIN' | 'STANDARD_MONITOR';

export interface OptimizationMetrics {
  deal_score: number;
  deal_trend: number;
  seo_score: number;
  demand: number;
  demand_trend: number;
  liquidity: number;
  liquidity_trend: number;
}

export interface ListingOptimization {
  listing_id: string;
  title: string;
  city: string;
  price: number;
  optimization_cycle_signal: CycleSignal;
  primary_action_triggered: PrimaryAction;
  performance_trend: PerformanceTrend;
  next_cycle_focus: NextFocus;
  metrics: OptimizationMetrics;
}

export interface OptimizationSummary {
  improving: number;
  stable: number;
  intervention: number;
  health_ratio: number;
}

export interface MarketplaceOptimizationResult {
  listings: ListingOptimization[];
  total_processed: number;
  summary: OptimizationSummary;
  analyzed_at: string;
}

// ── Pure classifiers ──

export function classifyCycleSignal(dealTrend: number, currDeal: number, seoScore: number, demandTrend: number, currDemand: number): CycleSignal {
  const perf = classifyPerformanceTrend(dealTrend);
  const action = classifyPrimaryAction(dealTrend, currDeal, seoScore, demandTrend, currDemand);
  if (perf === 'IMPROVING' && action === 'MONITOR') return 'OPTIMIZATION_IMPROVING';
  if (perf === 'DECLINING' || action === 'PRICING_ADJUSTMENT' || action === 'SEO_OPTIMIZATION') return 'INTERVENTION_REQUIRED';
  return 'STABLE_CONDITION';
}

export function classifyPerformanceTrend(dealTrend: number): PerformanceTrend {
  if (dealTrend > 5) return 'IMPROVING';
  if (dealTrend >= -3) return 'STABLE';
  return 'DECLINING';
}

export function classifyPrimaryAction(
  dealTrend: number,
  currDeal: number,
  seoScore: number,
  demandTrend: number,
  currDemand: number,
): PrimaryAction {
  if (dealTrend < -8 && currDeal < 40) return 'PRICING_ADJUSTMENT';
  if (seoScore < 35) return 'SEO_OPTIMIZATION';
  if (demandTrend > 5 && currDemand >= 50) return 'BUYER_MATCH_ESCALATION';
  if (dealTrend < -3) return 'PRICING_ADJUSTMENT';
  return 'MONITOR';
}

export function classifyNextFocus(action: PrimaryAction, seoScore: number, perf: PerformanceTrend): NextFocus {
  if (action === 'PRICING_ADJUSTMENT' && seoScore < 40) return 'DUAL_PRICE_SEO';
  if (action === 'BUYER_MATCH_ESCALATION') return 'CONVERSION_PUSH';
  if (action === 'SEO_OPTIMIZATION') return 'VISIBILITY_BOOST';
  if (perf === 'IMPROVING') return 'MOMENTUM_MAINTAIN';
  return 'STANDARD_MONITOR';
}

// ── React hook ──

export function useMarketplaceOptimization(lookbackDays = 60, enabled = true) {
  return useQuery({
    queryKey: ['marketplace-optimization', lookbackDays],
    queryFn: async (): Promise<MarketplaceOptimizationResult> => {
      const { data, error } = await supabase.rpc('run_marketplace_optimization_cycle', { p_lookback_days: lookbackDays });
      if (error) throw error;
      return data as unknown as MarketplaceOptimizationResult;
    },
    enabled,
    staleTime: 5 * 60_000,
    refetchInterval: 15 * 60_000,
  });
}
