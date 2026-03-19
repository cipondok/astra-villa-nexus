import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

async function invokeEngine(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('category-killer-engine', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

/** Full CKPER dashboard */
export function useCKPERDashboard() {
  return useQuery({
    queryKey: ['ckper-dashboard'],
    queryFn: () => invokeEngine('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Evolution phases */
export function useEvolutionPhases() {
  return useQuery({
    queryKey: ['ckper-phases'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('ckper_evolution_phases' as any)
        .select('*')
        .order('phase_number', { ascending: true }) as any);
      if (error) throw error;
      return data;
    },
  });
}

/** Feature stack */
export function useFeatureStack(phaseId?: string) {
  return useQuery({
    queryKey: ['ckper-features', phaseId],
    queryFn: async () => {
      let q = supabase.from('ckper_feature_stack' as any).select('*').order('competitive_uniqueness_score', { ascending: false }) as any;
      if (phaseId) q = q.eq('phase_id', phaseId);
      const { data, error } = await q.limit(30);
      if (error) throw error;
      return data;
    },
  });
}

/** Competitive displacement */
export function useCompetitiveDisplacement() {
  return useQuery({
    queryKey: ['ckper-displacement'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('ckper_competitive_displacement' as any)
        .select('*')
        .order('tracked_at', { ascending: false })
        .limit(15) as any);
      if (error) throw error;
      return data;
    },
  });
}

/** Behavior transformation */
export function useBehaviorTransformation() {
  return useQuery({
    queryKey: ['ckper-behavior'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('ckper_behavior_transformation' as any)
        .select('*')
        .order('measured_at', { ascending: false })
        .limit(10) as any);
      if (error) throw error;
      return data;
    },
  });
}

/** Category ownership */
export function useCategoryOwnership() {
  return useQuery({
    queryKey: ['ckper-ownership'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('ckper_category_ownership' as any)
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(5) as any);
      if (error) throw error;
      return data;
    },
  });
}

/** Mutation: assess a phase */
export function useAssessPhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('assess_phase', params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ckper-phases'] });
      qc.invalidateQueries({ queryKey: ['ckper-features'] });
    },
  });
}

/** Mutation: track competitor displacement */
export function useTrackDisplacement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('track_displacement', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ckper-displacement'] }),
  });
}

/** Mutation: measure behavior shift */
export function useMeasureBehaviorShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('measure_behavior_shift', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ckper-behavior'] }),
  });
}

/** Mutation: assess category ownership */
export function useAssessCategoryOwnership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('assess_category_ownership', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ckper-ownership'] }),
  });
}
