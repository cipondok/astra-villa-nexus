import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ── Types ──

export interface DevelopmentCoordination {
  id: string;
  city: string;
  country: string;
  district: string | null;
  construction_pipeline_units: number;
  construction_capacity_pct: number;
  infrastructure_investment_usd: number;
  infrastructure_readiness_score: number;
  population_migration_net: number;
  active_supply_units: number;
  supply_demand_ratio: number;
  synchronization_score: number;
  bottleneck_type: string | null;
  bottleneck_severity: number;
  coordination_status: string;
  computed_at: string;
}

export interface SignalRoute {
  id: string;
  signal_type: string;
  source_entity_type: string;
  target_entity_type: string;
  city: string;
  signal_strength: number;
  signal_payload: Record<string, unknown>;
  propagation_speed: string;
  is_amplified: boolean;
  amplification_factor: number;
  routing_status: string;
  routed_at: string | null;
  created_at: string;
}

export interface MarketEquilibrium {
  id: string;
  city: string;
  country: string;
  housing_shortage_index: number;
  speculative_oversupply_risk: number;
  rental_affordability_index: number;
  investor_return_index: number;
  equilibrium_score: number;
  equilibrium_phase: string;
  mean_reversion_pressure: number;
  intervention_urgency: string;
  recommended_supply_action: string | null;
  recommended_demand_action: string | null;
  control_loop_confidence: number;
  computed_at: string;
}

export interface ProsperityIndex {
  id: string;
  city: string;
  country: string;
  wealth_accessibility_score: number;
  housing_stability_score: number;
  urban_livability_score: number;
  economic_resilience_score: number;
  prosperity_composite_score: number;
  prosperity_tier: string;
  trajectory: string;
  forecast_5y_score: number | null;
  policy_recommendations: string[];
  computed_at: string;
}

export interface GovernanceModule {
  id: string;
  country: string;
  country_name: string;
  ownership_restriction_level: string;
  foreign_ownership_rules: Record<string, unknown>;
  tax_regime_summary: Record<string, unknown>;
  zoning_flexibility_score: number;
  ppp_readiness_score: number;
  smart_city_integration_level: string;
  digital_governance_score: number;
  platform_adoption_phase: string;
  active_city_count: number;
  policy_stability_score: number;
  geopolitical_risk_score: number;
  is_active: boolean;
}

export interface CEOSDashboard {
  summary: {
    cities_coordinated: number;
    critical_interventions: number;
    avg_prosperity_score: number;
    pending_signals: number;
    avg_sync_score: number;
    governance_modules: number;
    sovereign_partners: number;
  };
  development: DevelopmentCoordination[];
  equilibrium: MarketEquilibrium[];
  prosperity: ProsperityIndex[];
  signals: SignalRoute[];
  governance: GovernanceModule[];
}

// ── Hooks ──

export function useCEOSDashboard(enabled = true) {
  return useQuery({
    queryKey: ['ceos-dashboard'],
    queryFn: async (): Promise<CEOSDashboard> => {
      const { data, error } = await supabase.functions.invoke('civilization-economic-os', {
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

export function useMarketEquilibrium(enabled = true) {
  return useQuery({
    queryKey: ['ceos-market-equilibrium'],
    queryFn: async (): Promise<MarketEquilibrium[]> => {
      const { data, error } = await supabase
        .from('ceos_market_equilibrium')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as unknown as MarketEquilibrium[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useProsperityIndex(enabled = true) {
  return useQuery({
    queryKey: ['ceos-prosperity-index'],
    queryFn: async (): Promise<ProsperityIndex[]> => {
      const { data, error } = await supabase
        .from('ceos_prosperity_index')
        .select('*')
        .order('prosperity_composite_score', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as unknown as ProsperityIndex[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useGovernanceModules(enabled = true) {
  return useQuery({
    queryKey: ['ceos-governance-modules'],
    queryFn: async (): Promise<GovernanceModule[]> => {
      const { data, error } = await supabase
        .from('ceos_governance_modules')
        .select('*')
        .eq('is_active', true)
        .order('ppp_readiness_score', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as GovernanceModule[];
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useTriggerCEOSEngine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { mode: string; params?: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke('civilization-economic-os', {
        body: params,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['ceos-dashboard'] });
      qc.invalidateQueries({ queryKey: ['ceos-market-equilibrium'] });
      qc.invalidateQueries({ queryKey: ['ceos-prosperity-index'] });
      qc.invalidateQueries({ queryKey: ['ceos-governance-modules'] });
      toast.success(`CEOS engine completed: ${variables.mode}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'CEOS engine failed');
    },
  });
}
