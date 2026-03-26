import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeCWSE(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('civilizational-wealth-stability', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function useCWSEDashboard() {
  return useQuery({
    queryKey: ['cwse-dashboard'],
    queryFn: () => invokeCWSE('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useStructuralResilience(region?: string) {
  return useQuery({
    queryKey: ['cwse-resilience', region],
    queryFn: async () => {
      let q = supabase.from('cwse_structural_resilience').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useInterventionScenarios(region?: string) {
  return useQuery({
    queryKey: ['cwse-interventions', region],
    queryFn: async () => {
      let q = supabase.from('cwse_intervention_scenarios').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useGenerationalWealth(region?: string) {
  return useQuery({
    queryKey: ['cwse-generational', region],
    queryFn: async () => {
      let q = supabase.from('cwse_generational_wealth').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(40);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useShockAbsorption(region?: string) {
  return useQuery({
    queryKey: ['cwse-shocks', region],
    queryFn: async () => {
      let q = supabase.from('cwse_shock_absorption').select('*').order('early_warning_score', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useCivilizationInsight() {
  return useQuery({
    queryKey: ['cwse-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cwse_civilization_insight')
        .select('*')
        .order('global_stability_index', { ascending: false })
        .limit(16);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

// ── Mutations ──

export function useMonitorResilience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeCWSE('monitor_resilience', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['cwse-resilience'] }); toast.success(`Monitored ${d?.regions_monitored ?? 0} regions`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSimulateInterventions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeCWSE('simulate_interventions', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['cwse-interventions'] }); toast.success(`Simulated ${d?.scenarios_simulated ?? 0} interventions`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useForecastGenerational() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeCWSE('forecast_generational', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['cwse-generational'] }); toast.success(`Forecast ${d?.cohorts_forecast ?? 0} generational cohorts`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAnalyzeShocks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeCWSE('analyze_shocks', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['cwse-shocks'] }); toast.success(`Analyzed ${d?.shock_analyses ?? 0} shock scenarios`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSynthesizeInsights() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeCWSE('synthesize_insights', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['cwse-insights'] }); qc.invalidateQueries({ queryKey: ['cwse-dashboard'] }); toast.success(`Synthesized ${d?.insights_generated ?? 0} civilization insights`); },
    onError: (e: Error) => toast.error(e.message),
  });
}
