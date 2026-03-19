import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

// ── Types ──

export interface WealthFlow {
  id: string;
  flow_type: string;
  origin_country: string | null;
  destination_country: string;
  destination_city: string | null;
  flow_volume_usd: number;
  flow_velocity: number;
  confidence_score: number;
  trend_direction: 'accelerating' | 'stable' | 'decelerating' | 'reversing' | null;
  detected_at: string;
}

export interface WealthCreationIndex {
  id: string;
  city: string;
  district: string | null;
  capital_appreciation_rate: number;
  rental_yield_stability: number;
  liquidity_adjusted_roi: number;
  time_to_exit_months: number;
  absorption_rate: number;
  price_momentum: number;
  wealth_creation_score: number;
  wealth_tier: 'sovereign_grade' | 'institutional_grade' | 'premium' | 'standard' | 'speculative';
  yoy_change_pct: number;
}

export interface WealthConcentration {
  id: string;
  city: string;
  district: string | null;
  total_asset_value_usd: number;
  luxury_demand_index: number;
  concentration_tier: string;
  emerging_cluster: boolean;
  wealth_accumulation_velocity: number;
}

export interface IntergenerationalForecast {
  id: string;
  city: string;
  district: string | null;
  compound_growth_5y: number;
  compound_growth_10y: number;
  compound_growth_25y: number;
  district_resilience_score: number;
  projected_value_multiplier_10y: number;
  generational_wealth_score: number;
  wealth_preservation_tier: 'dynastic' | 'multi_generational' | 'generational' | 'medium_term' | 'short_term';
}

export interface WealthRisk {
  id: string;
  city: string;
  district: string | null;
  risk_type: string;
  risk_severity: number;
  risk_probability: number;
  potential_impact_pct: number;
  mitigation_strategy: string | null;
  alert_status: 'monitoring' | 'elevated' | 'critical' | 'triggered';
}

export interface WealthDashboard {
  summary: {
    total_wealth_flows: number;
    cities_indexed: number;
    sovereign_grade_cities: number;
    avg_wealth_score: number;
    total_asset_value_usd: number;
    critical_risks: number;
    dynastic_cities: number;
    top_wealth_city: string;
  };
  wealth_flows: WealthFlow[];
  wealth_index: WealthCreationIndex[];
  concentration_heatmap: WealthConcentration[];
  intergenerational_forecasts: IntergenerationalForecast[];
  risk_radar: WealthRisk[];
}

// ── Hooks ──

export function useWealthDashboard(enabled = true) {
  return useQuery({
    queryKey: ['wealth-intelligence-dashboard'],
    queryFn: async (): Promise<WealthDashboard> => {
      const { data, error } = await supabase.functions.invoke('wealth-intelligence-engine', {
        body: { mode: 'dashboard' },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 180_000,
  });
}

export function useWealthCreationIndex(enabled = true) {
  return useQuery({
    queryKey: ['wealth-creation-index'],
    queryFn: async (): Promise<WealthCreationIndex[]> => {
      const { data, error } = await supabase
        .from('wealth_creation_index')
        .select('*')
        .order('wealth_creation_score', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as unknown as WealthCreationIndex[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useWealthRiskRadar(enabled = true) {
  return useQuery({
    queryKey: ['wealth-risk-radar'],
    queryFn: async (): Promise<WealthRisk[]> => {
      const { data, error } = await supabase
        .from('wealth_risk_radar')
        .select('*')
        .order('risk_severity', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as WealthRisk[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useIntergenerationalForecasts(enabled = true) {
  return useQuery({
    queryKey: ['intergenerational-forecasts'],
    queryFn: async (): Promise<IntergenerationalForecast[]> => {
      const { data, error } = await supabase
        .from('intergenerational_asset_predictor')
        .select('*')
        .order('generational_wealth_score', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as IntergenerationalForecast[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useTriggerWealthEngine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { mode: string; params?: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke('wealth-intelligence-engine', {
        body: params,
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['wealth-intelligence-dashboard'] });
      qc.invalidateQueries({ queryKey: ['wealth-creation-index'] });
      qc.invalidateQueries({ queryKey: ['wealth-risk-radar'] });
      qc.invalidateQueries({ queryKey: ['intergenerational-forecasts'] });
      toast.success(`Wealth engine completed: ${variables.mode}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Wealth engine failed');
    },
  });
}
