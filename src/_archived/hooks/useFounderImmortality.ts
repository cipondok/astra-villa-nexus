import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

async function invokeAFIBA(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('founder-immortality-engine', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

/** Full AFIBA dashboard */
export function useAFIBADashboard() {
  return useQuery({
    queryKey: ['afiba-dashboard'],
    queryFn: () => invokeAFIBA('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Intelligence captures */
export function useIntelligenceCaptures() {
  return useQuery({
    queryKey: ['afiba-captures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('afiba_intelligence_capture')
        .select('*')
        .eq('is_active', true)
        .order('captured_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });
}

/** Strategic memories */
export function useStrategicMemories() {
  return useQuery({
    queryKey: ['afiba-memories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('afiba_strategic_memory')
        .select('*')
        .order('strategic_advantage_index', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}

/** Leadership simulations */
export function useLeadershipSimulations() {
  return useQuery({
    queryKey: ['afiba-simulations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('afiba_leadership_simulation')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
  });
}

/** Vision evolution */
export function useVisionEvolution() {
  return useQuery({
    queryKey: ['afiba-vision'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('afiba_vision_evolution')
        .select('*')
        .order('evolution_epoch', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}

/** Legacy governance */
export function useLegacyGovernance() {
  return useQuery({
    queryKey: ['afiba-governance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('afiba_legacy_governance')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}

/** Mutation: capture founder intelligence */
export function useCaptureIntelligence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeAFIBA('capture_intelligence', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['afiba-captures'] }),
  });
}

/** Mutation: compound strategic memory */
export function useCompoundMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeAFIBA('compound_memory', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['afiba-memories'] }),
  });
}

/** Mutation: simulate leadership */
export function useSimulateLeadership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeAFIBA('simulate_leadership', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['afiba-simulations'] }),
  });
}

/** Mutation: evolve vision */
export function useEvolveVision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeAFIBA('evolve_vision', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['afiba-vision'] }),
  });
}

/** Mutation: governance review */
export function useGovernanceReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeAFIBA('governance_review', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['afiba-governance'] }),
  });
}
