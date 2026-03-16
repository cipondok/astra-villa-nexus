import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// ── Types ──

export type StrategySignal = 'OPTIMAL' | 'STABLE' | 'DIVERSIFY' | 'GROWTH_GAP' | 'CRITICAL_REBALANCE' | 'NO_PORTFOLIO';
export type RebalanceAction = 'ACQUIRE_GROWTH_ZONE' | 'HOLD_STABLE_INCOME' | 'EXIT_WEAKENING_ASSET' | 'START_ACQUIRING';
export type PortfolioOutlook = 'STRONG_WEALTH_GROWTH' | 'BALANCED_STRATEGY' | 'RISK_EXPOSURE_RISING' | 'NOT_APPLICABLE';

export interface PortfolioHolding {
  id: string;
  title: string;
  city: string;
  property_type: string;
  price: number;
  growth: number;
  liquidity: number;
  yield: number;
  deal_score: number;
}

export interface PortfolioStrategyResult {
  portfolio_id: string;
  strategy_signal: StrategySignal;
  recommended_rebalance_action: RebalanceAction;
  diversification_insight: string;
  portfolio_outlook: PortfolioOutlook;
  metrics: {
    total_assets: number;
    avg_growth: number;
    avg_liquidity: number;
    avg_yield: number;
    avg_deal_score: number;
    national_growth_benchmark: number;
    max_city: string;
    max_city_pct: number;
    max_type: string;
    max_type_pct: number;
    concentration_risk: boolean;
    growth_imbalance: boolean;
  };
  holdings: PortfolioHolding[];
  analyzed_at: string;
}

// ── Pure classifiers ──

export function detectConcentrationRisk(maxCityPct: number, maxTypePct: number, totalAssets: number): boolean {
  if (totalAssets < 2) return false;
  return maxCityPct >= 60 || maxTypePct >= 70;
}

export function detectGrowthImbalance(avgGrowth: number, nationalBenchmark: number): boolean {
  return avgGrowth < nationalBenchmark - 10;
}

export function classifyOutlook(
  concentrationRisk: boolean,
  growthImbalance: boolean,
  avgGrowth: number,
  nationalBenchmark: number,
  avgLiquidity: number,
  avgYield: number,
): PortfolioOutlook {
  if (concentrationRisk && growthImbalance) return 'RISK_EXPOSURE_RISING';
  if (!concentrationRisk && !growthImbalance && avgGrowth >= nationalBenchmark + 5 && avgLiquidity >= 50 && avgYield >= 4) return 'STRONG_WEALTH_GROWTH';
  return 'BALANCED_STRATEGY';
}

export function classifyRebalanceAction(
  concentrationRisk: boolean,
  growthImbalance: boolean,
  avgGrowth: number,
  nationalBenchmark: number,
  avgLiquidity: number,
  avgYield: number,
): RebalanceAction {
  if (concentrationRisk) return 'ACQUIRE_GROWTH_ZONE';
  if (growthImbalance && avgLiquidity >= 50) return 'EXIT_WEAKENING_ASSET';
  if (growthImbalance) return 'HOLD_STABLE_INCOME';
  return 'HOLD_STABLE_INCOME';
}

// ── React hook ──

export function usePortfolioStrategy(enabled = true) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['portfolio-strategy', user?.id],
    queryFn: async (): Promise<PortfolioStrategyResult> => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.rpc('analyze_portfolio_strategy', { p_user_id: user.id });
      if (error) throw error;
      return data as unknown as PortfolioStrategyResult;
    },
    enabled: enabled && !!user,
    staleTime: 5 * 60_000,
    refetchInterval: 15 * 60_000,
  });
}
