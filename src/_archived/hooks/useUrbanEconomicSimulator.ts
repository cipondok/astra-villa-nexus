import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

async function invokeSimulator(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('urban-economic-simulator', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

/** Full simulator dashboard, optionally filtered by city */
export function useGUESDashboard(city?: string) {
  return useQuery({
    queryKey: ['gues-dashboard', city],
    queryFn: () => invokeSimulator('dashboard', city ? { city } : {}),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Urban growth simulations */
export function useUrbanGrowth(city?: string) {
  return useQuery({
    queryKey: ['gues-urban-growth', city],
    queryFn: async () => {
      let q = supabase.from('gues_urban_growth').select('*').order('computed_at', { ascending: false });
      if (city) q = q.eq('city', city);
      const { data, error } = await q.limit(50);
      if (error) throw error;
      return data;
    },
  });
}

/** Value trajectories */
export function useValueTrajectories(city?: string) {
  return useQuery({
    queryKey: ['gues-value-trajectories', city],
    queryFn: async () => {
      let q = supabase.from('gues_value_trajectories').select('*').order('computed_at', { ascending: false });
      if (city) q = q.eq('city', city);
      const { data, error } = await q.limit(50);
      if (error) throw error;
      return data;
    },
  });
}

/** Capital attraction rankings */
export function useCapitalAttraction() {
  return useQuery({
    queryKey: ['gues-capital-attraction'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gues_capital_attraction')
        .select('*')
        .order('composite_score', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });
}

/** Crisis simulations for a city */
export function useCrisisSimulations(city?: string) {
  return useQuery({
    queryKey: ['gues-crisis-sims', city],
    queryFn: async () => {
      let q = supabase.from('gues_crisis_simulations').select('*').order('computed_at', { ascending: false });
      if (city) q = q.eq('city', city);
      const { data, error } = await q.limit(30);
      if (error) throw error;
      return data;
    },
  });
}

/** Active expansion recommendations */
export function useExpansionRecommendations() {
  return useQuery({
    queryKey: ['gues-expansion-recs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gues_expansion_recommendations')
        .select('*')
        .eq('is_active', true)
        .order('opportunity_score', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/** Mutation: simulate urban growth */
export function useSimulateUrbanGrowth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeSimulator('simulate_urban_growth', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gues-urban-growth'] }),
  });
}

/** Mutation: forecast value trajectory */
export function useForecastValueTrajectory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeSimulator('forecast_value_trajectory', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gues-value-trajectories'] }),
  });
}

/** Mutation: compute capital attraction */
export function useComputeCapitalAttraction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeSimulator('compute_capital_attraction', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gues-capital-attraction'] }),
  });
}

/** Mutation: run crisis simulation */
export function useRunCrisisSimulation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeSimulator('run_crisis_simulation', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gues-crisis-sims'] }),
  });
}

/** Mutation: generate expansion recommendations */
export function useGenerateExpansionRecs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeSimulator('generate_expansion_recs', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gues-expansion-recs'] }),
  });
}
