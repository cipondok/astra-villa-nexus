import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

async function invokeEngine(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('market-creation-engine', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

/** Full AMCE dashboard */
export function useAMCEDashboard() {
  return useQuery({
    queryKey: ['amce-dashboard'],
    queryFn: () => invokeEngine('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Emerging opportunity detections */
export function useOpportunityDetections(city?: string) {
  return useQuery({
    queryKey: ['amce-opportunities', city],
    queryFn: async () => {
      let q = (supabase.from('amce_opportunity_detection' as any).select('*') as any)
        .order('detected_at', { ascending: false });
      if (city) q = q.eq('city', city);
      const { data, error } = await q.limit(20);
      if (error) throw error;
      return data;
    },
  });
}

/** Category formations */
export function useCategoryFormations() {
  return useQuery({
    queryKey: ['amce-categories'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('amce_category_formation' as any)
        .select('*')
        .order('formed_at', { ascending: false })
        .limit(15) as any);
      if (error) throw error;
      return data;
    },
  });
}

/** Demand stimulation campaigns */
export function useDemandStimulation(categoryId?: string) {
  return useQuery({
    queryKey: ['amce-demand', categoryId],
    queryFn: async () => {
      let q = (supabase.from('amce_demand_stimulation' as any).select('*') as any)
        .order('created_at', { ascending: false });
      if (categoryId) q = q.eq('category_id', categoryId);
      const { data, error } = await q.limit(15);
      if (error) throw error;
      return data;
    },
  });
}

/** Liquidity seeding zones */
export function useLiquiditySeeding(categoryId?: string) {
  return useQuery({
    queryKey: ['amce-seeding', categoryId],
    queryFn: async () => {
      let q = (supabase.from('amce_liquidity_seeding' as any).select('*') as any)
        .order('seeded_at', { ascending: false });
      if (categoryId) q = q.eq('category_id', categoryId);
      const { data, error } = await q.limit(15);
      if (error) throw error;
      return data;
    },
  });
}

/** Market maturity assessments */
export function useMarketMaturity() {
  return useQuery({
    queryKey: ['amce-maturity'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('amce_market_maturity' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(10) as any);
      if (error) throw error;
      return data;
    },
  });
}

// ── Mutations ──

export function useDetectOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('detect_opportunity', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['amce-opportunities'] }),
  });
}

export function useFormCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('form_category', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['amce-categories'] }),
  });
}

export function useStimulateDemand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('stimulate_demand', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['amce-demand'] }),
  });
}

export function useSeedLiquidity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('seed_liquidity', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['amce-seeding'] }),
  });
}

export function useAssessMaturity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('assess_maturity', params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['amce-maturity'] });
      qc.invalidateQueries({ queryKey: ['amce-dashboard'] });
    },
  });
}
