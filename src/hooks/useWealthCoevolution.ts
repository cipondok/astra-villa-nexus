import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

async function invokeHAWCE(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('wealth-coevolution', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

/** Full HAWCE dashboard */
export function useHAWCEDashboard() {
  return useQuery({
    queryKey: ['hawce-dashboard'],
    queryFn: () => invokeHAWCE('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Augmented intelligence profiles */
export function useAugmentedIntelligence() {
  return useQuery({
    queryKey: ['hawce-augmented'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hawce_augmented_intelligence')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}

/** Trust architecture profiles */
export function useTrustArchitecture() {
  return useQuery({
    queryKey: ['hawce-trust'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hawce_trust_architecture')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
  });
}

/** Collective intelligence network */
export function useCollectiveIntelligence() {
  return useQuery({
    queryKey: ['hawce-collective'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hawce_collective_intelligence')
        .select('*')
        .order('compounding_epoch', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}

/** Skill evolution journeys */
export function useSkillEvolution() {
  return useQuery({
    queryKey: ['hawce-skills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hawce_skill_evolution')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}

/** Co-evolution flywheel cycles */
export function useCoevolutionFlywheel() {
  return useQuery({
    queryKey: ['hawce-flywheel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hawce_coevolution_flywheel')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}

// ── Mutations ──

export function useAugmentIntelligence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeHAWCE('augment_intelligence', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hawce-augmented'] }),
  });
}

export function useBuildTrust() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeHAWCE('build_trust', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hawce-trust'] }),
  });
}

export function useCompoundCollective() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeHAWCE('compound_collective', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hawce-collective'] }),
  });
}

export function useEvolveSkills() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeHAWCE('evolve_skills', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hawce-skills'] }),
  });
}

export function useSpinCoevolution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeHAWCE('spin_coevolution', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hawce-flywheel'] }),
  });
}
