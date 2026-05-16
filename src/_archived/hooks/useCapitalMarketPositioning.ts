import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

async function invokeCMPPM(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('capital-market-positioning', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data;
}

// ── Queries ──

export function useCMPPMDashboard(enabled = true) {
  return useQuery({
    queryKey: ['cmppm-dashboard'],
    queryFn: () => invokeCMPPM('dashboard'),
    enabled,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useNarrativePower(enabled = true) {
  return useQuery({
    queryKey: ['cmppm-narratives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cmppm_narrative_power' as any)
        .select('*')
        .order('narrative_strength_score', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useCategoryLeadership(enabled = true) {
  return useQuery({
    queryKey: ['cmppm-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cmppm_category_leadership' as any)
        .select('*')
        .order('category_ownership_score', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 120_000,
  });
}

export function useScarcityMomentum(enabled = true) {
  return useQuery({
    queryKey: ['cmppm-scarcity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cmppm_scarcity_momentum' as any)
        .select('*')
        .order('fomo_intensity', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useInstitutionalTrust(segment?: string) {
  return useQuery({
    queryKey: ['cmppm-trust', segment],
    queryFn: async () => {
      let q = (supabase.from('cmppm_institutional_trust' as any).select('*') as any)
        .order('trust_score', { ascending: false });
      if (segment) q = q.eq('institution_segment', segment);
      const { data, error } = await q.limit(30);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useValuationFlywheel(enabled = true) {
  return useQuery({
    queryKey: ['cmppm-flywheel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cmppm_valuation_psychology' as any)
        .select('*')
        .order('current_rpm', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

// ── Mutations ──

export function useCraftNarratives() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeCMPPM('craft_narratives'),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['cmppm-narratives'] });
      qc.invalidateQueries({ queryKey: ['cmppm-dashboard'] });
      toast.success(`${data?.dominant_narratives} dominant narratives — strongest: ${data?.strongest}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBuildCategoryLeadership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeCMPPM('build_category_leadership'),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['cmppm-categories'] });
      toast.success(`${data?.categories_positioned} categories positioned, avg ownership: ${data?.avg_ownership}%`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useGenerateScarcitySignals() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeCMPPM('generate_scarcity_signals'),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['cmppm-scarcity'] });
      toast.success(`${data?.high_fomo_signals} high-FOMO signals, avg intensity: ${data?.avg_fomo}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBuildInstitutionalTrust() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeCMPPM('build_institutional_trust'),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['cmppm-trust'] });
      toast.success(`${data?.segments_covered} segments, ${data?.committed_dimensions} at commitment stage`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useComputeValuationFlywheel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeCMPPM('compute_valuation_flywheel'),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['cmppm-flywheel'] });
      qc.invalidateQueries({ queryKey: ['cmppm-dashboard'] });
      toast.success(`Flywheel RPM: ${data?.avg_rpm}, strongest: ${data?.strongest_stage}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
