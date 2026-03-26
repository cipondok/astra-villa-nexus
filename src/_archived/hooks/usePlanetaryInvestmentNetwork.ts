import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ── Types ──

export interface InvestorNode {
  id: string;
  investor_id: string;
  investor_type: string;
  city: string | null;
  country: string;
  capital_pool_usd: number;
  deployed_capital_usd: number;
  available_capital_usd: number;
  risk_tolerance: string;
  preferred_asset_classes: string[];
  geographic_exposure: Record<string, number>;
  lifetime_roi_pct: number;
  total_transactions: number;
  win_rate_pct: number;
  network_centrality_score: number;
  influence_score: number;
  cluster_id: string | null;
  activity_velocity: number;
  capital_deployment_momentum: number;
  computed_at: string;
}

export interface DealRoute {
  id: string;
  deal_id: string;
  deal_type: string;
  city: string;
  country: string;
  deal_value_usd: number;
  expected_roi_pct: number;
  risk_level: string;
  urgency_score: number;
  matched_investor_count: number;
  routing_confidence: number;
  market_timing_score: number;
  routing_status: string;
  created_at: string;
}

export interface LearningCycle {
  id: string;
  learning_cycle_id: string;
  cycle_type: string;
  transactions_analyzed: number;
  prediction_accuracy_before: number;
  prediction_accuracy_after: number;
  accuracy_delta: number;
  capital_efficiency_score: number;
  market_regime_detected: string | null;
  global_sharpe_ratio: number | null;
  top_learnings: string[];
  computed_at: string;
}

export interface LiquidityAmplification {
  id: string;
  city: string;
  country: string;
  transaction_velocity_30d: number;
  velocity_acceleration: number;
  liquidity_depth_score: number;
  network_effect_multiplier: number;
  flywheel_stage: string;
  amplification_factor: number;
  projected_volume_90d_usd: number | null;
  emerging_market_participation_pct: number;
  computed_at: string;
}

export interface MarketLeadership {
  id: string;
  region: string;
  market_share_pct: number;
  total_network_aum_usd: number;
  active_investor_count: number;
  institutional_partner_count: number;
  data_coverage_pct: number;
  pricing_authority_score: number;
  intelligence_dependency_score: number;
  switching_cost_index: number;
  network_lock_in_score: number;
  data_moat_depth_years: number;
  evolution_phase: string;
  phase_confidence: number;
  next_phase_trigger: string | null;
  estimated_phase_transition_months: number | null;
  computed_at: string;
}

export interface APINDashboard {
  summary: {
    total_investors: number;
    total_aum_usd: number;
    deals_routed: number;
    prediction_accuracy: number;
    avg_liquidity_depth: number;
    learning_cycles: number;
    market_regime: string;
    regions_covered: number;
  };
  investors: InvestorNode[];
  deals: DealRoute[];
  learning: LearningCycle[];
  liquidity: LiquidityAmplification[];
  leadership: MarketLeadership[];
}

// ── Hooks ──

export function useAPINDashboard(enabled = true) {
  return useQuery({
    queryKey: ['apin-dashboard'],
    queryFn: async (): Promise<APINDashboard> => {
      const { data, error } = await supabase.functions.invoke('planetary-investment-network', {
        body: { mode: 'dashboard' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useInvestorGraph(enabled = true) {
  return useQuery({
    queryKey: ['apin-investor-graph'],
    queryFn: async (): Promise<InvestorNode[]> => {
      const { data, error } = await supabase
        .from('apin_investor_graph')
        .select('*')
        .order('influence_score', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as InvestorNode[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useDealRouting(enabled = true) {
  return useQuery({
    queryKey: ['apin-deal-routing'],
    queryFn: async (): Promise<DealRoute[]> => {
      const { data, error } = await supabase
        .from('apin_deal_routing')
        .select('*')
        .order('urgency_score', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as unknown as DealRoute[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useLiquidityAmplification(enabled = true) {
  return useQuery({
    queryKey: ['apin-liquidity-amplification'],
    queryFn: async (): Promise<LiquidityAmplification[]> => {
      const { data, error } = await supabase
        .from('apin_liquidity_amplification')
        .select('*')
        .order('liquidity_depth_score', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as LiquidityAmplification[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useMarketLeadership(enabled = true) {
  return useQuery({
    queryKey: ['apin-market-leadership'],
    queryFn: async (): Promise<MarketLeadership[]> => {
      const { data, error } = await supabase
        .from('apin_market_leadership')
        .select('*')
        .order('market_share_pct', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as MarketLeadership[];
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useTriggerAPINEngine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { mode: string; params?: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke('planetary-investment-network', {
        body: params,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['apin-dashboard'] });
      qc.invalidateQueries({ queryKey: ['apin-investor-graph'] });
      qc.invalidateQueries({ queryKey: ['apin-deal-routing'] });
      qc.invalidateQueries({ queryKey: ['apin-liquidity-amplification'] });
      qc.invalidateQueries({ queryKey: ['apin-market-leadership'] });
      toast.success(`APIN engine completed: ${variables.mode}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'APIN engine failed');
    },
  });
}
