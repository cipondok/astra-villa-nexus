import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';
import { toast } from 'sonner';

async function invokeGPWS(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('global-proptech-war', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data;
}

// ── Queries ──

export function useGPWSDashboard(enabled = true) {
  return useQuery({
    queryKey: ['gpws-dashboard'],
    queryFn: () => invokeGPWS('dashboard'),
    enabled,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useMarketInvasion(enabled = true) {
  return useQuery({
    queryKey: ['gpws-invasion'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gpws_market_invasion' as any)
        .select('*')
        .order('sequence_rank')
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useBeachheads(enabled = true) {
  return useQuery({
    queryKey: ['gpws-beachheads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gpws_beachhead' as any)
        .select('*')
        .order('beachhead_strength_score', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useBattlefield(city?: string) {
  return useQuery({
    queryKey: ['gpws-battlefield', city],
    queryFn: async () => {
      let q = (supabase.from('gpws_battlefield' as any).select('*') as any)
        .order('vulnerability_score', { ascending: false });
      if (city) q = q.eq('city', city);
      const { data, error } = await q.limit(30);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useDataSupremacy(enabled = true) {
  return useQuery({
    queryKey: ['gpws-data-supremacy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gpws_data_supremacy' as any)
        .select('*')
        .order('moat_depth_score', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 120_000,
  });
}

export function useExpansionMomentum(enabled = true) {
  return useQuery({
    queryKey: ['gpws-momentum'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gpws_expansion_momentum' as any)
        .select('*')
        .order('flywheel_rpm', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

// ── Mutations ──

export function useSequenceInvasion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeGPWS('sequence_invasion', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gpws-invasion'] });
      qc.invalidateQueries({ queryKey: ['gpws-dashboard'] });
      toast.success(`Sequenced ${data?.markets_sequenced ?? 0} markets — top target: ${data?.top_target}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useFormBeachhead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeGPWS('form_beachhead', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gpws-beachheads'] });
      toast.success(`Beachhead in ${data?.city}: ${data?.phase} (strength ${data?.beachhead_strength})`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMapBattlefield() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeGPWS('map_battlefield', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gpws-battlefield'] });
      toast.success(`Mapped ${data?.competitors_mapped} competitors — weakest: ${data?.weakest}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBuildDataSupremacy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeGPWS('build_data_supremacy'),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gpws-data-supremacy'] });
      toast.success(`${data?.critical_assets} critical data assets, ${data?.total_data_points?.toLocaleString()} total points`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useComputeMomentum() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeGPWS('compute_momentum'),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['gpws-momentum'] });
      qc.invalidateQueries({ queryKey: ['gpws-dashboard'] });
      toast.success(`${data?.dominant} dominant cities, avg RPM: ${data?.avg_rpm}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
