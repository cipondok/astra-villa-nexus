import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DistrictCapitalGravity {
  id: string;
  district: string;
  city: string | null;
  segment_type: string | null;
  liquidity_acceleration_score: number;
  absorption_velocity_score: number;
  vendor_execution_depth_score: number;
  deal_close_reliability_score: number;
  price_appreciation_momentum: number;
  supply_gap_persistence_score: number;
  capital_gravity_score: number;
  gravity_tier: string;
  scoring_inputs: Record<string, unknown>;
  last_computed_at: string;
}

export interface InvestorPortfolioFlow {
  id: string;
  district: string;
  segment_type: string | null;
  period_month: string;
  capital_inflow_idr: number;
  capital_outflow_idr: number;
  net_flow_idr: number;
  unique_investors: number;
  investor_concentration_hhi: number;
  district_saturation_pct: number;
  capital_rotation_signal: string;
  top_investor_share_pct: number;
  avg_ticket_size: number;
  flow_trend: string;
  insights: Record<string, unknown>;
}

export interface InstitutionalDealCluster {
  id: string;
  cluster_name: string;
  district: string;
  segment_type: string | null;
  cluster_type: string;
  total_deal_value_idr: number;
  participating_funds: number;
  target_properties: number;
  min_ticket_idr: number;
  target_irr_pct: number;
  capital_gravity_at_creation: number;
  status: string;
  ai_rationale: string | null;
  supporting_metrics: Record<string, unknown>;
}

export interface DistrictBubbleRisk {
  id: string;
  district: string;
  segment_type: string | null;
  liquidity_overheat_score: number;
  speculative_pricing_divergence: number;
  offer_frenzy_index: number;
  capital_concentration_risk: number;
  price_to_fundamental_ratio: number;
  bubble_risk_score: number;
  risk_level: string;
  recommended_actions: string[];
  roi_adjustment_factor: number;
  cooling_signal_emitted: boolean;
  narrative: string | null;
  last_computed_at: string;
}

export interface CapitalSequenceItem {
  id: string;
  city: string;
  district: string;
  segment_type: string | null;
  asset_class: string | null;
  sequence_rank: number;
  risk_adjusted_liquidity_yield: number;
  time_to_exit_score: number;
  deal_pipeline_density: number;
  capital_gravity_score: number;
  bubble_risk_discount: number;
  capital_priority_score: number;
  recommended_allocation_pct: number;
  ai_rationale: string | null;
  status: string;
}

/** District capital gravity scores */
export function useDistrictCapitalGravity() {
  return useQuery({
    queryKey: ['district-capital-gravity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('district_capital_gravity')
        .select('*')
        .order('capital_gravity_score', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as DistrictCapitalGravity[];
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

/** Investor portfolio flow intelligence */
export function useInvestorPortfolioFlow(district?: string) {
  return useQuery({
    queryKey: ['investor-portfolio-flow', district],
    queryFn: async () => {
      let query = supabase
        .from('investor_portfolio_flow')
        .select('*')
        .order('net_flow_idr', { ascending: false });
      if (district) query = query.eq('district', district);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as InvestorPortfolioFlow[];
    },
    staleTime: 120_000,
  });
}

/** Institutional deal clusters */
export function useInstitutionalDealClusters(status?: string) {
  return useQuery({
    queryKey: ['institutional-deal-clusters', status],
    queryFn: async () => {
      let query = supabase
        .from('institutional_deal_clusters')
        .select('*')
        .order('total_deal_value_idr', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as InstitutionalDealCluster[];
    },
  });
}

/** District bubble risk detection */
export function useDistrictBubbleRisk() {
  return useQuery({
    queryKey: ['district-bubble-risk'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('district_bubble_risk')
        .select('*')
        .order('bubble_risk_score', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as DistrictBubbleRisk[];
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

/** Capital sequencing queue */
export function useCapitalSequencingQueue() {
  return useQuery({
    queryKey: ['capital-sequencing-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('capital_sequencing_queue')
        .select('*')
        .order('sequence_rank');
      if (error) throw error;
      return (data || []) as unknown as CapitalSequenceItem[];
    },
    staleTime: 60_000,
  });
}

/** Trigger capital allocation engine cycle */
export function useTriggerCapitalEngine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mode?: string) => {
      const { data, error } = await supabase.functions.invoke('investor-capital-engine', {
        body: { mode: mode || 'full' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['district-capital-gravity'] });
      qc.invalidateQueries({ queryKey: ['investor-portfolio-flow'] });
      qc.invalidateQueries({ queryKey: ['institutional-deal-clusters'] });
      qc.invalidateQueries({ queryKey: ['district-bubble-risk'] });
      qc.invalidateQueries({ queryKey: ['capital-sequencing-queue'] });
      toast.success(
        `Capital Engine: ${data?.gravity_scored ?? 0} gravity scores, ${data?.bubble_assessed ?? 0} bubble assessments, ${data?.capital_sequenced ?? 0} sequenced, ${data?.syndications_created ?? 0} syndications`
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
