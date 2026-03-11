import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ── Types ──

export interface AllocationCity {
  city: string;
  allocation_pct: number;
  allocation_amount: number;
  risk_tier: string;
  cycle_phase: string;
  expected_yield: number;
  expected_growth: number;
  demand_heat: number;
}

export interface CapitalAllocationResult {
  allocation_matrix: AllocationCity[];
  portfolio_volatility: number;
  expected_annual_return: number;
  wealth_growth_10y: number;
  cycle_phase: string;
  confidence_score: number;
  macro_signals: Record<string, string>;
  risk_preference: string;
  budget: number;
}

export interface RebalancingSignal {
  signal_type: string;
  severity: string;
  affected_property_id?: string;
  affected_city?: string;
  current_allocation_pct?: number;
  recommended_allocation_pct?: number;
  action: string;
  reasoning: string;
  expected_impact_pct: number;
}

export interface RebalancingResult {
  total_portfolio_value: number;
  property_count: number;
  city_distribution: Record<string, number>;
  signals: RebalancingSignal[];
  rebalancing_urgency: string;
  generated_at: string;
}

export interface EntrySignal {
  city: string;
  signal_type: string;
  timing_confidence: number;
  upside_multiplier: number;
  liquidity_risk: number;
  price_momentum: number;
  volume_trend: string;
  macro_alignment_score: number;
  window_opens_at: string;
  window_closes_at: string;
  metadata: Record<string, any>;
}

export interface EntryTimingResult {
  entry_signals: EntrySignal[];
  top_opportunity: EntrySignal | null;
  markets_scanned: number;
  generated_at: string;
}

export interface ExitScenario {
  name: string;
  strategy_type: string;
  holding_period: number;
  exit_price: number;
  profit: number;
  profit_pct: number;
  tax_impact: number;
  net_profit: number;
  reasoning: string;
}

export interface ExitStrategyResult {
  property_id?: string;
  city: string;
  purchase_price: number;
  scenarios: ExitScenario[];
  recommended_strategy: string;
  peak_probability: number;
  tax_efficiency_score: number;
  optimal_exit_window: string;
  reasoning: string;
}

export interface WealthTrajectoryPoint {
  year: number;
  net_worth: number;
  annual_cashflow: number;
  cumulative_invested: number;
}

export interface WealthSimulationResult {
  persona: string;
  initial_capital: number;
  monthly_contribution: number;
  projection_years: number;
  net_worth_trajectory: WealthTrajectoryPoint[];
  cashflow_curve: { year: number; rental_income: number; expenses: number; net_cashflow: number }[];
  risk_heatmap: Record<string, any>;
  compounding_efficiency: number;
  final_net_worth: { pessimistic: number; expected: number; optimistic: number };
  total_return_pct: number;
  sharpe_ratio: number;
  max_drawdown_pct: number;
  generated_at: string;
}

export interface DealReadinessResult {
  property_id?: string;
  city: string;
  price: number;
  readiness_score: number;
  due_diligence_summary: Record<string, any>;
  financing_structure: Record<string, any>;
  legal_readiness_score: number;
  liquidity_assessment: Record<string, any>;
  execution_packet: Record<string, any>;
  generated_at: string;
}

// ── Hooks ──

export function useCapitalAllocation() {
  return useMutation({
    mutationFn: async (params: { budget: number; risk_preference: string }): Promise<CapitalAllocationResult> => {
      const { data, error } = await supabase.functions.invoke('fund-intelligence', {
        body: { pipeline: 'capital_allocation', ...params },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    onSuccess: () => toast.success('Capital allocation analysis complete'),
    onError: (err: Error) => toast.error(err.message || 'Allocation failed'),
  });
}

export function usePortfolioRebalancing() {
  return useMutation({
    mutationFn: async (): Promise<RebalancingResult> => {
      const { data, error } = await supabase.functions.invoke('fund-intelligence', {
        body: { pipeline: 'portfolio_rebalancing' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    onSuccess: (data) => {
      const urgency = data.rebalancing_urgency;
      if (urgency === 'critical') toast.error(`Critical rebalancing needed: ${data.signals.length} signals`);
      else toast.success(`Rebalancing analysis: ${data.signals.length} signals detected`);
    },
    onError: (err: Error) => toast.error(err.message || 'Rebalancing analysis failed'),
  });
}

export function useEntryTiming() {
  return useMutation({
    mutationFn: async (params?: { city?: string }): Promise<EntryTimingResult> => {
      const { data, error } = await supabase.functions.invoke('fund-intelligence', {
        body: { pipeline: 'entry_timing', city: params?.city || 'all' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    onSuccess: (data) => toast.success(`Scanned ${data.markets_scanned} markets — ${data.entry_signals.length} entry signals`),
    onError: (err: Error) => toast.error(err.message || 'Entry timing failed'),
  });
}

export function useExitStrategy() {
  return useMutation({
    mutationFn: async (params: { property_id?: string; purchase_price?: number; city?: string; holding_years?: number }): Promise<ExitStrategyResult> => {
      const { data, error } = await supabase.functions.invoke('fund-intelligence', {
        body: { pipeline: 'exit_strategy', ...params },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    onSuccess: () => toast.success('Exit strategy scenarios generated'),
    onError: (err: Error) => toast.error(err.message || 'Exit strategy failed'),
  });
}

export function useWealthSimulation() {
  return useMutation({
    mutationFn: async (params: { persona: string; initial_capital: number; monthly_contribution?: number; projection_years?: number }): Promise<WealthSimulationResult> => {
      const { data, error } = await supabase.functions.invoke('fund-intelligence', {
        body: { pipeline: 'wealth_simulation', ...params },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    onSuccess: () => toast.success('Wealth simulation complete'),
    onError: (err: Error) => toast.error(err.message || 'Wealth simulation failed'),
  });
}

export function useDealReadiness() {
  return useMutation({
    mutationFn: async (params: { property_id?: string; price?: number; city?: string }): Promise<DealReadinessResult> => {
      const { data, error } = await supabase.functions.invoke('fund-intelligence', {
        body: { pipeline: 'deal_readiness', ...params },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    onSuccess: (data) => toast.success(`Deal readiness: ${data.readiness_score}%`),
    onError: (err: Error) => toast.error(err.message || 'Deal readiness check failed'),
  });
}

export function useFullFundAnalysis() {
  return useMutation({
    mutationFn: async (params: { budget: number; risk_preference: string; persona: string; initial_capital: number }) => {
      const { data, error } = await supabase.functions.invoke('fund-intelligence', {
        body: { pipeline: 'full_fund_analysis', ...params },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    onSuccess: () => toast.success('Full fund intelligence analysis complete'),
    onError: (err: Error) => toast.error(err.message || 'Fund analysis failed'),
  });
}
