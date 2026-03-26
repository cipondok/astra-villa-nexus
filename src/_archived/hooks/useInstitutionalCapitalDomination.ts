import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeICD(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('institutional-capital-domination', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function useICDDashboard() {
  return useQuery({
    queryKey: ['icd-dashboard'],
    queryFn: () => invokeICD('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useTrustStack() {
  return useQuery({
    queryKey: ['icd-trust'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('icd_trust_stack' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useCapitalAlignment() {
  return useQuery({
    queryKey: ['icd-alignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('icd_capital_alignment' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function usePartnershipLifecycle() {
  return useQuery({
    queryKey: ['icd-lifecycle'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('icd_partnership_lifecycle' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useStabilitySignaling() {
  return useQuery({
    queryKey: ['icd-stability'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('icd_stability_signaling' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useMultiCycleStrategy() {
  return useQuery({
    queryKey: ['icd-multi-cycle'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('icd_multi_cycle' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

// ── Mutations ──

function useMut(mode: string, label: string, keys: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p?: Record<string, unknown>) => invokeICD(mode, p),
    onSuccess: (data) => {
      keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      qc.invalidateQueries({ queryKey: ['icd-dashboard'] });
      toast.success(`${label}: ${JSON.stringify(data).slice(0, 80)}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useBuildTrust = () => useMut('build_trust', 'Trust Stack', ['icd-trust']);
export const useAlignCapital = () => useMut('align_capital', 'Capital Alignment', ['icd-alignment']);
export const useManageLifecycle = () => useMut('manage_lifecycle', 'Partnership Lifecycle', ['icd-lifecycle']);
export const useSignalStability = () => useMut('signal_stability', 'Stability Signaling', ['icd-stability']);
export const useSustainMultiCycle = () => useMut('sustain_multi_cycle', 'Multi-Cycle', ['icd-multi-cycle']);
