import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

// ── Types ──

export interface UrbanGrowthSignal {
  id: string;
  city: string;
  province: string | null;
  country: string;
  signal_type: string;
  signal_strength: number;
  signal_data: Record<string, unknown>;
  trend_direction: 'accelerating' | 'stable' | 'decelerating' | null;
  detected_at: string;
  created_at: string;
}

export interface ExpansionProbability {
  id: string;
  city: string;
  district: string | null;
  country: string;
  liquidity_momentum: number;
  absorption_acceleration: number;
  price_appreciation_slope: number;
  investor_entry_velocity: number;
  infrastructure_score: number;
  population_growth_score: number;
  expansion_probability: number;
  expansion_phase: 'early_signal' | 'momentum_building' | 'breakout' | 'rapid_growth' | 'maturation' | 'plateau';
  confidence_level: number;
  time_horizon_months: number;
  computed_at: string;
}

export interface DeveloperOpportunity {
  id: string;
  city: string;
  district: string | null;
  opportunity_type: string;
  opportunity_score: number;
  estimated_roi_pct: number | null;
  supply_deficit_units: number | null;
  demand_forecast_12m: number | null;
  recommended_property_type: string | null;
  risk_level: 'low' | 'medium' | 'high' | 'very_high' | null;
  strategy_brief: string | null;
  valid_until: string | null;
}

export interface ExpansionSequence {
  id: string;
  city: string;
  country: string;
  capital_inflow_potential: number;
  market_maturity: number;
  regulatory_openness: number;
  digital_readiness: number;
  vendor_ecosystem_depth: number;
  sequence_rank: number;
  composite_score: number;
  recommended_entry_timing: 'immediate' | 'q1_next' | 'q2_next' | 'h2_next' | 'monitor';
  entry_strategy: string | null;
  vendor_activation_plan: string | null;
  capital_deployment_strategy: string | null;
}

export interface CityExpansionDashboard {
  summary: {
    total_signals: number;
    cities_tracked: number;
    breakout_cities: number;
    developer_opportunities: number;
    top_expansion_city: string;
    top_expansion_score: number;
    immediate_entries: number;
  };
  recent_signals: UrbanGrowthSignal[];
  expansion_index: ExpansionProbability[];
  developer_opportunities: DeveloperOpportunity[];
  expansion_sequence: ExpansionSequence[];
}

// ── Hooks ──

export function useCityExpansionDashboard(enabled = true) {
  return useQuery({
    queryKey: ['city-expansion-dashboard'],
    queryFn: async (): Promise<CityExpansionDashboard> => {
      const { data, error } = await supabase.functions.invoke('city-expansion-intelligence', {
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

export function useExpansionProbabilityIndex(enabled = true) {
  return useQuery({
    queryKey: ['expansion-probability-index'],
    queryFn: async (): Promise<ExpansionProbability[]> => {
      const { data, error } = await supabase
        .from('city_expansion_probability')
        .select('*')
        .order('expansion_probability', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as unknown as ExpansionProbability[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useDeveloperOpportunities(enabled = true) {
  return useQuery({
    queryKey: ['developer-opportunities'],
    queryFn: async (): Promise<DeveloperOpportunity[]> => {
      const { data, error } = await supabase
        .from('city_developer_opportunities')
        .select('*')
        .order('opportunity_score', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as DeveloperOpportunity[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useExpansionSequencing(enabled = true) {
  return useQuery({
    queryKey: ['expansion-sequencing'],
    queryFn: async (): Promise<ExpansionSequence[]> => {
      const { data, error } = await supabase
        .from('city_expansion_sequencing')
        .select('*')
        .order('sequence_rank')
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as ExpansionSequence[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useTriggerExpansionEngine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { mode: string; params?: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke('city-expansion-intelligence', {
        body: params,
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['city-expansion-dashboard'] });
      qc.invalidateQueries({ queryKey: ['expansion-probability-index'] });
      qc.invalidateQueries({ queryKey: ['developer-opportunities'] });
      qc.invalidateQueries({ queryKey: ['expansion-sequencing'] });
      toast.success(`City expansion engine completed: ${variables.mode}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Expansion engine failed');
    },
  });
}
