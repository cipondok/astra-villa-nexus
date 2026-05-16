import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

async function invokeCopilot(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('sovereign-wealth-copilot', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

/** Full sovereign co-pilot dashboard */
export function useASWCDashboard() {
  return useQuery({
    queryKey: ['aswc-dashboard'],
    queryFn: () => invokeCopilot('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Macro cycle data */
export function useMacroCycles(region?: string) {
  return useQuery({
    queryKey: ['aswc-macro-cycles', region],
    queryFn: async () => {
      let q = supabase.from('aswc_macro_cycles').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await q.limit(30);
      if (error) throw error;
      return data;
    },
  });
}

/** Active portfolio strategies */
export function usePortfolioStrategies() {
  return useQuery({
    queryKey: ['aswc-strategies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aswc_portfolio_strategies')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/** Active mega-deals */
export function useMegaDeals() {
  return useQuery({
    queryKey: ['aswc-mega-deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aswc_mega_deals')
        .select('*')
        .eq('is_active', true)
        .order('estimated_value_usd', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/** Political risk assessments */
export function usePoliticalRisk(country?: string) {
  return useQuery({
    queryKey: ['aswc-political-risk', country],
    queryFn: async () => {
      let q = supabase.from('aswc_political_risk').select('*').order('computed_at', { ascending: false });
      if (country) q = q.eq('country', country);
      const { data, error } = await q.limit(20);
      if (error) throw error;
      return data;
    },
  });
}

/** Pending deployment signals */
export function useDeploymentSignals() {
  return useQuery({
    queryKey: ['aswc-deployment-signals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aswc_deployment_signals')
        .select('*')
        .eq('is_executed', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30_000,
  });
}

/** Mutation: interpret macro cycle */
export function useInterpretMacroCycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeCopilot('interpret_macro_cycle', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aswc-macro-cycles'] }),
  });
}

/** Mutation: generate portfolio strategy */
export function useGenerateStrategy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeCopilot('generate_strategy', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aswc-strategies'] }),
  });
}

/** Mutation: scan mega deals */
export function useScanMegaDeals() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeCopilot('scan_mega_deals', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aswc-mega-deals'] }),
  });
}

/** Mutation: assess political risk */
export function useAssessPoliticalRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeCopilot('assess_political_risk', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aswc-political-risk'] }),
  });
}

/** Mutation: generate deployment signal */
export function useGenerateDeployment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeCopilot('generate_deployment', params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['aswc-deployment-signals'] });
      qc.invalidateQueries({ queryKey: ['aswc-dashboard'] });
    },
  });
}
