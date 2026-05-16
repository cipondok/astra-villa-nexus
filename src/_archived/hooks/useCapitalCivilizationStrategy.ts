import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

async function invokeFYCS(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('capital-civilization-strategy', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data;
}

// ── Queries ──

export function useFYCSDashboard(enabled = true) {
  return useQuery({
    queryKey: ['fycs-dashboard'],
    queryFn: () => invokeFYCS('dashboard'),
    enabled,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useUrbanMacrocycles(enabled = true) {
  return useQuery({
    queryKey: ['fycs-urban-macrocycles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fycs_urban_macrocycle' as any)
        .select('*')
        .order('decade_horizon')
        .order('megacity_probability', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useCapitalGravity(enabled = true) {
  return useQuery({
    queryKey: ['fycs-capital-gravity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fycs_capital_gravity' as any)
        .select('*')
        .order('gravity_pull_index', { ascending: false })
        .limit(40);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useEconomicStability(enabled = true) {
  return useQuery({
    queryKey: ['fycs-economic-stability'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fycs_economic_stability' as any)
        .select('*')
        .order('stability_composite_score', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useInnovationWaves(enabled = true) {
  return useQuery({
    queryKey: ['fycs-innovation-waves'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fycs_innovation_waves' as any)
        .select('*')
        .order('synchronization_score', { ascending: false })
        .limit(40);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useStrategicPositioning(enabled = true) {
  return useQuery({
    queryKey: ['fycs-strategic-positioning'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fycs_strategic_positioning' as any)
        .select('*')
        .order('relevance_score', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

// ── Mutations ──

export function useSimulateMacrocycles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeFYCS('simulate_macrocycles', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['fycs-urban-macrocycles'] });
      qc.invalidateQueries({ queryKey: ['fycs-dashboard'] });
      toast.success(`Simulated ${d?.cities_simulated ?? 0} cities over ${d?.decades_projected ?? 5} decades`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMapCapitalGravity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeFYCS('map_capital_gravity', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['fycs-capital-gravity'] });
      toast.success(`Mapped ${d?.clusters_mapped ?? 0} capital clusters`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAssessStability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeFYCS('assess_stability', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['fycs-economic-stability'] });
      toast.success(`Assessed stability for ${d?.cities_assessed ?? 0} cities`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSyncInnovationWaves() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeFYCS('sync_innovation_waves', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['fycs-innovation-waves'] });
      toast.success(`Synced ${d?.waves_synced ?? 0} innovation waves`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function usePositionStrategy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeFYCS('position_strategy', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['fycs-strategic-positioning'] });
      qc.invalidateQueries({ queryKey: ['fycs-dashboard'] });
      toast.success(`Positioned ${d?.domains_positioned ?? 0} domains across ${d?.scenarios ?? 3} scenarios`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
