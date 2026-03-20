import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeNEWF(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('network-effect-weaponization', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function useNEWFDashboard() {
  return useQuery({
    queryKey: ['newf-dashboard'],
    queryFn: () => invokeNEWF('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useLiquidityGravity() {
  return useQuery({
    queryKey: ['newf-liquidity-gravity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newf_liquidity_gravity')
        .select('*')
        .order('gravity_pull', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useDataAdvantage() {
  return useQuery({
    queryKey: ['newf-data-advantage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newf_data_advantage')
        .select('*')
        .order('moat_width_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useParticipantLockin() {
  return useQuery({
    queryKey: ['newf-participant-lockin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newf_participant_lockin')
        .select('*')
        .order('switching_friction_index', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useReputationFlywheel() {
  return useQuery({
    queryKey: ['newf-reputation-flywheel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newf_reputation_flywheel')
        .select('*')
        .order('reputation_momentum', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useEcosystemHooks() {
  return useQuery({
    queryKey: ['newf-ecosystem-hooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newf_ecosystem_hooks')
        .select('*')
        .order('integration_depth_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

// ── Mutations ──

export function useComputeGravity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeNEWF('compute_gravity', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['newf-liquidity-gravity'] });
      qc.invalidateQueries({ queryKey: ['newf-dashboard'] });
      toast.success(`Gravity computed: ${data?.districts_computed ?? 0} districts, ${data?.inescapable ?? 0} inescapable`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCompoundData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeNEWF('compound_data', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['newf-data-advantage'] });
      toast.success(`Data compounded: ${data?.domains_computed ?? 0} domains, ${data?.fortress_count ?? 0} fortress`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMeasureLockin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeNEWF('measure_lockin', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['newf-participant-lockin'] });
      toast.success(`Lock-in measured: ${data?.participants_measured ?? 0} types, ${data?.diamond_count ?? 0} diamond`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSpinReputation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeNEWF('spin_reputation', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['newf-reputation-flywheel'] });
      toast.success(`Reputation: ${data?.districts_computed ?? 0} districts, ${data?.dominant ?? 0} dominant`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useExpandEcosystem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeNEWF('expand_ecosystem', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['newf-ecosystem-hooks'] });
      toast.success(`Ecosystem: ${data?.hooks_computed ?? 0} hooks, ${data?.critical ?? 0} critical`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
