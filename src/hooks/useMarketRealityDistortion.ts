import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

async function invokeMRDE(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('market-reality-distortion', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

/** Full MRDE dashboard */
export function useMRDEDashboard() {
  return useQuery({
    queryKey: ['mrde-dashboard'],
    queryFn: () => invokeMRDE('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Narrative momentum data */
export function useNarrativeMomentum() {
  return useQuery({
    queryKey: ['mrde-narratives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mrde_narrative_momentum')
        .select('*')
        .order('narrative_velocity', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}

/** Demand gravity data */
export function useDemandGravity(city?: string) {
  return useQuery({
    queryKey: ['mrde-demand-gravity', city],
    queryFn: async () => {
      let q = supabase.from('mrde_demand_gravity').select('*').order('gravity_pull_score', { ascending: false });
      if (city) q = q.eq('city', city);
      const { data, error } = await (q as any).limit(20);
      if (error) throw error;
      return data;
    },
  });
}

/** Perception velocity data */
export function usePerceptionVelocity() {
  return useQuery({
    queryKey: ['mrde-perception'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mrde_perception_velocity')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
  });
}

/** Competitive dominance data */
export function useCompetitiveDominance() {
  return useQuery({
    queryKey: ['mrde-dominance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mrde_competitive_dominance')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}

/** Phase acceleration data */
export function usePhaseAcceleration() {
  return useQuery({
    queryKey: ['mrde-acceleration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mrde_phase_acceleration')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}

// ── Mutations ──

export function useAmplifyNarratives() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeMRDE('amplify_narratives', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mrde-narratives'] }),
  });
}

export function useConcentrateDemand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeMRDE('concentrate_demand', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mrde-demand-gravity'] }),
  });
}

export function useTrackPerception() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeMRDE('track_perception', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mrde-perception'] }),
  });
}

export function useAssessDominance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeMRDE('assess_dominance', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mrde-dominance'] }),
  });
}

export function useAcceleratePhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeMRDE('accelerate_phase', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mrde-acceleration'] }),
  });
}
