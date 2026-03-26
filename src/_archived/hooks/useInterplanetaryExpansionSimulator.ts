import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeIEES(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('interplanetary-expansion-simulator', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function useIEESDashboard() {
  return useQuery({
    queryKey: ['iees-dashboard'],
    queryFn: () => invokeIEES('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useFrontierSettlement(zone?: string) {
  return useQuery({
    queryKey: ['iees-settlement', zone],
    queryFn: async () => {
      let q = supabase.from('iees_frontier_settlement').select('*').order('computed_at', { ascending: false });
      if (zone) q = q.eq('frontier_zone', zone);
      const { data, error } = await (q as any).limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useResourceLogistics(zone?: string) {
  return useQuery({
    queryKey: ['iees-logistics', zone],
    queryFn: async () => {
      let q = supabase.from('iees_resource_logistics').select('*').order('computed_at', { ascending: false });
      if (zone) q = q.eq('frontier_zone', zone);
      const { data, error } = await (q as any).limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useEcosystemFormation(zone?: string) {
  return useQuery({
    queryKey: ['iees-ecosystem', zone],
    queryFn: async () => {
      let q = supabase.from('iees_ecosystem_formation').select('*').order('computed_at', { ascending: false });
      if (zone) q = q.eq('frontier_zone', zone);
      const { data, error } = await (q as any).limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useScenarioSimulation(zone?: string) {
  return useQuery({
    queryKey: ['iees-scenarios', zone],
    queryFn: async () => {
      let q = supabase.from('iees_scenario_simulation').select('*').order('computed_at', { ascending: false });
      if (zone) q = q.eq('frontier_zone', zone);
      const { data, error } = await (q as any).limit(30);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useIEESDecisionSupport() {
  return useQuery({
    queryKey: ['iees-decisions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('iees_decision_support')
        .select('*')
        .order('opportunity_score', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

// ── Mutations ──

export function useSimulateSettlement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeIEES('simulate_settlement', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['iees-settlement'] }); toast.success(`Simulated ${d?.zones_simulated ?? 0} frontier zones`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useOptimizeLogistics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeIEES('optimize_logistics', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['iees-logistics'] }); toast.success(`Optimized ${d?.zones_optimized ?? 0} logistics networks`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useForecastEcosystem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeIEES('forecast_ecosystem', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['iees-ecosystem'] }); toast.success(`Forecast ${d?.zones_forecast ?? 0} ecosystems`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRunScenarios() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeIEES('run_scenarios', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['iees-scenarios'] }); toast.success(`Generated ${d?.scenarios_generated ?? 0} scenarios`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useGenerateDecisions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeIEES('generate_decisions', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['iees-decisions'] }); qc.invalidateQueries({ queryKey: ['iees-dashboard'] }); toast.success(`Generated ${d?.decisions_generated ?? 0} decision insights`); },
    onError: (e: Error) => toast.error(e.message),
  });
}
