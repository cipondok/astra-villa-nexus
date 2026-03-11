import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useLiquidityScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pipeline: string = 'full_forecast') => {
      const { data, error } = await supabase.functions.invoke('liquidity-engine', {
        body: { pipeline },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['liquidity'] });
      toast.success('Liquidity forecast completed');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useLiquidityAbsorption() {
  return useQuery({
    queryKey: ['liquidity', 'absorption'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('liquidity_absorption')
        .select('*')
        .order('liquidity_speed_index', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useLiquidityElasticity() {
  return useQuery({
    queryKey: ['liquidity', 'elasticity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('liquidity_demand_elasticity')
        .select('*')
        .order('city');
      if (error) throw error;
      return data;
    },
  });
}

export function useLiquidityRental() {
  return useQuery({
    queryKey: ['liquidity', 'rental'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('liquidity_rental_stability')
        .select('*')
        .order('cashflow_reliability_index', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useLiquidityCrisis() {
  return useQuery({
    queryKey: ['liquidity', 'crisis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('liquidity_crisis_resilience')
        .select('*')
        .order('stress_liquidity_score', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useLiquidityExit() {
  return useQuery({
    queryKey: ['liquidity', 'exit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('liquidity_exit_timing')
        .select('*')
        .order('liquidity_adjusted_roi', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
