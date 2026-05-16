import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CityNetworkDensity {
  id: string;
  city: string;
  investor_concentration_score: number;
  vendor_service_depth_score: number;
  deal_activity_frequency_score: number;
  referral_propagation_velocity: number;
  active_investors: number;
  active_vendors: number;
  active_agents: number;
  active_listings: number;
  deals_30d: number;
  referrals_30d: number;
  network_density_score: number;
  density_tier: string;
  metcalfe_value_proxy: number;
  last_computed_at: string;
}

export interface LiquidityLockInMetric {
  id: string;
  city: string;
  activity_to_roi_correlation: number;
  roi_to_capital_correlation: number;
  capital_to_closure_correlation: number;
  flywheel_momentum_score: number;
  avg_investor_roi_pct: number;
  capital_inflow_trend: string;
  avg_days_to_close: number;
  repeat_investor_pct: number;
  lock_in_strength: number;
  lock_in_tier: string;
  insights: Record<string, unknown>;
  last_computed_at: string;
}

export interface ViralGrowthMultiplier {
  id: string;
  city: string;
  period_month: string;
  k_factor: number;
  referral_conversion_rate: number;
  viral_cycle_time_days: number;
  compounding_growth_rate: number;
  projected_users_30d: number;
  projected_users_90d: number;
  multiplier_tier: string;
  reward_roi: number;
  last_computed_at: string;
}

export interface PlatformDependencyIndex {
  id: string;
  user_id: string;
  user_role: string | null;
  switching_cost_score: number;
  engagement_stickiness_score: number;
  portfolio_integration_depth: number;
  data_moat_depth: number;
  dependency_score: number;
  dependency_tier: string;
  churn_risk_pct: number;
  retention_actions: string[];
  last_computed_at: string;
}

export interface FlywheelSyncState {
  id: string;
  city: string;
  vendor_engine_health: number;
  capital_engine_health: number;
  deal_dominance_health: number;
  pricing_engine_health: number;
  network_density_health: number;
  sync_score: number;
  weakest_link: string | null;
  bottleneck_action: string | null;
  flywheel_rpm: number;
  acceleration_trend: string;
  estimated_singularity_months: number | null;
  engine_states: Record<string, unknown>;
  last_synced_at: string;
}

/** City network density scores */
export function useCityNetworkDensity() {
  return useQuery({
    queryKey: ['city-network-density'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('city_network_density')
        .select('*')
        .order('network_density_score', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as CityNetworkDensity[];
    },
    staleTime: 120_000,
    refetchInterval: 300_000,
  });
}

/** Liquidity lock-in metrics */
export function useLiquidityLockIn() {
  return useQuery({
    queryKey: ['liquidity-lock-in-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('liquidity_lock_in_metrics')
        .select('*')
        .order('lock_in_strength', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as LiquidityLockInMetric[];
    },
    staleTime: 120_000,
  });
}

/** Viral growth multipliers */
export function useViralGrowthMultipliers() {
  return useQuery({
    queryKey: ['viral-growth-multipliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viral_growth_multipliers')
        .select('*')
        .order('k_factor', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as ViralGrowthMultiplier[];
    },
    staleTime: 120_000,
  });
}

/** Platform dependency index */
export function usePlatformDependencyIndex(limit = 50) {
  return useQuery({
    queryKey: ['platform-dependency-index', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_dependency_index')
        .select('*')
        .order('dependency_score', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as PlatformDependencyIndex[];
    },
    staleTime: 120_000,
  });
}

/** Flywheel synchronization state */
export function useFlywheelSyncState() {
  return useQuery({
    queryKey: ['flywheel-sync-state'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flywheel_sync_state')
        .select('*')
        .order('sync_score', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as FlywheelSyncState[];
    },
    staleTime: 120_000,
    refetchInterval: 300_000,
  });
}

/** Trigger network effect engine cycle */
export function useTriggerNetworkEffectEngine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mode?: string) => {
      const { data, error } = await supabase.functions.invoke('network-effect-engine', {
        body: { mode: mode || 'full' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['city-network-density'] });
      qc.invalidateQueries({ queryKey: ['liquidity-lock-in-metrics'] });
      qc.invalidateQueries({ queryKey: ['viral-growth-multipliers'] });
      qc.invalidateQueries({ queryKey: ['flywheel-sync-state'] });
      toast.success(
        `Network Engine: ${data?.density_scored ?? 0} density, ${data?.lockin_computed ?? 0} lock-in, ${data?.viral_computed ?? 0} viral, ${data?.flywheel_synced ?? 0} synced`
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
