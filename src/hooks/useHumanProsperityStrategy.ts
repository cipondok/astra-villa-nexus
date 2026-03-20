import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeLHPS(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('human-prosperity-strategy', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function useLHPSDashboard() {
  return useQuery({
    queryKey: ['lhps-dashboard'],
    queryFn: () => invokeLHPS('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useProsperityDrivers(region?: string) {
  return useQuery({
    queryKey: ['lhps-drivers', region],
    queryFn: async () => {
      let q = supabase.from('lhps_prosperity_drivers').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useCapitalProductivity(region?: string) {
  return useQuery({
    queryKey: ['lhps-productivity', region],
    queryFn: async () => {
      let q = supabase.from('lhps_capital_productivity').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useSocialOpportunity(region?: string) {
  return useQuery({
    queryKey: ['lhps-social', region],
    queryFn: async () => {
      let q = supabase.from('lhps_social_opportunity').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useGrowthScenarios(region?: string) {
  return useQuery({
    queryKey: ['lhps-scenarios', region],
    queryFn: async () => {
      let q = supabase.from('lhps_growth_scenarios').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(24);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useProsperityInsight() {
  return useQuery({
    queryKey: ['lhps-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lhps_prosperity_insight')
        .select('*')
        .order('prosperity_index', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

// ── Mutations ──

export function useAnalyzeProsperityDrivers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeLHPS('analyze_drivers', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['lhps-drivers'] }); toast.success(`Analyzed ${d?.regions_analyzed ?? 0} regional prosperity drivers`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useOptimizeCapitalProductivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeLHPS('optimize_productivity', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['lhps-productivity'] }); toast.success(`Optimized ${d?.regions_optimized ?? 0} capital productivity models`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMeasureSocialOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeLHPS('measure_social', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['lhps-social'] }); toast.success(`Measured ${d?.regions_measured ?? 0} social opportunity indicators`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSimulateGrowthScenarios() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeLHPS('simulate_growth', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['lhps-scenarios'] }); toast.success(`Generated ${d?.scenarios_generated ?? 0} growth scenarios`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSynthesizeProsperityInsights() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeLHPS('synthesize_insights', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['lhps-insights'] }); qc.invalidateQueries({ queryKey: ['lhps-dashboard'] }); toast.success(`Synthesized ${d?.insights_generated ?? 0} prosperity insights`); },
    onError: (e: Error) => toast.error(e.message),
  });
}
