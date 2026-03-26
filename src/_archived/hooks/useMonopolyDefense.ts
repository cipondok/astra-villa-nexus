import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeAMDA(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('monopoly-defense', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function useAMDADashboard() {
  return useQuery({
    queryKey: ['amda-dashboard'],
    queryFn: () => invokeAMDA('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useCompetitorSignals() {
  return useQuery({
    queryKey: ['amda-competitor-signals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('amda_competitor_signals')
        .select('*')
        .order('threat_composite_score', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useCounterMoves() {
  return useQuery({
    queryKey: ['amda-counter-moves'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('amda_counter_moves')
        .select('*')
        .order('planned_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useMoatReinforcement() {
  return useQuery({
    queryKey: ['amda-moat-reinforcement'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('amda_moat_reinforcement')
        .select('*')
        .order('current_strength', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useNarrativeControl() {
  return useQuery({
    queryKey: ['amda-narrative-control'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('amda_narrative_control')
        .select('*')
        .order('category_leadership_index', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useDominanceSimulator() {
  return useQuery({
    queryKey: ['amda-dominance-simulator'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('amda_dominance_simulator')
        .select('*')
        .order('projected_market_share_pct', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

// ── Mutations ──

export function useMonitorCompetitors() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeAMDA('monitor_competitors', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['amda-competitor-signals'] });
      qc.invalidateQueries({ queryKey: ['amda-dashboard'] });
      toast.success(`Detected ${data?.signals_detected ?? 0} signals, ${data?.critical ?? 0} critical threats`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function usePlanCounterMoves() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeAMDA('plan_counter_moves', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['amda-counter-moves'] });
      toast.success(`Planned ${data?.moves_planned ?? 0} counter-moves, ${data?.immediate ?? 0} immediate`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useReinforceMoat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeAMDA('reinforce_moat', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['amda-moat-reinforcement'] });
      toast.success(`Reinforced ${data?.dimensions_reinforced ?? 0} moat dimensions, ${data?.impregnable ?? 0} impregnable`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useControlNarrative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeAMDA('control_narrative', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['amda-narrative-control'] });
      toast.success(`Controlled ${data?.narratives_controlled ?? 0} narratives, ${data?.dominant ?? 0} dominant`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSimulateDominance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeAMDA('simulate_dominance', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['amda-dominance-simulator'] });
      toast.success(`Simulated ${data?.scenarios_simulated ?? 0} scenarios, best share: ${data?.best_share ?? 0}%`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
