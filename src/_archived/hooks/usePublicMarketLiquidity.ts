import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokePMLG(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('public-market-liquidity', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function usePMLGDashboard() {
  return useQuery({
    queryKey: ['pmlg-dashboard'],
    queryFn: () => invokePMLG('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useLiquidityDrivers() {
  return useQuery({
    queryKey: ['pmlg-drivers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pmlg_liquidity_drivers' as any)
        .select('*')
        .order('measured_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useNarrativeMomentumPMLG() {
  return useQuery({
    queryKey: ['pmlg-narrative'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pmlg_narrative_momentum' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useEcosystemExpansion() {
  return useQuery({
    queryKey: ['pmlg-expansion'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pmlg_ecosystem_expansion' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useParticipationStability() {
  return useQuery({
    queryKey: ['pmlg-stability'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pmlg_participation_stability' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useFeedbackLoopPMLG() {
  return useQuery({
    queryKey: ['pmlg-loop'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pmlg_feedback_loop' as any)
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
    mutationFn: (p?: Record<string, unknown>) => invokePMLG(mode, p),
    onSuccess: (data) => {
      keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      qc.invalidateQueries({ queryKey: ['pmlg-dashboard'] });
      toast.success(`${label}: ${JSON.stringify(data).slice(0, 80)}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useAnalyzeDrivers = () => useMut('analyze_drivers', 'Liquidity Drivers', ['pmlg-drivers']);
export const useReinforceNarrative = () => useMut('reinforce_narrative', 'Narrative Momentum', ['pmlg-narrative']);
export const useSignalExpansion = () => useMut('signal_expansion', 'Ecosystem Expansion', ['pmlg-expansion']);
export const useStabilizeParticipation = () => useMut('stabilize_participation', 'Participation Stability', ['pmlg-stability']);
export const useOptimizeLoop = () => useMut('optimize_loop', 'Feedback Loop', ['pmlg-loop']);
