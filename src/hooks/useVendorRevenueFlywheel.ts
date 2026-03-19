import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VendorRevenueMetric {
  id: string;
  vendor_id: string;
  revenue_potential_score: number;
  vendor_roi_score: number;
  premium_upgrade_propensity: number;
  district_growth_capture_score: number;
  total_platform_revenue: number;
  total_leads_value: number;
  lead_to_deal_ratio: number;
  capacity_utilization_pct: number;
  avg_deal_value: number;
  scoring_inputs: Record<string, unknown>;
  last_computed_at: string;
}

export interface VendorPremiumSlot {
  id: string;
  vendor_id: string;
  slot_type: string;
  district: string | null;
  segment_type: string | null;
  service_category: string | null;
  status: string;
  price_monthly: number;
  discount_pct: number;
  performance_impressions: number;
  performance_clicks: number;
  performance_leads: number;
  performance_conversions: number;
  roi_multiplier: number;
  expires_at: string | null;
  created_at: string;
}

export interface VendorUpgradeRecommendation {
  id: string;
  vendor_id: string;
  recommendation_type: string;
  trigger_reason: string;
  trigger_metrics: Record<string, unknown>;
  recommended_slot_type: string | null;
  estimated_roi_multiplier: number;
  estimated_additional_leads: number;
  priority_score: number;
  status: string;
  created_at: string;
}

export interface VendorMarketShare {
  id: string;
  vendor_id: string;
  district: string;
  service_category: string;
  period_month: string;
  total_district_leads: number;
  vendor_leads_captured: number;
  market_share_pct: number;
  lead_win_rate: number;
  competitor_count: number;
  rank_in_district: number;
  insight_narrative: string | null;
}

export interface VendorCampaignPerf {
  id: string;
  vendor_id: string;
  campaign_type: string;
  campaign_name: string;
  district: string | null;
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  leads_generated: number;
  conversions: number;
  revenue_generated: number;
  roi: number;
  status: string;
}

/** Fetch vendor revenue metrics */
export function useVendorRevenueMetrics(limit = 50) {
  return useQuery({
    queryKey: ['vendor-revenue-metrics', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_revenue_metrics')
        .select('*')
        .order('revenue_potential_score', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as VendorRevenueMetric[];
    },
    staleTime: 60_000,
  });
}

/** Fetch vendor premium slots */
export function useVendorPremiumSlots(status?: string) {
  return useQuery({
    queryKey: ['vendor-premium-slots', status],
    queryFn: async () => {
      let query = supabase
        .from('vendor_premium_slots')
        .select('*')
        .order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as VendorPremiumSlot[];
    },
  });
}

/** Fetch vendor upgrade recommendations */
export function useVendorUpgradeRecommendations(status = 'pending') {
  return useQuery({
    queryKey: ['vendor-upgrade-recs', status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_upgrade_recommendations')
        .select('*')
        .eq('status', status)
        .order('priority_score', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as VendorUpgradeRecommendation[];
    },
    refetchInterval: 60_000,
  });
}

/** Respond to upgrade recommendation */
export function useRespondUpgradeRec() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ recId, response }: { recId: string; response: 'accepted' | 'declined' }) => {
      const { error } = await supabase
        .from('vendor_upgrade_recommendations')
        .update({ status: response, responded_at: new Date().toISOString() })
        .eq('id', recId);
      if (error) throw error;
    },
    onSuccess: (_, { response }) => {
      qc.invalidateQueries({ queryKey: ['vendor-upgrade-recs'] });
      qc.invalidateQueries({ queryKey: ['vendor-premium-slots'] });
      toast.success(response === 'accepted' ? 'Upgrade accepted!' : 'Recommendation declined');
    },
  });
}

/** Fetch vendor market share data */
export function useVendorMarketShare(district?: string) {
  return useQuery({
    queryKey: ['vendor-market-share', district],
    queryFn: async () => {
      let query = supabase
        .from('vendor_market_share')
        .select('*')
        .order('market_share_pct', { ascending: false });
      if (district) query = query.eq('district', district);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as VendorMarketShare[];
    },
    staleTime: 120_000,
  });
}

/** Fetch vendor campaign performance */
export function useVendorCampaignPerformance(status?: string) {
  return useQuery({
    queryKey: ['vendor-campaign-performance', status],
    queryFn: async () => {
      let query = supabase
        .from('vendor_campaign_performance')
        .select('*')
        .order('roi', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as VendorCampaignPerf[];
    },
  });
}

/** Trigger vendor revenue flywheel cycle */
export function useTriggerRevenueFlywheel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mode?: string) => {
      const { data, error } = await supabase.functions.invoke('vendor-revenue-flywheel', {
        body: { mode: mode || 'full' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['vendor-revenue-metrics'] });
      qc.invalidateQueries({ queryKey: ['vendor-premium-slots'] });
      qc.invalidateQueries({ queryKey: ['vendor-upgrade-recs'] });
      qc.invalidateQueries({ queryKey: ['vendor-market-share'] });
      qc.invalidateQueries({ queryKey: ['vendor-campaign-performance'] });
      toast.success(
        `Revenue Flywheel: ${data?.revenue_scored ?? 0} scored, ${data?.upsells_generated ?? 0} upsells, ${data?.market_share_updated ?? 0} shares, ${data?.premium_allocated ?? 0} slots`
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
