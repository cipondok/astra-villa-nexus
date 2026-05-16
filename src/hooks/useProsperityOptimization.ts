import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

async function invokePPOP(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('prosperity-optimization-protocol', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

/** Full PPOP dashboard */
export function usePPOPDashboard() {
  return useQuery({
    queryKey: ['ppop-dashboard'],
    queryFn: () => invokePPOP('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Prosperity signals */
export function useProsperitySignals(city?: string) {
  return useQuery({
    queryKey: ['ppop-prosperity-signals', city],
    queryFn: async () => {
      let q = supabase.from('ppop_prosperity_signals').select('*').order('computed_at', { ascending: false });
      if (city) q = q.eq('city', city);
      const { data, error } = await (q as any).limit(50);
      if (error) throw error;
      return data;
    },
  });
}

/** Urban regeneration data */
export function useUrbanRegeneration(city?: string) {
  return useQuery({
    queryKey: ['ppop-urban-regeneration', city],
    queryFn: async () => {
      let q = supabase.from('ppop_urban_regeneration').select('*').order('computed_at', { ascending: false });
      if (city) q = q.eq('city', city);
      const { data, error } = await (q as any).limit(30);
      if (error) throw error;
      return data;
    },
  });
}

/** Opportunity equalization data */
export function useOpportunityEqualization() {
  return useQuery({
    queryKey: ['ppop-opportunity-equalization'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ppop_opportunity_equalization')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}

/** Long-horizon alignment data */
export function useLongHorizonAlignment(city?: string) {
  return useQuery({
    queryKey: ['ppop-long-horizon', city],
    queryFn: async () => {
      let q = supabase.from('ppop_long_horizon_alignment').select('*').order('computed_at', { ascending: false });
      if (city) q = q.eq('city', city);
      const { data, error } = await (q as any).limit(20);
      if (error) throw error;
      return data;
    },
  });
}

/** Feedback loop cycles */
export function useProsperityFeedback() {
  return useQuery({
    queryKey: ['ppop-feedback-loop'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ppop_feedback_loop')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}

/** Mutation: scan prosperity signals */
export function useScanProsperitySignals() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokePPOP('scan_prosperity_signals', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ppop-prosperity-signals'] }),
  });
}

/** Mutation: optimize urban regeneration */
export function useOptimizeRegeneration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokePPOP('optimize_regeneration', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ppop-urban-regeneration'] }),
  });
}

/** Mutation: equalize opportunity */
export function useEqualizeOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokePPOP('equalize_opportunity', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ppop-opportunity-equalization'] }),
  });
}

/** Mutation: align long horizon */
export function useAlignLongHorizon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokePPOP('align_long_horizon', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ppop-long-horizon'] }),
  });
}

/** Mutation: run feedback loop */
export function useRunFeedbackLoop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokePPOP('run_feedback_loop', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ppop-feedback-loop'] }),
  });
}
