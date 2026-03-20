import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokePHES(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('post-human-economic-systems', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function usePHESDashboard() {
  return useQuery({
    queryKey: ['phes-dashboard'],
    queryFn: () => invokePHES('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useAutonomousProductivity(region?: string) {
  return useQuery({
    queryKey: ['phes-productivity', region],
    queryFn: async () => {
      let q = supabase.from('phes_autonomous_productivity').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useResourceDistribution(region?: string) {
  return useQuery({
    queryKey: ['phes-distribution', region],
    queryFn: async () => {
      let q = supabase.from('phes_resource_distribution').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useCapabilityAugmentation(region?: string) {
  return useQuery({
    queryKey: ['phes-augmentation', region],
    queryFn: async () => {
      let q = supabase.from('phes_capability_augmentation').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useEconomicIdentity(region?: string) {
  return useQuery({
    queryKey: ['phes-identity', region],
    queryFn: async () => {
      let q = supabase.from('phes_economic_identity').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function usePolicySimulation(region?: string) {
  return useQuery({
    queryKey: ['phes-policy', region],
    queryFn: async () => {
      let q = supabase.from('phes_policy_simulation').select('*').order('computed_at', { ascending: false });
      if (region) q = q.eq('region', region);
      const { data, error } = await (q as any).limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

// ── Mutations ──

export function useMapProductivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePHES('map_productivity', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['phes-productivity'] }); toast.success(`Mapped ${d?.regions_mapped ?? 0} regions × ${d?.sectors_mapped ?? 0} sectors`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAnalyzeDistribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePHES('analyze_distribution', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['phes-distribution'] }); toast.success(`Analyzed ${d?.regions_analyzed ?? 0} distribution models`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useForecastAugmentation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePHES('forecast_augmentation', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['phes-augmentation'] }); toast.success(`Forecast ${d?.regions_forecast ?? 0} capability augmentation profiles`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useModelIdentity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePHES('model_identity', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['phes-identity'] }); toast.success(`Modeled ${d?.regions_modeled ?? 0} economic identity systems`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSimulatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokePHES('simulate_policy', p),
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['phes-policy'] }); qc.invalidateQueries({ queryKey: ['phes-dashboard'] }); toast.success(`Simulated ${d?.scenarios_simulated ?? 0} policy scenarios`); },
    onError: (e: Error) => toast.error(e.message),
  });
}
