import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

async function invokeEngine(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('competitive-extinction-engine', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

/** Full ACES dashboard */
export function useACESDashboard() {
  return useQuery({
    queryKey: ['aces-dashboard'],
    queryFn: () => invokeEngine('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Intelligence superiority data */
export function useIntelligenceSuperiority() {
  return useQuery({
    queryKey: ['aces-intelligence'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('aces_intelligence_superiority' as any)
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(15) as any);
      if (error) throw error;
      return data;
    },
  });
}

/** Network acceleration metrics */
export function useNetworkAcceleration() {
  return useQuery({
    queryKey: ['aces-network'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('aces_network_acceleration' as any)
        .select('*')
        .order('measured_at', { ascending: false })
        .limit(10) as any);
      if (error) throw error;
      return data;
    },
  });
}

/** Execution dominance data */
export function useExecutionDominance() {
  return useQuery({
    queryKey: ['aces-execution'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('aces_execution_dominance' as any)
        .select('*')
        .order('measured_at', { ascending: false })
        .limit(10) as any);
      if (error) throw error;
      return data;
    },
  });
}

/** Ecosystem depth metrics */
export function useEcosystemDepth() {
  return useQuery({
    queryKey: ['aces-ecosystem'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('aces_ecosystem_depth' as any)
        .select('*')
        .order('measured_at', { ascending: false })
        .limit(10) as any);
      if (error) throw error;
      return data;
    },
  });
}

/** Extinction indicators */
export function useExtinctionIndicators() {
  return useQuery({
    queryKey: ['aces-extinction'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('aces_extinction_indicators' as any)
        .select('*')
        .order('tracked_at', { ascending: false })
        .limit(15) as any);
      if (error) throw error;
      return data;
    },
  });
}

/** Mutation: compound intelligence */
export function useCompoundIntelligence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('compound_intelligence', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aces-intelligence'] }),
  });
}

/** Mutation: accelerate network */
export function useAccelerateNetwork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('accelerate_network', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aces-network'] }),
  });
}

/** Mutation: measure execution speed */
export function useMeasureExecution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('measure_execution', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aces-execution'] }),
  });
}

/** Mutation: assess ecosystem depth */
export function useAssessEcosystem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('assess_ecosystem', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aces-ecosystem'] }),
  });
}

/** Mutation: track competitor extinction */
export function useTrackExtinction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeEngine('track_extinction', params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aces-extinction'] }),
  });
}
