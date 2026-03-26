import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeIHWI(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('infinite-horizon-wealth', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function useIHWIDashboard() {
  return useQuery({
    queryKey: ['ihwi-dashboard'],
    queryFn: () => invokeIHWI('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useStructuralDrivers(region?: string) {
  return useQuery({
    queryKey: ['ihwi-drivers', region],
    queryFn: async () => {
      let q = supabase.from('ihwi_structural_drivers').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useCapitalGrowth(region?: string) {
  return useQuery({
    queryKey: ['ihwi-growth', region],
    queryFn: async () => {
      let q = supabase.from('ihwi_capital_growth').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useGenerationalContinuity(region?: string) {
  return useQuery({
    queryKey: ['ihwi-continuity', region],
    queryFn: async () => {
      let q = supabase.from('ihwi_generational_continuity').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useResilienceAlignment(region?: string) {
  return useQuery({
    queryKey: ['ihwi-resilience', region],
    queryFn: async () => {
      let q = supabase.from('ihwi_resilience_alignment').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useDecisionIntelligence(region?: string) {
  return useQuery({
    queryKey: ['ihwi-decisions', region],
    queryFn: async () => {
      let q = supabase.from('ihwi_decision_intelligence').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

// ── Mutations ──

export function useAnalyzeStructuralDrivers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeIHWI('analyze_drivers', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['ihwi-drivers'] }); toast.success(`Analyzed ${d?.regions_analyzed ?? 0} structural wealth drivers`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSimulateCapitalGrowth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeIHWI('simulate_growth', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['ihwi-growth'] }); toast.success(`Simulated ${d?.scenarios_simulated ?? 0} capital growth scenarios`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMeasureContinuity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeIHWI('measure_continuity', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['ihwi-continuity'] }); toast.success(`Measured ${d?.regions_measured ?? 0} generational continuity profiles`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAssessResilience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeIHWI('assess_resilience', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['ihwi-resilience'] }); toast.success(`Assessed ${d?.regions_assessed ?? 0} resilience alignments`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSynthesizeDecisions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeIHWI('synthesize_decisions', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['ihwi-decisions'] }); qc.invalidateQueries({ queryKey: ['ihwi-dashboard'] }); toast.success(`Synthesized ${d?.regions_synthesized ?? 0} decision intelligence profiles`); },
    onError: (e: Error) => toast.error(e.message),
  });
}
