import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeGCCE(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('capital-consciousness-engine', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

/** Full GCCE dashboard */
export function useGCCEDashboard() {
  return useQuery({
    queryKey: ['gcce-dashboard'],
    queryFn: () => invokeGCCE('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Capital Flow Awareness */
export function useCapitalFlowAwareness() {
  return useQuery({
    queryKey: ['gcce-capital-flows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gcce_capital_flow_awareness')
        .select('*')
        .order('net_flow_usd', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

/** Systemic Risk */
export function useSystemicRisk() {
  return useQuery({
    queryKey: ['gcce-systemic-risk'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gcce_systemic_risk')
        .select('*')
        .order('composite_systemic_risk', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

/** Opportunity Cycles */
export function useOpportunityCycles() {
  return useQuery({
    queryKey: ['gcce-opportunity-cycles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gcce_opportunity_cycles')
        .select('*')
        .order('long_term_conviction_index', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

/** Scenario Simulations */
export function useScenarioSimulations(scenarioType?: string) {
  return useQuery({
    queryKey: ['gcce-scenario-simulations', scenarioType],
    queryFn: async () => {
      let query = supabase
        .from('gcce_scenario_simulation')
        .select('*')
        .order('risk_adjusted_return', { ascending: false });
      if (scenarioType) query = query.eq('scenario_type', scenarioType);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

/** Decision Support */
export function useDecisionSupport() {
  return useQuery({
    queryKey: ['gcce-decision-support'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gcce_decision_support')
        .select('*')
        .order('confidence_level', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

// ── Mutations ──

export function useAnalyzeFlows() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGCCE('analyze_flows', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gcce-capital-flows'] });
      toast.success(`Analyzed flows for ${data?.cities_analyzed ?? 0} cities`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMapSystemicRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGCCE('map_systemic_risk', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gcce-systemic-risk'] });
      toast.success(`Risk mapped for ${data?.cities_risk_mapped ?? 0} cities`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useForecastCycles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGCCE('forecast_cycles', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gcce-opportunity-cycles'] });
      toast.success(`Forecasted cycles for ${data?.cities_forecasted ?? 0} cities`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSimulateScenarios() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGCCE('simulate_scenario', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gcce-scenario-simulations'] });
      toast.success(`Simulated ${data?.scenarios_simulated ?? 0} scenarios`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useGenerateInsights() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGCCE('generate_insights', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gcce-decision-support'] });
      qc.invalidateQueries({ queryKey: ['gcce-dashboard'] });
      toast.success(`Generated ${data?.insights_generated ?? 0} decision insights`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
