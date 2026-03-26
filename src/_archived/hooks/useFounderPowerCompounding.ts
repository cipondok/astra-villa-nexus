import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

async function invokeFSPCM(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('founder-power-compounding', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data;
}

// ── Queries ──

export function useFSPCMDashboard(enabled = true) {
  return useQuery({
    queryKey: ['fspcm-dashboard'],
    queryFn: () => invokeFSPCM('dashboard'),
    enabled,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useDecisionCompounding(enabled = true) {
  return useQuery({
    queryKey: ['fspcm-decision-compounding'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fspcm_decision_compounding' as any)
        .select('*')
        .order('decision_quality_score', { ascending: false })
        .limit(40);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useCapitalLeverage(enabled = true) {
  return useQuery({
    queryKey: ['fspcm-capital-leverage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fspcm_capital_leverage' as any)
        .select('*')
        .order('leverage_composite', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useNarrativeAuthority(enabled = true) {
  return useQuery({
    queryKey: ['fspcm-narrative-authority'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fspcm_narrative_authority' as any)
        .select('*')
        .order('authority_composite', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useTalentMagnetism(enabled = true) {
  return useQuery({
    queryKey: ['fspcm-talent-magnetism'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fspcm_talent_magnetism' as any)
        .select('*')
        .order('magnetism_composite', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useLegacyInfluence(enabled = true) {
  return useQuery({
    queryKey: ['fspcm-legacy-influence'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fspcm_legacy_influence' as any)
        .select('*')
        .order('legacy_composite', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

// ── Mutations ──

export function useCompoundDecisions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeFSPCM('compound_decisions', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['fspcm-decision-compounding'] });
      qc.invalidateQueries({ queryKey: ['fspcm-dashboard'] });
      toast.success(`Analyzed ${d?.domains_analyzed ?? 0} domains across ${d?.epochs ?? 4} epochs`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAmplifyCapitalLeverage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeFSPCM('amplify_capital_leverage', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['fspcm-capital-leverage'] });
      toast.success(`Modeled ${d?.sources_modeled ?? 0} capital sources`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useFormNarrativeAuthority() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeFSPCM('form_narrative_authority', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['fspcm-narrative-authority'] });
      toast.success(`Analyzed ${d?.domains_analyzed ?? 0} narrative domains`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useModelTalentMagnetism() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeFSPCM('model_talent_magnetism', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['fspcm-talent-magnetism'] });
      toast.success(`Modeled ${d?.segments_modeled ?? 0} talent segments`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useProjectLegacyInfluence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeFSPCM('project_legacy_influence', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['fspcm-legacy-influence'] });
      qc.invalidateQueries({ queryKey: ['fspcm-dashboard'] });
      toast.success(`Projected ${d?.mechanisms_projected ?? 0} legacy mechanisms`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
