import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

async function invokeEngine(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('capital-flywheel-singularity', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

/** Full GCFS dashboard */
export function useGCFSDashboard() {
  return useQuery({
    queryKey: ['gcfs-dashboard'],
    queryFn: () => invokeEngine('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Capital signals */
export function useCapitalSignals(city?: string) {
  return useQuery({
    queryKey: ['gcfs-signals', city],
    queryFn: async () => {
      let q = (supabase.from('gcfs_capital_signals' as any).select('*') as any)
        .order('detected_at', { ascending: false });
      if (city) q = q.eq('city', city);
      const { data, error } = await q.limit(20);
      if (error) throw error;
      return data;
    },
  });
}

/** Opportunity gravity scores */
export function useOpportunityGravity() {
  return useQuery({
    queryKey: ['gcfs-gravity'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('gcfs_opportunity_gravity' as any)
        .select('*')
        .order('gravity_score', { ascending: false })
        .limit(20) as any);
      if (error) throw error;
      return data;
    },
  });
}

/** Institutional confidence */
export function useInstitutionalConfidence() {
  return useQuery({
    queryKey: ['gcfs-confidence'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('gcfs_institutional_confidence' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(10) as any);
      if (error) throw error;
      return data;
    },
  });
}

/** Liquidity reinforcement */
export function useLiquidityReinforcement() {
  return useQuery({
    queryKey: ['gcfs-liquidity'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('gcfs_liquidity_reinforcement' as any)
        .select('*')
        .order('measured_at', { ascending: false })
        .limit(10) as any);
      if (error) throw error;
      return data;
    },
  });
}

/** Centralization thresholds */
export function useCentralizationThreshold() {
  return useQuery({
    queryKey: ['gcfs-centralization'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('gcfs_centralization_threshold' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(5) as any);
      if (error) throw error;
      return data;
    },
  });
}

/** Mutation: ingest capital signals */
export function useIngestSignals() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('ingest_signals', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gcfs-signals'] }),
  });
}

/** Mutation: score opportunity gravity */
export function useScoreGravity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('score_gravity', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gcfs-gravity'] }),
  });
}

/** Mutation: amplify institutional confidence */
export function useAmplifyConfidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('amplify_confidence', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gcfs-confidence'] }),
  });
}

/** Mutation: reinforce liquidity loop */
export function useReinforceLiquidity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('reinforce_liquidity', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gcfs-liquidity'] }),
  });
}

/** Mutation: assess centralization threshold */
export function useAssessCentralization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('assess_centralization', params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gcfs-centralization'] });
      qc.invalidateQueries({ queryKey: ['gcfs-dashboard'] });
    },
  });
}
