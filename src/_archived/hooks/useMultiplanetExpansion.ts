import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

async function invokeMPEEM(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('multiplanet-expansion', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

/** Full MPEEM dashboard */
export function useMPEEMDashboard() {
  return useQuery({
    queryKey: ['mpeem-dashboard'],
    queryFn: () => invokeMPEEM('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Infrastructure investments by planet */
export function useOffWorldInfrastructure(planet?: string) {
  return useQuery({
    queryKey: ['mpeem-infrastructure', planet],
    queryFn: async () => {
      let q = supabase.from('mpeem_infrastructure_investment').select('*').order('computed_at', { ascending: false });
      if (planet) q = q.eq('planet', planet);
      const { data, error } = await (q as any).limit(30);
      if (error) throw error;
      return data;
    },
  });
}

/** Property rights by planet */
export function usePlanetaryPropertyRights(planet?: string) {
  return useQuery({
    queryKey: ['mpeem-property-rights', planet],
    queryFn: async () => {
      let q = supabase.from('mpeem_property_rights').select('*').order('computed_at', { ascending: false });
      if (planet) q = q.eq('planet', planet);
      const { data, error } = await (q as any).limit(20);
      if (error) throw error;
      return data;
    },
  });
}

/** Interplanetary capital flows */
export function useInterplanetaryFlows() {
  return useQuery({
    queryKey: ['mpeem-capital-flows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mpeem_capital_flows')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}

/** Frontier growth forecasts */
export function useFrontierGrowth(planet?: string) {
  return useQuery({
    queryKey: ['mpeem-frontier-growth', planet],
    queryFn: async () => {
      let q = supabase.from('mpeem_frontier_growth').select('*').order('computed_at', { ascending: false });
      if (planet) q = q.eq('planet', planet);
      const { data, error } = await (q as any).limit(15);
      if (error) throw error;
      return data;
    },
  });
}

/** Expansion flywheel cycles */
export function useExpansionFlywheel() {
  return useQuery({
    queryKey: ['mpeem-flywheel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mpeem_expansion_flywheel')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}

/** Mutation: invest in off-world infrastructure */
export function useInvestInfrastructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeMPEEM('invest_infrastructure', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mpeem-infrastructure'] }),
  });
}

/** Mutation: register property rights */
export function useRegisterPropertyRights() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeMPEEM('register_property_rights', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mpeem-property-rights'] }),
  });
}

/** Mutation: route capital flows */
export function useRouteCapitalFlows() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeMPEEM('route_capital_flows', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mpeem-capital-flows'] }),
  });
}

/** Mutation: forecast frontier growth */
export function useForecastFrontierGrowth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeMPEEM('forecast_frontier_growth', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mpeem-frontier-growth'] }),
  });
}

/** Mutation: spin expansion flywheel */
export function useSpinExpansionFlywheel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeMPEEM('spin_expansion_flywheel', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mpeem-flywheel'] }),
  });
}
