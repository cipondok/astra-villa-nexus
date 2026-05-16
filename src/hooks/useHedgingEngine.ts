import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useHedgingScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pipeline: string = 'full_hedge') => {
      const { data, error } = await supabase.functions.invoke('hedging-engine', {
        body: { pipeline },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hedging'] });
      toast.success('Risk hedging analysis completed');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useHedgingMacroRisk() {
  return useQuery({
    queryKey: ['hedging', 'macro_risk'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hedging_macro_risk')
        .select('*')
        .order('macro_risk_pressure_index', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useHedgingExposure() {
  return useQuery({
    queryKey: ['hedging', 'exposure'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hedging_portfolio_exposure')
        .select('*')
        .order('vulnerability_score', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useHedgingStrategies() {
  return useQuery({
    queryKey: ['hedging', 'strategies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hedging_strategies')
        .select('*')
        .order('priority_rank', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useHedgingDownside() {
  return useQuery({
    queryKey: ['hedging', 'downside'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hedging_downside_protection')
        .select('*')
        .order('max_drawdown_pct', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useHedgingSafeHavens() {
  return useQuery({
    queryKey: ['hedging', 'safe_havens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hedging_safe_havens')
        .select('*')
        .order('safe_haven_rank', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}
