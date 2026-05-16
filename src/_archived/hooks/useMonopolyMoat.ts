import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

async function invokeGMMA(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('monopoly-moat-engine', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

/** Full GMMA dashboard */
export function useGMMADashboard() {
  return useQuery({
    queryKey: ['gmma-dashboard'],
    queryFn: () => invokeGMMA('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useDataGravity(city?: string) {
  return useQuery({
    queryKey: ['gmma-data-gravity', city],
    queryFn: async () => {
      let q = supabase.from('gmma_data_gravity').select('*').order('moat_depth_score', { ascending: false });
      if (city) q = q.eq('city', city);
      const { data, error } = await (q as any).limit(20);
      if (error) throw error;
      return data;
    },
  });
}

export function useNetworkLockin() {
  return useQuery({
    queryKey: ['gmma-network-lockin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gmma_network_lockin')
        .select('*')
        .order('irreversibility_index', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
  });
}

export function useCapitalDependency() {
  return useQuery({
    queryKey: ['gmma-capital-dependency'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gmma_capital_dependency')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}

export function useWorkflowIntegration() {
  return useQuery({
    queryKey: ['gmma-workflow'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gmma_workflow_integration')
        .select('*')
        .order('retention_probability', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
  });
}

export function useBrandAuthority() {
  return useQuery({
    queryKey: ['gmma-brand-authority'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gmma_brand_authority')
        .select('*')
        .order('default_platform_probability', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}

// ── Mutations ──

export function useMeasureDataGravity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeGMMA('measure_data_gravity', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gmma-data-gravity'] }),
  });
}

export function useAnalyzeNetworkLockin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeGMMA('analyze_network_lockin', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gmma-network-lockin'] }),
  });
}

export function useAssessCapitalDependency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeGMMA('assess_capital_dependency', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gmma-capital-dependency'] }),
  });
}

export function useMeasureWorkflowIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeGMMA('measure_workflow_integration', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gmma-workflow'] }),
  });
}

export function useAssessBrandAuthority() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeGMMA('assess_brand_authority', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gmma-brand-authority'] }),
  });
}
