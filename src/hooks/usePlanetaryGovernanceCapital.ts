import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokePGCM(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('planetary-governance-capital', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function usePGCMDashboard() {
  return useQuery({
    queryKey: ['pgcm-dashboard'],
    queryFn: () => invokePGCM('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useCapitalAllocation(region?: string) {
  return useQuery({
    queryKey: ['pgcm-allocation', region],
    queryFn: async () => {
      let q = supabase.from('pgcm_capital_allocation').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useDevelopmentPriority(region?: string) {
  return useQuery({
    queryKey: ['pgcm-development', region],
    queryFn: async () => {
      let q = supabase.from('pgcm_development_priority').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useInstitutionalCoordination(region?: string) {
  return useQuery({
    queryKey: ['pgcm-coordination', region],
    queryFn: async () => {
      let q = supabase.from('pgcm_institutional_coordination').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useSovereignSimulation(region?: string) {
  return useQuery({
    queryKey: ['pgcm-simulation', region],
    queryFn: async () => {
      let q = supabase.from('pgcm_sovereign_simulation').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useGovernanceInsight(region?: string) {
  return useQuery({
    queryKey: ['pgcm-governance', region],
    queryFn: async () => {
      let q = supabase.from('pgcm_governance_insight').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

// ── Mutations ──

export function useAllocateCapital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePGCM('allocate_capital', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['pgcm-allocation'] }); toast.success(`Allocated capital across ${d?.regions_allocated ?? 0} regions`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useOptimizePriorities() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePGCM('optimize_priorities', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['pgcm-development'] }); toast.success(`Optimized priorities for ${d?.regions_optimized ?? 0} regions`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCoordinateInstitutions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePGCM('coordinate_institutions', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['pgcm-coordination'] }); toast.success(`Coordinated ${d?.regions_coordinated ?? 0} institutional frameworks`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSimulateSovereign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePGCM('simulate_sovereign', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['pgcm-simulation'] }); toast.success(`Simulated ${d?.scenarios_simulated ?? 0} sovereign scenarios`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSynthesizeGovernance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePGCM('synthesize_governance', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['pgcm-governance'] }); qc.invalidateQueries({ queryKey: ['pgcm-dashboard'] }); toast.success(`Synthesized ${d?.regions_synthesized ?? 0} governance insights`); },
    onError: (e: Error) => toast.error(e.message),
  });
}
