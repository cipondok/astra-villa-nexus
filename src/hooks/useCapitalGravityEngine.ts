import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ─── Capital Flow Predictions ────────────────────────
export function useCapitalFlowPredictions(marketCode?: string, horizon?: string) {
  return useQuery({
    queryKey: ['capital-flow-predictions', marketCode, horizon],
    queryFn: async () => {
      let query = supabase
        .from('capital_flow_predictions' as any)
        .select('*')
        .order('capital_gravity_score', { ascending: false })
        .limit(100);
      if (marketCode) query = query.eq('market_code', marketCode);
      if (horizon) query = query.eq('prediction_horizon', horizon);
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    staleTime: 30_000,
  });
}

// ─── Liquidity Acceleration Signals ──────────────────
export function useLiquidityAccelerationSignals(marketCode?: string, signalType?: string) {
  return useQuery({
    queryKey: ['liquidity-accel-signals', marketCode, signalType],
    queryFn: async () => {
      let query = supabase
        .from('liquidity_acceleration_signals' as any)
        .select('*')
        .in('status', ['emerging', 'active', 'confirmed'])
        .order('signal_strength', { ascending: false })
        .limit(50);
      if (marketCode) query = query.eq('market_code', marketCode);
      if (signalType) query = query.eq('signal_type', signalType);
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    staleTime: 15_000,
  });
}

// ─── Yield Gradient Map ──────────────────────────────
export function useYieldGradientMap(marketCode?: string) {
  return useQuery({
    queryKey: ['yield-gradient-map', marketCode],
    queryFn: async () => {
      let query = supabase
        .from('yield_gradient_map' as any)
        .select('*')
        .order('risk_adjusted_return', { ascending: false })
        .limit(100);
      if (marketCode) query = query.eq('market_code', marketCode);
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    staleTime: 60_000,
  });
}

// ─── Capital Influence Actions ───────────────────────
export function useCapitalInfluenceActions(active = true) {
  return useQuery({
    queryKey: ['capital-influence-actions', active],
    queryFn: async () => {
      let query = supabase
        .from('capital_influence_actions' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (active) query = query.eq('is_active', true);
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    staleTime: 30_000,
  });
}

// ─── Capital Network Effect Metrics ──────────────────
export function useCapitalNetworkMetrics(marketCode?: string) {
  return useQuery({
    queryKey: ['capital-network-metrics', marketCode],
    queryFn: async () => {
      let query = supabase
        .from('capital_network_effect_metrics' as any)
        .select('*')
        .order('flywheel_rpm', { ascending: false });
      if (marketCode) query = query.eq('market_code', marketCode);
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as any[];
    },
    staleTime: 60_000,
  });
}

// ─── Engine Trigger ──────────────────────────────────
export function useTriggerCapitalGravityEngine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { mode: string; params?: Record<string, any> }) => {
      const { data, error } = await supabase.functions.invoke('capital-gravity-engine', {
        body: payload,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_data, variables) => {
      const m = variables.mode;
      if (m === 'predict_capital_flows') qc.invalidateQueries({ queryKey: ['capital-flow-predictions'] });
      if (m === 'detect_acceleration_signals') qc.invalidateQueries({ queryKey: ['liquidity-accel-signals'] });
      if (m === 'compute_yield_gradients') qc.invalidateQueries({ queryKey: ['yield-gradient-map'] });
      if (m === 'generate_influence_actions') qc.invalidateQueries({ queryKey: ['capital-influence-actions'] });
      if (m === 'compute_network_metrics') qc.invalidateQueries({ queryKey: ['capital-network-metrics'] });
      toast.success(`Capital Gravity Engine: ${m} completed`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ─── Compound Dashboard Hook ─────────────────────────
export function useCapitalGravityDashboard(marketCode?: string) {
  const predictions = useCapitalFlowPredictions(marketCode);
  const signals = useLiquidityAccelerationSignals(marketCode);
  const yields = useYieldGradientMap(marketCode);
  const influence = useCapitalInfluenceActions();
  const network = useCapitalNetworkMetrics(marketCode);

  return {
    predictions: predictions.data || [],
    accelerationSignals: signals.data || [],
    yieldGradients: yields.data || [],
    influenceActions: influence.data || [],
    networkMetrics: network.data || [],
    isLoading: predictions.isLoading || signals.isLoading,
    magneticZones: (predictions.data || []).filter((p: any) => p.gravity_tier === 'magnetic'),
    confirmedBreakouts: (signals.data || []).filter((s: any) => s.status === 'confirmed'),
  };
}
