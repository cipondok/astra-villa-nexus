import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

async function invokeCDTE(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('capital-deployment-timing', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data;
}

// ── Queries ──

export function useCDTEDashboard(enabled = true) {
  return useQuery({
    queryKey: ['cdte-dashboard'],
    queryFn: () => invokeCDTE('dashboard'),
    enabled,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useCyclePhases(enabled = true) {
  return useQuery({
    queryKey: ['cdte-cycles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cdte_cycle_phases' as any)
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useLiquidityMomentum(enabled = true) {
  return useQuery({
    queryKey: ['cdte-momentum'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cdte_liquidity_momentum' as any)
        .select('*')
        .order('momentum_composite', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useAllocationStrategy(enabled = true) {
  return useQuery({
    queryKey: ['cdte-allocation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cdte_allocation_strategy' as any)
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useGrowthTiming(enabled = true) {
  return useQuery({
    queryKey: ['cdte-timing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cdte_growth_timing' as any)
        .select('*')
        .order('window_confidence', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useFeedbackLoop(enabled = true) {
  return useQuery({
    queryKey: ['cdte-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cdte_feedback_loop' as any)
        .select('*')
        .order('evaluated_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

// ── Mutations ──

function useMut(mode: string, label: string, keys: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeCDTE(mode, p),
    onSuccess: (data) => {
      keys.forEach(k => qc.invalidateQueries({ queryKey: [k] }));
      qc.invalidateQueries({ queryKey: ['cdte-dashboard'] });
      toast.success(`${label} completed`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useDetectCyclePhases = () => useMut('detect_cycles', 'Cycle Detection', ['cdte-cycles']);
export const useComputeLiquidityMomentum = () => useMut('compute_momentum', 'Momentum Computation', ['cdte-momentum']);
export const useSimulateAllocation = () => useMut('simulate_allocation', 'Allocation Simulation', ['cdte-allocation']);
export const useAssessGrowthTiming = () => useMut('assess_timing', 'Growth Timing Assessment', ['cdte-timing']);
export const useRunFeedbackLoop = () => useMut('run_feedback', 'Feedback Loop', ['cdte-feedback']);
