import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DealGravityIndex {
  id: string;
  property_id: string;
  district: string | null;
  offer_frequency_acceleration: number;
  viewing_velocity_momentum: number;
  escrow_initiation_probability: number;
  deal_close_reliability: number;
  investor_competition_density: number;
  price_competitiveness: number;
  deal_gravity_score: number;
  gravity_tier: string;
  scoring_inputs: Record<string, unknown>;
  last_computed_at: string;
}

export interface DealVisibilityRanking {
  id: string;
  property_id: string;
  district: string | null;
  deal_gravity_weight: number;
  liquidity_urgency_weight: number;
  capital_inflow_weight: number;
  portfolio_demand_weight: number;
  suppression_coefficient: number;
  boost_multiplier: number;
  visibility_score: number;
  homepage_rank: number | null;
  search_rank: number | null;
  investor_feed_rank: number | null;
  agent_feed_rank: number | null;
  ranking_context: string;
  last_computed_at: string;
}

export interface DealBoostSignal {
  id: string;
  property_id: string;
  district: string | null;
  boost_type: string;
  boost_strength: number;
  boost_reason: string | null;
  trigger_metrics: Record<string, unknown>;
  status: string;
  expires_at: string | null;
  created_at: string;
}

export interface DistrictDealDominance {
  id: string;
  district: string;
  segment_type: string | null;
  avg_deal_gravity: number;
  total_active_deals: number;
  dominant_listings: number;
  suppressed_listings: number;
  avg_visibility_score: number;
  dominance_efficiency_score: number;
  boost_to_inquiry_rate: number;
  inquiry_to_offer_rate: number;
  offer_to_close_rate: number;
  insights: Record<string, unknown>;
  last_computed_at: string;
}

/** Deal gravity index scores */
export function useDealGravityIndex(limit = 50) {
  return useQuery({
    queryKey: ['deal-gravity-index', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_gravity_index')
        .select('*')
        .order('deal_gravity_score', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as DealGravityIndex[];
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

/** Deal visibility rankings */
export function useDealVisibilityRanking(context?: string, limit = 50) {
  return useQuery({
    queryKey: ['deal-visibility-ranking', context, limit],
    queryFn: async () => {
      let query = supabase
        .from('deal_visibility_ranking')
        .select('*')
        .order('visibility_score', { ascending: false })
        .limit(limit);
      if (context) query = query.eq('ranking_context', context);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as DealVisibilityRanking[];
    },
    staleTime: 60_000,
  });
}

/** Active deal boost signals */
export function useDealBoostSignals(status = 'active') {
  return useQuery({
    queryKey: ['deal-boost-signals', status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_boost_signals')
        .select('*')
        .eq('status', status)
        .order('boost_strength', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as DealBoostSignal[];
    },
    refetchInterval: 60_000,
  });
}

/** District deal dominance aggregates */
export function useDistrictDealDominance() {
  return useQuery({
    queryKey: ['district-deal-dominance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('district_deal_dominance')
        .select('*')
        .order('dominance_efficiency_score', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as DistrictDealDominance[];
    },
    staleTime: 120_000,
  });
}

/** Trigger deal dominance engine cycle */
export function useTriggerDealDominanceEngine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mode?: string) => {
      const { data, error } = await supabase.functions.invoke('deal-dominance-engine', {
        body: { mode: mode || 'full' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['deal-gravity-index'] });
      qc.invalidateQueries({ queryKey: ['deal-visibility-ranking'] });
      qc.invalidateQueries({ queryKey: ['deal-boost-signals'] });
      qc.invalidateQueries({ queryKey: ['district-deal-dominance'] });
      toast.success(
        `Deal Dominance: ${data?.gravity_scored ?? 0} gravity, ${data?.visibility_ranked ?? 0} ranked, ${data?.boosts_created ?? 0} boosts, ${data?.district_dominance_computed ?? 0} districts`
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
