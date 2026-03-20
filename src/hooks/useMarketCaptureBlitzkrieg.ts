import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeMCBM(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('market-capture-blitzkrieg', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function useMCBMDashboard() {
  return useQuery({
    queryKey: ['mcbm-dashboard'],
    queryFn: () => invokeMCBM('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useDistrictDomination() {
  return useQuery({
    queryKey: ['mcbm-district-domination'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mcbm_district_domination')
        .select('*')
        .order('domination_score', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useSupplyFlood() {
  return useQuery({
    queryKey: ['mcbm-supply-flood'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mcbm_supply_flood')
        .select('*')
        .order('supply_deficit_ratio', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useDemandSurge() {
  return useQuery({
    queryKey: ['mcbm-demand-surge'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mcbm_demand_surge')
        .select('*')
        .order('urgency_score', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useCompetitiveWeakness() {
  return useQuery({
    queryKey: ['mcbm-competitive-weakness'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mcbm_competitive_weakness')
        .select('*')
        .order('exploitation_opportunity_score', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useMomentumLoop() {
  return useQuery({
    queryKey: ['mcbm-momentum-loop'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mcbm_momentum_loop')
        .select('*')
        .order('flywheel_momentum', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

// ── Mutations ──

export function useSequenceDistricts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: Record<string, unknown>) => invokeMCBM('sequence_districts', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['mcbm-district-domination'] });
      qc.invalidateQueries({ queryKey: ['mcbm-dashboard'] });
      toast.success(`Sequenced ${data?.districts_sequenced ?? 0} districts, ${data?.blitz_targets ?? 0} BLITZ targets`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useFloodSupply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeMCBM('flood_supply', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['mcbm-supply-flood'] });
      toast.success(`Created ${data?.campaigns_created ?? 0} supply campaigns, ${data?.active ?? 0} active`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useTriggerDemandSurge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeMCBM('trigger_demand_surge', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['mcbm-demand-surge'] });
      toast.success(`Triggered ${data?.surges_triggered ?? 0} surges, ${data?.peak ?? 0} at PEAK`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useExploitWeakness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeMCBM('exploit_weakness', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['mcbm-competitive-weakness'] });
      toast.success(`Analyzed ${data?.competitors_analyzed ?? 0} competitors, top weakness: ${data?.top_weakness}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCompoundMomentum() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeMCBM('compound_momentum', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['mcbm-momentum-loop'] });
      qc.invalidateQueries({ queryKey: ['mcbm-dashboard'] });
      toast.success(`Computed ${data?.districts_computed ?? 0} districts, ${data?.dominant ?? 0} dominant`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
