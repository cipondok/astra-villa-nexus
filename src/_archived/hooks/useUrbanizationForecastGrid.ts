import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokePUFG(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('urbanization-forecast-grid', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

export function usePUFGDashboard() {
  return useQuery({
    queryKey: ['pufg-dashboard'],
    queryFn: () => invokePUFG('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useExpansionSignals() {
  return useQuery({
    queryKey: ['pufg-expansion-signals'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pufg_expansion_signals')
        .select('*').order('composite_expansion_signal', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useDistrictLifecycle() {
  return useQuery({
    queryKey: ['pufg-district-lifecycle'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pufg_district_lifecycle')
        .select('*').order('lifecycle_confidence', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useInfrastructureImpact() {
  return useQuery({
    queryKey: ['pufg-infrastructure-impact'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pufg_infrastructure_impact')
        .select('*').order('composite_impact_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useSpatialSequencing() {
  return useQuery({
    queryKey: ['pufg-spatial-sequencing'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pufg_spatial_sequencing')
        .select('*').order('wave_priority_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useSustainableGrowth() {
  return useQuery({
    queryKey: ['pufg-sustainable-growth'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pufg_sustainable_growth')
        .select('*').order('balanced_growth_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

// ── Mutations ──

export function useScanExpansion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePUFG('scan_expansion', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['pufg-expansion-signals'] }); toast.success(`Scanned ${d?.districts_scanned ?? 0} districts`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function usePredictLifecycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePUFG('predict_lifecycle', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['pufg-district-lifecycle'] }); toast.success(`Predicted ${d?.districts_predicted ?? 0} districts`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useProjectInfrastructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePUFG('project_infrastructure', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['pufg-infrastructure-impact'] }); toast.success(`Projected ${d?.projects_projected ?? 0} projects`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useComputeSpatialSequencing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePUFG('compute_sequencing', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['pufg-spatial-sequencing'] }); toast.success(`Sequenced ${d?.districts_sequenced ?? 0} districts`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useOptimizeSustainability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePUFG('optimize_sustainability', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['pufg-sustainable-growth'] }); qc.invalidateQueries({ queryKey: ['pufg-dashboard'] }); toast.success(`Optimized ${d?.districts_optimized ?? 0} districts`); },
    onError: (e: Error) => toast.error(e.message),
  });
}
