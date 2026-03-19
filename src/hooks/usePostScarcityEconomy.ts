import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ── Types ──

export interface SupplySync {
  id: string;
  city: string;
  country: string;
  construction_capacity_units_yr: number;
  active_construction_units: number;
  utilized_land_pct: number;
  land_banking_pct: number;
  housing_units_needed_5y: number;
  infra_readiness_score: number;
  supply_sync_score: number;
  artificial_scarcity_index: number;
  sync_status: string;
  recommended_intervention: string | null;
  computed_at: string;
}

export interface OwnershipModel {
  id: string;
  city: string;
  model_type: string;
  active_participants: number;
  total_units_covered: number;
  avg_entry_cost_usd: number;
  accessibility_score: number;
  income_bracket_coverage: string;
  first_time_buyer_pct: number;
  market_destabilization_risk: number;
  liquidity_provision_score: number;
  avg_participant_roi_pct: number;
  model_maturity: string;
  computed_at: string;
}

export interface PriceStability {
  id: string;
  city: string;
  speculative_heat_index: number;
  flip_transaction_pct: number;
  median_price_to_income: number;
  affordable_stock_pct: number;
  rental_burden_pct: number;
  affordability_trajectory: string;
  dampening_score: number;
  dampening_mechanism: string | null;
  intervention_urgency: string;
  computed_at: string;
}

export interface HabitatQuality {
  id: string;
  city: string;
  livability_score: number;
  connectivity_score: number;
  economic_opportunity_score: number;
  environmental_sustainability_score: number;
  habitat_quality_index: number;
  habitat_tier: string;
  capital_deployment_priority: string;
  investment_impact_multiplier: number;
  computed_at: string;
}

export interface AbundanceFlywheel {
  id: string;
  city: string;
  structural_vacancy_pct: number;
  asset_utilization_score: number;
  dev_cycle_efficiency_score: number;
  homeownership_accessibility_score: number;
  wealth_building_velocity: number;
  intergenerational_mobility_index: number;
  abundance_composite_score: number;
  flywheel_stage: string;
  flywheel_momentum: number;
  next_stage_trigger: string | null;
  estimated_months_to_next: number | null;
  computed_at: string;
}

export interface PSREDashboard {
  summary: {
    cities_tracked: number;
    avg_supply_sync: number;
    avg_scarcity_index: number;
    ownership_models_active: number;
    avg_habitat_quality: number;
    avg_abundance_score: number;
    crisis_cities: number;
  };
  supply_sync: SupplySync[];
  ownership_models: OwnershipModel[];
  price_stability: PriceStability[];
  habitat_quality: HabitatQuality[];
  abundance_flywheel: AbundanceFlywheel[];
}

// ── Hooks ──

export function usePSREDashboard(enabled = true) {
  return useQuery({
    queryKey: ['psre-dashboard'],
    queryFn: async (): Promise<PSREDashboard> => {
      const { data, error } = await supabase.functions.invoke('post-scarcity-economy', {
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

export function useSupplySync(enabled = true) {
  return useQuery({
    queryKey: ['psre-supply-sync'],
    queryFn: async (): Promise<SupplySync[]> => {
      const { data, error } = await supabase
        .from('psre_supply_sync')
        .select('*')
        .order('supply_sync_score', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as unknown as SupplySync[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useHabitatQuality(enabled = true) {
  return useQuery({
    queryKey: ['psre-habitat-quality'],
    queryFn: async (): Promise<HabitatQuality[]> => {
      const { data, error } = await supabase
        .from('psre_habitat_quality')
        .select('*')
        .order('habitat_quality_index', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as unknown as HabitatQuality[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useAbundanceFlywheel(enabled = true) {
  return useQuery({
    queryKey: ['psre-abundance-flywheel'],
    queryFn: async (): Promise<AbundanceFlywheel[]> => {
      const { data, error } = await supabase
        .from('psre_abundance_flywheel')
        .select('*')
        .order('abundance_composite_score', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as unknown as AbundanceFlywheel[];
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useTriggerPSREEngine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { mode: string; params?: Record<string, unknown> }) => {
      const { data, error } = await supabase.functions.invoke('post-scarcity-economy', {
        body: params,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['psre-dashboard'] });
      qc.invalidateQueries({ queryKey: ['psre-supply-sync'] });
      qc.invalidateQueries({ queryKey: ['psre-habitat-quality'] });
      qc.invalidateQueries({ queryKey: ['psre-abundance-flywheel'] });
      toast.success(`PSRE engine completed: ${variables.mode}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'PSRE engine failed');
    },
  });
}
