import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VendorIntelligenceScore {
  id: string;
  vendor_id: string;
  demand_score: number;
  performance_score: number;
  growth_priority_score: number;
  composite_rank_score: number;
  scoring_breakdown: Record<string, unknown>;
  district_demand_signals: Record<string, unknown>;
  last_computed_at: string;
}

export interface VendorServiceRegion {
  id: string;
  vendor_id: string;
  district: string;
  province: string | null;
  segment_types: string[];
  is_primary: boolean;
  max_capacity_per_month: number;
  current_active_jobs: number;
  availability_status: string;
}

export interface VendorMatchResult {
  id: string;
  requester_id: string;
  requester_role: string;
  property_id: string | null;
  district: string;
  segment_type: string | null;
  service_category: string;
  matched_vendor_id: string;
  match_score: number;
  match_factors: Record<string, unknown>;
  status: string;
  created_at: string;
}

export interface VendorDemandRoute {
  id: string;
  trigger_type: string;
  district: string;
  segment_type: string | null;
  target_service_categories: string[];
  leads_generated: number;
  campaign_action: string;
  processed: boolean;
  created_at: string;
}

/** Fetch vendor intelligence scores */
export function useVendorIntelligenceScores(limit = 50) {
  return useQuery({
    queryKey: ['vendor-intelligence-scores', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_intelligence_scores')
        .select('*')
        .order('composite_rank_score', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as VendorIntelligenceScore[];
    },
    staleTime: 60_000,
  });
}

/** Fetch vendor service regions */
export function useVendorServiceRegions(district?: string) {
  return useQuery({
    queryKey: ['vendor-service-regions', district],
    queryFn: async () => {
      let query = supabase
        .from('vendor_service_regions')
        .select('*')
        .eq('availability_status', 'available');
      if (district) query = query.eq('district', district);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as VendorServiceRegion[];
    },
  });
}

/** Fetch match results for current user */
export function useVendorMatchResults(limit = 20) {
  return useQuery({
    queryKey: ['vendor-match-results', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_match_results')
        .select('*')
        .order('match_score', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as VendorMatchResult[];
    },
  });
}

/** Fetch demand routing queue */
export function useVendorDemandRouting() {
  return useQuery({
    queryKey: ['vendor-demand-routing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_demand_routing')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data || []) as unknown as VendorDemandRoute[];
    },
    refetchInterval: 30_000,
  });
}

/** Request AI vendor matching */
export function useRequestVendorMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      requester_id: string;
      requester_role: string;
      district: string;
      service_category: string;
      property_id?: string;
      segment_type?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('vendor-marketplace-engine', {
        body: { mode: 'match', ...params },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['vendor-match-results'] });
      toast.success(`Found ${data?.matches_created ?? 0} vendor matches`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Trigger full vendor marketplace engine cycle */
export function useTriggerVendorEngine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mode?: string) => {
      const { data, error } = await supabase.functions.invoke('vendor-marketplace-engine', {
        body: { mode: mode || 'full' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['vendor-intelligence-scores'] });
      qc.invalidateQueries({ queryKey: ['vendor-match-results'] });
      qc.invalidateQueries({ queryKey: ['vendor-demand-routing'] });
      toast.success(
        `Engine: ${data?.vendors_scored ?? 0} scored, ${data?.matches_created ?? 0} matched, ${data?.leads_routed ?? 0} leads routed`
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
