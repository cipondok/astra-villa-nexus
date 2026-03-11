import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GlobalRegion {
  id: string;
  region_id: string;
  region_name: string;
  country_code: string;
  country_name: string;
  primary_currency: string;
  market_maturity_level: string;
  data_density_score: number;
  ai_model_variant: string;
  compute_tier: string;
  is_active: boolean;
  is_primary: boolean;
  flag_emoji: string;
  roi_weight: number;
  demand_weight: number;
  growth_weight: number;
  liquidity_weight: number;
  risk_multiplier: number;
  inflation_rate: number;
  foreign_ownership_allowed: boolean;
  max_foreign_ownership_pct: number;
  rental_regulation_level: string;
  capital_gains_tax_pct: number;
  stamp_duty_pct: number;
  expansion_phase: string;
  launched_at: string | null;
}

export interface GlobalOpportunity {
  region_id: string;
  city: string;
  global_opportunity_score: number;
  global_roi_score: number;
  market_growth_weight: number;
  political_risk_adjustment: number;
  liquidity_index: number;
  capital_entry_barrier: number;
  avg_price_usd: number;
  avg_price_per_sqm_usd: number;
  median_roi_pct: number;
  property_count: number;
  last_computed_at: string;
}

export interface ComputePriority {
  region_id: string;
  city: string;
  listing_velocity: number;
  investor_activity: number;
  price_volatility: number;
  search_heat: number;
  compute_priority: number;
  recommended_tier: string;
}

export function useGlobalRegions() {
  return useQuery({
    queryKey: ['global-regions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_regions')
        .select('*')
        .order('is_primary', { ascending: false });
      if (error) throw error;
      return (data || []) as GlobalRegion[];
    },
    staleTime: 30_000,
  });
}

export function useGlobalOpportunities() {
  return useQuery({
    queryKey: ['global-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_opportunity_scores')
        .select('*')
        .order('global_opportunity_score', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as GlobalOpportunity[];
    },
    staleTime: 60_000,
  });
}

export function useComputePriorities() {
  return useQuery({
    queryKey: ['compute-priorities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compute_priority_index')
        .select('*')
        .order('compute_priority', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data || []) as ComputePriority[];
    },
    staleTime: 60_000,
  });
}

export function useFXRates() {
  return useQuery({
    queryKey: ['fx-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fx_rate_snapshots')
        .select('*')
        .order('snapshot_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    staleTime: 300_000,
  });
}

export function useExpansionLog() {
  return useQuery({
    queryKey: ['expansion-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_expansion_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });
}

export function useRefreshFX() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('global-intelligence', {
        body: { action: 'refresh_fx' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fx-rates'] }),
  });
}

export function useComputeGlobalScores() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (regionId: string) => {
      const { data, error } = await supabase.functions.invoke('global-intelligence', {
        body: { action: 'compute_scores', region_id: regionId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['global-opportunities'] }),
  });
}

export function useComputeRouting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (regionId?: string) => {
      const { data, error } = await supabase.functions.invoke('global-intelligence', {
        body: { action: 'compute_routing', region_id: regionId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['compute-priorities'] }),
  });
}

export function useChangeExpansionPhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { region_id: string; new_phase: string; notes?: string }) => {
      const { data, error } = await supabase.functions.invoke('global-intelligence', {
        body: { action: 'change_phase', ...params },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['global-regions'] });
      qc.invalidateQueries({ queryKey: ['expansion-log'] });
    },
  });
}
