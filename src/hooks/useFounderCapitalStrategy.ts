import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeFCSS(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('founder-capital-strategy', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function useFCSSDashboard() {
  return useQuery({
    queryKey: ['fcss-dashboard'],
    queryFn: () => invokeFCSS('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useDilutionPathway() {
  return useQuery({
    queryKey: ['fcss-dilution-pathway'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fcss_dilution_pathway')
        .select('*')
        .order('round_order');
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useCapitalEfficiency() {
  return useQuery({
    queryKey: ['fcss-capital-efficiency'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fcss_capital_efficiency')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useFCSSOptionality() {
  return useQuery({
    queryKey: ['fcss-strategic-optionality'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fcss_strategic_optionality')
        .select('*')
        .order('strategic_value_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useControlPreservation() {
  return useQuery({
    queryKey: ['fcss-control-preservation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fcss_control_preservation')
        .select('*')
        .order('effectiveness_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useWealthProjection() {
  return useQuery({
    queryKey: ['fcss-wealth-projection'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fcss_wealth_projection')
        .select('*')
        .order('post_tax_wealth_usd', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

// ── Mutations ──

export function useSimulateDilution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeFCSS('simulate_dilution', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['fcss-dilution-pathway'] });
      qc.invalidateQueries({ queryKey: ['fcss-dashboard'] });
      toast.success(`Dilution: ${data?.rounds_modeled ?? 0} rounds, final ownership ${data?.final_ownership_pct?.toFixed(1) ?? 0}%, risk: ${data?.control_risk ?? 'N/A'}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useOptimizeEfficiency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeFCSS('optimize_efficiency', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['fcss-capital-efficiency'] });
      qc.invalidateQueries({ queryKey: ['fcss-dashboard'] });
      toast.success(`Capital efficiency: ${data?.strategies_modeled ?? 0} strategies over ${data?.months_projected ?? 0} months`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMapOptionality() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeFCSS('map_optionality', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['fcss-strategic-optionality'] });
      qc.invalidateQueries({ queryKey: ['fcss-dashboard'] });
      toast.success(`Optionality: ${data?.options_mapped ?? 0} pathways mapped`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function usePreserveControl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeFCSS('preserve_control', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['fcss-control-preservation'] });
      qc.invalidateQueries({ queryKey: ['fcss-dashboard'] });
      toast.success(`Control: ${data?.active_mechanisms ?? 0} active mechanisms, strongest: ${data?.strongest ?? ''}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useProjectWealth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeFCSS('project_wealth', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['fcss-wealth-projection'] });
      qc.invalidateQueries({ queryKey: ['fcss-dashboard'] });
      const range = data?.wealth_range;
      toast.success(`Wealth: $${((range?.min ?? 0) / 1e6).toFixed(1)}M – $${((range?.max ?? 0) / 1e6).toFixed(1)}M, optimal: ${data?.optimal_scenario ?? ''}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
