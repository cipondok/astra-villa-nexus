import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

async function invokeFSCC(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('founder-command-center', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data;
}

// ── Queries ──

export function useFSCCDashboard(enabled = true) {
  return useQuery({
    queryKey: ['fscc-dashboard'],
    queryFn: () => invokeFSCC('dashboard'),
    enabled,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useStrategicSignals(enabled = true) {
  return useQuery({
    queryKey: ['fscc-signals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fscc_strategic_signals' as any)
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(25);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function usePriorityDecisions(enabled = true) {
  return useQuery({
    queryKey: ['fscc-decisions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fscc_priority_decisions' as any)
        .select('*')
        .order('impact_score', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useScenarioSimulations(enabled = true) {
  return useQuery({
    queryKey: ['fscc-scenarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fscc_scenario_simulations' as any)
        .select('*')
        .order('simulated_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useOrgAlignment(enabled = true) {
  return useQuery({
    queryKey: ['fscc-org'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fscc_org_alignment' as any)
        .select('*')
        .order('alignment_score', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useVisionTracking(enabled = true) {
  return useQuery({
    queryKey: ['fscc-vision'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fscc_vision_tracking' as any)
        .select('*')
        .order('progress_pct', { ascending: false })
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
    mutationFn: (p?: Record<string, unknown>) => invokeFSCC(mode, p),
    onSuccess: () => {
      keys.forEach(k => qc.invalidateQueries({ queryKey: [k] }));
      qc.invalidateQueries({ queryKey: ['fscc-dashboard'] });
      toast.success(`${label} completed`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useAggregateSignals = () => useMut('aggregate_signals', 'Signal Aggregation', ['fscc-signals']);
export const useSurfaceDecisions = () => useMut('surface_decisions', 'Decision Surfacing', ['fscc-decisions']);
export const useSimulateScenarios = () => useMut('simulate_scenario', 'Scenario Simulation', ['fscc-scenarios']);
export const useAssessOrgAlignment = () => useMut('assess_alignment', 'Org Alignment Assessment', ['fscc-org']);
export const useTrackVision = () => useMut('track_vision', 'Vision Tracking', ['fscc-vision']);
