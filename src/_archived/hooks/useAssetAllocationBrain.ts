import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

// ── Types ──

export interface CapitalRotation {
  id: string;
  city: string;
  district: string | null;
  cycle_phase: 'early_recovery' | 'expansion' | 'peak' | 'contraction' | 'trough';
  phase_confidence: number;
  rotation_signal: 'strong_buy' | 'accumulate' | 'hold' | 'reduce' | 'exit';
  liquidity_acceleration: number;
  momentum_score: number;
  mean_reversion_risk: number;
  estimated_phase_remaining_months: number;
}

export interface YieldOptimization {
  id: string;
  city: string;
  district: string | null;
  capital_appreciation_yield: number;
  cashflow_yield: number;
  blended_yield: number;
  risk_adjusted_yield: number;
  optimal_hold_period_months: number;
  recommended_allocation_pct: number;
  yield_tier: 'alpha_generator' | 'core_plus' | 'core' | 'value_add' | 'opportunistic';
  optimization_strategy: string | null;
}

export interface PortfolioGravity {
  id: string;
  city: string;
  district: string | null;
  capital_mass: number;
  investor_density: number;
  gravity_pull_score: number;
  saturation_index: number;
  is_saturated: boolean;
  network_reinforcement_active: boolean;
  gravity_tier: 'black_hole' | 'supermassive' | 'stellar' | 'planetary' | 'asteroid';
}

export interface SyndicationOpportunity {
  id: string;
  opportunity_name: string;
  city: string;
  syndication_type: string;
  target_capital_usd: number;
  minimum_ticket_usd: number;
  expected_irr_pct: number;
  expected_multiple: number;
  risk_rating: string;
  deal_thesis: string | null;
  status: string;
}

export interface RebalanceSignal {
  id: string;
  signal_type: string;
  city: string;
  district: string | null;
  urgency: 'immediate' | 'this_week' | 'this_month' | 'next_quarter';
  current_allocation_pct: number;
  recommended_allocation_pct: number;
  allocation_delta_pct: number;
  trigger_reason: string;
  action_recommendation: string | null;
  risk_if_ignored: string | null;
  confidence: number;
  is_executed: boolean;
}

export interface AABDashboard {
  summary: {
    markets_analyzed: number;
    strong_buy_markets: number;
    exit_signals: number;
    black_hole_zones: number;
    alpha_generators: number;
    syndication_pipeline: number;
    total_syndication_capital_usd: number;
    pending_rebalances: number;
    immediate_actions: number;
  };
  capital_rotation: CapitalRotation[];
  yield_optimization: YieldOptimization[];
  portfolio_gravity: PortfolioGravity[];
  syndication_opportunities: SyndicationOpportunity[];
  rebalance_signals: RebalanceSignal[];
}

// ── Hooks ──

export function useAABDashboard(enabled = true) {
  return useQuery({
    queryKey: ['aab-dashboard'],
    queryFn: async (): Promise<AABDashboard> => {
      const { data, error } = await supabase.functions.invoke('asset-allocation-brain', {
        body: { mode: 'dashboard' },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useCapitalRotation(enabled = true) {
  return useQuery({
    queryKey: ['capital-rotation'],
    queryFn: async (): Promise<CapitalRotation[]> => {
      const { data, error } = await supabase
        .from('aab_capital_rotation')
        .select('*')
        .order('momentum_score', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as CapitalRotation[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useYieldOptimization(enabled = true) {
  return useQuery({
    queryKey: ['yield-optimization'],
    queryFn: async (): Promise<YieldOptimization[]> => {
      const { data, error } = await supabase
        .from('aab_yield_optimizer')
        .select('*')
        .order('risk_adjusted_yield', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as YieldOptimization[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function usePortfolioGravity(enabled = true) {
  return useQuery({
    queryKey: ['portfolio-gravity'],
    queryFn: async (): Promise<PortfolioGravity[]> => {
      const { data, error } = await supabase
        .from('aab_portfolio_gravity')
        .select('*')
        .order('gravity_pull_score', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as PortfolioGravity[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useRebalanceSignals(enabled = true) {
  return useQuery({
    queryKey: ['rebalance-signals'],
    queryFn: async (): Promise<RebalanceSignal[]> => {
      const { data, error } = await supabase
        .from('aab_rebalance_signals')
        .select('*')
        .eq('is_executed', false)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as RebalanceSignal[];
    },
    enabled,
    staleTime: 15_000,
  });
}

export function useSyndicationOpportunities(enabled = true) {
  return useQuery({
    queryKey: ['syndication-opportunities'],
    queryFn: async (): Promise<SyndicationOpportunity[]> => {
      const { data, error } = await supabase
        .from('aab_syndication_opportunities')
        .select('*')
        .order('expected_irr_pct', { ascending: false })
        .limit(15);
      if (error) throw error;
      return (data ?? []) as unknown as SyndicationOpportunity[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useTriggerAAB() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { mode: string; params?: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke('asset-allocation-brain', {
        body: params,
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['aab-dashboard'] });
      qc.invalidateQueries({ queryKey: ['capital-rotation'] });
      qc.invalidateQueries({ queryKey: ['yield-optimization'] });
      qc.invalidateQueries({ queryKey: ['portfolio-gravity'] });
      qc.invalidateQueries({ queryKey: ['rebalance-signals'] });
      qc.invalidateQueries({ queryKey: ['syndication-opportunities'] });
      toast.success(`Allocation brain completed: ${variables.mode}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Allocation brain failed');
    },
  });
}
