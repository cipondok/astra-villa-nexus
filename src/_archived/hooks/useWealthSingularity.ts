import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

async function invokeSingularity(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('wealth-singularity', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

/** Full singularity dashboard */
export function useGWSMDashboard() {
  return useQuery({
    queryKey: ['gwsm-dashboard'],
    queryFn: () => invokeSingularity('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Wealth map data */
export function useWealthMap(geography?: string) {
  return useQuery({
    queryKey: ['gwsm-wealth-map', geography],
    queryFn: async () => {
      let q = supabase.from('gwsm_wealth_map').select('*').order('total_value_usd', { ascending: false });
      if (geography) q = q.eq('geography', geography);
      const { data, error } = await q.limit(50);
      if (error) throw error;
      return data;
    },
  });
}

/** Capital flow optimizations */
export function useCapitalFlows() {
  return useQuery({
    queryKey: ['gwsm-capital-flows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gwsm_capital_flows')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });
}

/** Generational forecasts */
export function useGenerationalForecasts(entityType?: string) {
  return useQuery({
    queryKey: ['gwsm-generational', entityType],
    queryFn: async () => {
      let q = supabase.from('gwsm_generational_forecasts').select('*').order('computed_at', { ascending: false });
      if (entityType) q = q.eq('entity_type', entityType);
      const { data, error } = await q.limit(20);
      if (error) throw error;
      return data;
    },
  });
}

/** Risk entropy assessments */
export function useRiskEntropy() {
  return useQuery({
    queryKey: ['gwsm-risk-entropy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gwsm_risk_entropy')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30_000,
  });
}

/** Gravity field rankings */
export function useGravityField() {
  return useQuery({
    queryKey: ['gwsm-gravity-field'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gwsm_gravity_field')
        .select('*')
        .order('gravity_score', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}

/** Mutation: map wealth */
export function useMapWealth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeSingularity('map_wealth', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gwsm-wealth-map'] }),
  });
}

/** Mutation: optimize capital flows */
export function useOptimizeFlows() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeSingularity('optimize_flows', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gwsm-capital-flows'] }),
  });
}

/** Mutation: simulate generational compounding */
export function useSimulateGenerational() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeSingularity('simulate_generational', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gwsm-generational'] }),
  });
}

/** Mutation: assess risk entropy */
export function useAssessRiskEntropy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeSingularity('assess_risk_entropy', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gwsm-risk-entropy'] }),
  });
}

/** Mutation: compute gravity field */
export function useComputeGravityField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeSingularity('compute_gravity_field', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gwsm-gravity-field'] }),
  });
}
