import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InvestorLiquidityAlert {
  id: string;
  investor_id: string;
  property_id: string | null;
  district: string | null;
  segment_type: string | null;
  alert_type: string;
  urgency_score: number;
  title: string;
  description: string | null;
  supporting_metrics: Record<string, unknown>;
  is_read: boolean;
  is_dismissed: boolean;
  triggered_at: string;
  created_at: string;
}

export interface SupplyAcquisitionTarget {
  id: string;
  district: string;
  segment_type: string;
  liquidity_strength_index: number;
  supply_gap_score: number;
  demand_velocity: number;
  active_listings: number;
  avg_days_to_close: number;
  investor_interest_count: number;
  recommended_action: string;
  action_priority: string;
  last_computed_at: string;
}

export interface MarketStorySignal {
  id: string;
  story_type: string;
  district: string;
  segment_type: string | null;
  headline: string;
  narrative: string | null;
  supporting_metrics: Record<string, unknown>;
  content_priority_score: number;
  is_published: boolean;
  created_at: string;
}

/** Fetch investor's unread liquidity alerts */
export function useInvestorLiquidityAlerts(limit = 20) {
  return useQuery({
    queryKey: ['investor-liquidity-alerts', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investor_liquidity_alerts')
        .select('*')
        .eq('is_dismissed', false)
        .order('urgency_score', { ascending: false })
        .order('triggered_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as InvestorLiquidityAlert[];
    },
    refetchInterval: 30_000,
  });
}

/** Mark alert as read */
export function useMarkAlertRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('investor_liquidity_alerts')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investor-liquidity-alerts'] });
    },
  });
}

/** Dismiss alert */
export function useDismissAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('investor_liquidity_alerts')
        .update({ is_dismissed: true })
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investor-liquidity-alerts'] });
    },
  });
}

/** Fetch supply acquisition targets */
export function useSupplyAcquisitionTargets() {
  return useQuery({
    queryKey: ['supply-acquisition-targets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supply_acquisition_targets')
        .select('*')
        .order('supply_gap_score', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as SupplyAcquisitionTarget[];
    },
    staleTime: 60_000,
  });
}

/** Fetch market story signals */
export function useMarketStorySignals(limit = 10) {
  return useQuery({
    queryKey: ['market-story-signals', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_story_signals')
        .select('*')
        .order('content_priority_score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as MarketStorySignal[];
    },
    staleTime: 60_000,
  });
}

/** Trigger flywheel cycle manually */
export function useTriggerFlywheel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mode?: string) => {
      const { data, error } = await supabase.functions.invoke('liquidity-flywheel', {
        body: { mode: mode || 'full' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['investor-liquidity-alerts'] });
      qc.invalidateQueries({ queryKey: ['supply-acquisition-targets'] });
      qc.invalidateQueries({ queryKey: ['market-story-signals'] });
      toast.success(
        `Flywheel: ${data?.alerts_created ?? 0} alerts, ${data?.supply_targets_updated ?? 0} targets, ${data?.stories_generated ?? 0} stories`
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
