import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

async function invokeAHCSS(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('ai-human-symbiosis', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data;
}

// ── Queries ──

export function useAHCSSDashboard(enabled = true) {
  return useQuery({
    queryKey: ['ahcss-dashboard'],
    queryFn: () => invokeAHCSS('dashboard'),
    enabled,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useDecisionAugmentation(enabled = true) {
  return useQuery({
    queryKey: ['ahcss-decision-augmentation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ahcss_decision_augmentation' as any)
        .select('*')
        .order('augmentation_composite', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useHumanOversight(enabled = true) {
  return useQuery({
    queryKey: ['ahcss-human-oversight'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ahcss_human_oversight' as any)
        .select('*')
        .order('oversight_composite', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useCapitalCopilot(enabled = true) {
  return useQuery({
    queryKey: ['ahcss-capital-copilot'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ahcss_capital_copilot' as any)
        .select('*')
        .order('copilot_maturity_score', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useTalentEvolution(enabled = true) {
  return useQuery({
    queryKey: ['ahcss-talent-evolution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ahcss_talent_evolution' as any)
        .select('*')
        .order('evolution_composite', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useTrustTransparency(enabled = true) {
  return useQuery({
    queryKey: ['ahcss-trust-transparency'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ahcss_trust_transparency' as any)
        .select('*')
        .order('trust_composite', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

// ── Mutations ──

export function useModelAugmentation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeAHCSS('model_augmentation', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['ahcss-decision-augmentation'] });
      qc.invalidateQueries({ queryKey: ['ahcss-dashboard'] });
      toast.success(`Modeled ${d?.domains_modeled ?? 0} augmentation domains`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAssessOversight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeAHCSS('assess_oversight', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['ahcss-human-oversight'] });
      toast.success(`Assessed ${d?.domains_assessed ?? 0} oversight domains`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSimulateCopilot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeAHCSS('simulate_copilot', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['ahcss-capital-copilot'] });
      toast.success(`Simulated ${d?.domains_simulated ?? 0} copilot domains`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useEvolveTalent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeAHCSS('evolve_talent', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['ahcss-talent-evolution'] });
      toast.success(`Evolved ${d?.skills_modeled ?? 0} skill domains`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBuildTrust() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeAHCSS('build_trust', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['ahcss-trust-transparency'] });
      qc.invalidateQueries({ queryKey: ['ahcss-dashboard'] });
      toast.success(`Assessed trust for ${d?.domains_assessed ?? 0} domains`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
