import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeGVEM(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('valuation-expansion', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function useGVEMDashboard() {
  return useQuery({
    queryKey: ['gvem-dashboard'],
    queryFn: () => invokeGVEM('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useMarketExpansion() {
  return useQuery({
    queryKey: ['gvem-market-expansion'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gvem_market_expansion')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useMonetizationStack() {
  return useQuery({
    queryKey: ['gvem-monetization-stack'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gvem_monetization_stack')
        .select('*')
        .order('layer_order');
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useNetworkMultiplier() {
  return useQuery({
    queryKey: ['gvem-network-multiplier'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gvem_network_multiplier')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useStrategicOptionality() {
  return useQuery({
    queryKey: ['gvem-strategic-optionality'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gvem_strategic_optionality')
        .select('*')
        .order('expected_value_usd', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useEVSimulator() {
  return useQuery({
    queryKey: ['gvem-ev-simulator'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gvem_ev_simulator')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

// ── Mutations ──

export function useExpandMarket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGVEM('expand_market', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gvem-market-expansion'] });
      qc.invalidateQueries({ queryKey: ['gvem-dashboard'] });
      toast.success(`Market expansion: ${data?.phases_computed ?? 0} phases, TAM $${((data?.tam_total ?? 0) / 1e9).toFixed(0)}B`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useStackMonetization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGVEM('stack_monetization', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gvem-monetization-stack'] });
      qc.invalidateQueries({ queryKey: ['gvem-dashboard'] });
      toast.success(`Monetization: ${data?.layers_stacked ?? 0} layers, implied EV $${((data?.implied_ev ?? 0) / 1e6).toFixed(1)}M`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useComputeNetworkMultiplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGVEM('compute_network', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gvem-network-multiplier'] });
      qc.invalidateQueries({ queryKey: ['gvem-dashboard'] });
      toast.success(`Network effects: ${data?.dimensions_computed ?? 0} dims, ${data?.tipping_points_reached ?? 0} tipped`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAssessOptionality() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGVEM('assess_optionality', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gvem-strategic-optionality'] });
      qc.invalidateQueries({ queryKey: ['gvem-dashboard'] });
      toast.success(`Optionality: ${data?.options_assessed ?? 0} options, EV $${((data?.total_expected_value ?? 0) / 1e6).toFixed(1)}M`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSimulateEV() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGVEM('simulate_ev', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gvem-ev-simulator'] });
      qc.invalidateQueries({ queryKey: ['gvem-dashboard'] });
      const range = data?.ev_range;
      toast.success(`EV Simulation: $${((range?.min ?? 0) / 1e6).toFixed(0)}M – $${((range?.max ?? 0) / 1e6).toFixed(0)}M`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
