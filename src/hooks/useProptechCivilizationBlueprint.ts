import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

async function invokeHYCB(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('proptech-civilization-blueprint', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data;
}

// ── Queries ──

export function useHYCBDashboard(enabled = true) {
  return useQuery({
    queryKey: ['hycb-dashboard'],
    queryFn: () => invokeHYCB('dashboard'),
    enabled,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useUrbanTransformation(enabled = true) {
  return useQuery({
    queryKey: ['hycb-urban-transformation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hycb_urban_transformation' as any)
        .select('*')
        .order('horizon_year_end')
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useLiquidityEvolution(enabled = true) {
  return useQuery({
    queryKey: ['hycb-liquidity-evolution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hycb_liquidity_evolution' as any)
        .select('*')
        .order('year_horizon')
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useInfrastructureIntelligence(enabled = true) {
  return useQuery({
    queryKey: ['hycb-infrastructure-intelligence'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hycb_infrastructure_intelligence' as any)
        .select('*')
        .order('infrastructure_composite', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useHousingStability(enabled = true) {
  return useQuery({
    queryKey: ['hycb-housing-stability'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hycb_housing_stability' as any)
        .select('*')
        .order('stability_composite', { ascending: false })
        .limit(40);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function usePlatformRelevance(enabled = true) {
  return useQuery({
    queryKey: ['hycb-platform-relevance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hycb_platform_relevance' as any)
        .select('*')
        .order('relevance_composite', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

// ── Mutations ──

export function useSimulateUrbanTransformation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeHYCB('simulate_urban_transformation', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['hycb-urban-transformation'] });
      qc.invalidateQueries({ queryKey: ['hycb-dashboard'] });
      toast.success(`Simulated ${d?.cities_simulated ?? 0} cities across 3 century horizons`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useEvolveLiquidity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeHYCB('evolve_liquidity', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['hycb-liquidity-evolution'] });
      toast.success(`Evolved ${d?.clusters_evolved ?? 0} market clusters across ${d?.eras ?? 6} eras`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useModelInfrastructureIntelligence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeHYCB('model_infrastructure_intelligence', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['hycb-infrastructure-intelligence'] });
      toast.success(`Modeled ${d?.domains_modeled ?? 0} infrastructure intelligence domains`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAssessHousingStability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeHYCB('assess_housing_stability', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['hycb-housing-stability'] });
      toast.success(`Assessed housing stability for ${d?.cities_assessed ?? 0} cities`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useProjectPlatformRelevance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeHYCB('project_platform_relevance', p),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['hycb-platform-relevance'] });
      qc.invalidateQueries({ queryKey: ['hycb-dashboard'] });
      toast.success(`Projected relevance for ${d?.domains_projected ?? 0} domains across ${d?.generations ?? 5} generations`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
