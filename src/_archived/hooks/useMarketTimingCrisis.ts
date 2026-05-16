import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const invoke = async (mode: string, extra?: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke('market-timing-crisis', {
    body: { mode, ...extra },
  });
  if (error) throw error;
  return data;
};

export function useUMTCSDashboard() {
  return useQuery({
    queryKey: ['umtcs-dashboard'],
    queryFn: () => invoke('dashboard'),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useCycleDetection(city?: string) {
  return useQuery({
    queryKey: ['umtcs-cycles', city],
    queryFn: async () => {
      let q = supabase.from('umtcs_cycle_detection' as any).select('*').order('detected_at', { ascending: false }).limit(50);
      if (city) q = q.eq('city', city);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    staleTime: 20_000,
  });
}

export function useDefensiveStability() {
  return useQuery({
    queryKey: ['umtcs-defensive'],
    queryFn: async () => {
      const { data, error } = await supabase.from('umtcs_defensive_stability' as any).select('*').order('assessed_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 20_000,
  });
}

export function useCountercyclicalGrowth() {
  return useQuery({
    queryKey: ['umtcs-countercyclical'],
    queryFn: async () => {
      const { data, error } = await supabase.from('umtcs_countercyclical_growth' as any).select('*').order('computed_at', { ascending: false }).limit(30);
      if (error) throw error;
      return data;
    },
    staleTime: 20_000,
  });
}

export function useRecoveryAcceleration() {
  return useQuery({
    queryKey: ['umtcs-recovery'],
    queryFn: async () => {
      const { data, error } = await supabase.from('umtcs_recovery_acceleration' as any).select('*').order('detected_at', { ascending: false }).limit(30);
      if (error) throw error;
      return data;
    },
    staleTime: 20_000,
  });
}

export function useTimingAdvantage() {
  return useQuery({
    queryKey: ['umtcs-timing'],
    queryFn: async () => {
      const { data, error } = await supabase.from('umtcs_timing_advantage' as any).select('*').order('computed_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

function useMutationHelper(mode: string, label: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invoke(mode, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['umtcs-dashboard'] });
      toast.success(`${label} computed successfully`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useRunCycleDetection = () => useMutationHelper('cycle_detection', 'Cycle Detection');
export const useRunDefensiveStrategy = () => useMutationHelper('defensive', 'Defensive Stability');
export const useRunCountercyclicalGrowth = () => useMutationHelper('countercyclical', 'Counter-Cyclical Growth');
export const useRunRecoveryAcceleration = () => useMutationHelper('recovery', 'Recovery Acceleration');
export const useRunTimingAdvantage = () => useMutationHelper('timing_advantage', 'Timing Advantage');
