import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/** Trigger full batch liquidity recomputation */
export function useLiquidityScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pipeline: string = 'full_forecast') => {
      const { data, error } = await supabase.functions.invoke('recompute-liquidity', {
        body: { mode: 'full' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['liquidity'] });
      qc.invalidateQueries({ queryKey: ['liquidity-metrics'] });
      qc.invalidateQueries({ queryKey: ['property-liquidity'] });
      qc.invalidateQueries({ queryKey: ['liquidity-hotspots'] });
      toast.success(`Liquidity forecast completed: ${data?.district_metrics_updated ?? 0} districts, ${data?.property_scores_updated ?? 0} properties`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Trigger incremental signal-driven liquidity update */
export function useIncrementalLiquidityUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (batchSize?: number) => {
      const { data, error } = await supabase.functions.invoke('update-liquidity-on-signal', {
        body: { batch_size: batchSize || 50 },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['liquidity'] });
      qc.invalidateQueries({ queryKey: ['liquidity-metrics'] });
      qc.invalidateQueries({ queryKey: ['property-liquidity'] });
      qc.invalidateQueries({ queryKey: ['liquidity-signal-queue'] });
      if (data?.signals_processed > 0) {
        toast.success(`Processed ${data.signals_processed} signals → ${data.properties_updated} properties updated`);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Fetch pending signal queue stats */
export function useLiquiditySignalQueue() {
  return useQuery({
    queryKey: ['liquidity-signal-queue'],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('liquidity_signal_queue')
        .select('*', { count: 'exact' })
        .eq('processed', false)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return { signals: data || [], pendingCount: count || 0 };
    },
    refetchInterval: 15_000,
  });
}

export function useLiquidityAbsorption() {
  return useQuery({
    queryKey: ['liquidity', 'absorption'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('liquidity_absorption')
        .select('*')
        .order('liquidity_speed_index', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useLiquidityElasticity() {
  return useQuery({
    queryKey: ['liquidity', 'elasticity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('liquidity_demand_elasticity')
        .select('*')
        .order('city');
      if (error) throw error;
      return data;
    },
  });
}

export function useLiquidityRental() {
  return useQuery({
    queryKey: ['liquidity', 'rental'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('liquidity_rental_stability')
        .select('*')
        .order('cashflow_reliability_index', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useLiquidityCrisis() {
  return useQuery({
    queryKey: ['liquidity', 'crisis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('liquidity_crisis_resilience')
        .select('*')
        .order('stress_liquidity_score', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useLiquidityExit() {
  return useQuery({
    queryKey: ['liquidity', 'exit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('liquidity_exit_timing')
        .select('*')
        .order('liquidity_adjusted_roi', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
