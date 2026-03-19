import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DistrictMarketplaceBalance {
  id: string;
  district: string;
  segment_type: string | null;
  vendor_supply_pressure: number;
  vendor_category_gap_index: number;
  investor_demand_to_vendor_ratio: number;
  service_completion_delay_risk: number;
  marketplace_balance_score: number;
  demand_liquidity_weight: number;
  vendor_supply_depth: number;
  deal_velocity: number;
  investor_interest_growth: number;
  oversupply_penalty: number;
  oversupply_detected: boolean;
  price_war_risk_level: string;
  lead_starvation_pct: number;
  recommended_action: string | null;
  scoring_inputs: Record<string, unknown>;
  last_computed_at: string;
}

export interface VendorGrowthCampaign {
  id: string;
  campaign_name: string;
  campaign_type: string;
  district: string;
  segment_type: string | null;
  target_vendor_category: string;
  target_vendor_count: number;
  acquired_vendor_count: number;
  budget_allocated: number;
  budget_spent: number;
  roi: number;
  urgency_score: number;
  trigger_reason: string | null;
  trigger_metrics: Record<string, unknown>;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface VendorCategoryExpansionTarget {
  id: string;
  district: string;
  service_category: string;
  segment_type: string | null;
  current_vendor_count: number;
  target_vendor_count: number;
  category_gap_index: number;
  demand_signal_strength: number;
  priority_rank: number;
  expansion_status: string;
}

export interface ExpansionSequenceItem {
  id: string;
  city: string;
  district: string;
  segment_type: string | null;
  vendor_category: string;
  sequence_rank: number;
  capital_inflow_score: number;
  liquidity_acceleration: number;
  market_share_opportunity: number;
  composite_expansion_score: number;
  status: string;
}

/** District marketplace balance scores */
export function useDistrictMarketplaceBalance() {
  return useQuery({
    queryKey: ['district-marketplace-balance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('district_marketplace_balance')
        .select('*')
        .order('marketplace_balance_score', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as DistrictMarketplaceBalance[];
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

/** Vendor growth campaigns */
export function useVendorGrowthCampaigns(status?: string) {
  return useQuery({
    queryKey: ['vendor-growth-campaigns', status],
    queryFn: async () => {
      let query = supabase
        .from('vendor_growth_campaigns')
        .select('*')
        .order('urgency_score', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as VendorGrowthCampaign[];
    },
  });
}

/** Vendor category expansion targets */
export function useVendorCategoryExpansionTargets() {
  return useQuery({
    queryKey: ['vendor-category-expansion-targets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_category_expansion_targets')
        .select('*')
        .order('category_gap_index', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as VendorCategoryExpansionTarget[];
    },
    staleTime: 60_000,
  });
}

/** Expansion sequencing queue */
export function useExpansionSequencingQueue() {
  return useQuery({
    queryKey: ['expansion-sequencing-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expansion_sequencing_queue')
        .select('*')
        .order('sequence_rank');
      if (error) throw error;
      return (data || []) as unknown as ExpansionSequenceItem[];
    },
    staleTime: 60_000,
  });
}

/** Trigger growth orchestrator cycle */
export function useTriggerGrowthOrchestrator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mode?: string) => {
      const { data, error } = await supabase.functions.invoke('vendor-growth-orchestrator', {
        body: { mode: mode || 'full' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['district-marketplace-balance'] });
      qc.invalidateQueries({ queryKey: ['vendor-growth-campaigns'] });
      qc.invalidateQueries({ queryKey: ['vendor-category-expansion-targets'] });
      qc.invalidateQueries({ queryKey: ['expansion-sequencing-queue'] });
      toast.success(
        `Orchestrator: ${data?.balance_scored ?? 0} districts scored, ${data?.category_gaps_computed ?? 0} gaps, ${data?.expansion_sequenced ?? 0} sequenced`
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
