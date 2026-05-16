import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePortfolioOptimizerScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pipeline: string = 'full_optimize') => {
      const { data, error } = await supabase.functions.invoke('portfolio-optimizer', {
        body: { pipeline },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio-optimizer'] });
      toast.success('Portfolio optimization complete');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useOptimizerPerformance() {
  return useQuery({
    queryKey: ['portfolio-optimizer', 'performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_optimizer_performance')
        .select('*')
        .order('efficiency_score', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useOptimizerDiversification() {
  return useQuery({
    queryKey: ['portfolio-optimizer', 'diversification'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_optimizer_diversification')
        .select('*')
        .order('concentration_risk', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useOptimizerAllocations() {
  return useQuery({
    queryKey: ['portfolio-optimizer', 'allocations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_optimizer_allocations')
        .select('*')
        .order('rebalance_priority', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useOptimizerRebalancing() {
  return useQuery({
    queryKey: ['portfolio-optimizer', 'rebalancing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_optimizer_rebalancing')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useOptimizerScenarios() {
  return useQuery({
    queryKey: ['portfolio-optimizer', 'scenarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_optimizer_scenarios')
        .select('*')
        .order('scenario_name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}
