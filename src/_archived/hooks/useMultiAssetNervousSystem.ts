import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeAMENS(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('multi-asset-nervous-system', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

export function useAMENSDashboard() {
  return useQuery({
    queryKey: ['amens-dashboard'],
    queryFn: () => invokeAMENS('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useCrossAssetCorrelation() {
  return useQuery({
    queryKey: ['amens-correlations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('amens_cross_asset_correlation')
        .select('*').order('computed_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function usePortfolioResilience() {
  return useQuery({
    queryKey: ['amens-resilience'],
    queryFn: async () => {
      const { data, error } = await supabase.from('amens_portfolio_resilience')
        .select('*').order('portfolio_sharpe_ratio', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useCapitalRotation() {
  return useQuery({
    queryKey: ['amens-rotation'],
    queryFn: async () => {
      const { data, error } = await supabase.from('amens_capital_rotation')
        .select('*').order('rotation_confidence', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useEconomicCycle() {
  return useQuery({
    queryKey: ['amens-economic-cycle'],
    queryFn: async () => {
      const { data, error } = await supabase.from('amens_economic_cycle')
        .select('*').order('computed_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useStrategyFeedback() {
  return useQuery({
    queryKey: ['amens-strategy-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase.from('amens_strategy_feedback')
        .select('*').order('prediction_accuracy_pct', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

// ── Mutations ──

export function useAnalyzeCorrelations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeAMENS('analyze_correlations', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['amens-correlations'] }); toast.success(`Analyzed ${d?.regions_analyzed ?? 0} regions`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSimulateResilience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeAMENS('simulate_resilience', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['amens-resilience'] }); toast.success(`Simulated ${d?.scenarios_simulated ?? 0} portfolios`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDetectRotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeAMENS('detect_rotation', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['amens-rotation'] }); toast.success(`Detected ${d?.rotations_detected ?? 0} rotation signals`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useComputeEconomicCycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeAMENS('compute_economic_cycle', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['amens-economic-cycle'] }); toast.success(`Computed cycles for ${d?.regions_computed ?? 0} regions`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRunFeedbackLoop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeAMENS('run_feedback_loop', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['amens-strategy-feedback'] }); qc.invalidateQueries({ queryKey: ['amens-dashboard'] }); toast.success(`Calibrated ${d?.strategies_calibrated ?? 0} strategies`); },
    onError: (e: Error) => toast.error(e.message),
  });
}
