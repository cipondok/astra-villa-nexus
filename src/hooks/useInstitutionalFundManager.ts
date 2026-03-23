import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

async function invokeEngine(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('institutional-fund-manager', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export function useInvestmentFunds() {
  return useQuery({
    queryKey: ['investment-funds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investment_funds' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    staleTime: 30_000,
  });
}

export function useFundPositions(fundId?: string) {
  return useQuery({
    queryKey: ['fund-positions', fundId],
    queryFn: async () => {
      let q = supabase.from('fund_investor_positions' as any).select('*').order('created_at', { ascending: false });
      if (fundId) q = q.eq('fund_id', fundId);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
    enabled: !!fundId,
    staleTime: 30_000,
  });
}

export function useMyFundPositions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-fund-positions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fund_investor_positions' as any)
        .select('*')
        .eq('investor_user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user?.id,
  });
}

export function useFundAssets(fundId?: string) {
  return useQuery({
    queryKey: ['fund-assets', fundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fund_assets' as any)
        .select('*')
        .eq('fund_id', fundId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!fundId,
  });
}

export function useFundNAVHistory(fundId?: string) {
  return useQuery({
    queryKey: ['fund-nav-history', fundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fund_nav_history' as any)
        .select('*')
        .eq('fund_id', fundId!)
        .order('valuation_timestamp', { ascending: false })
        .limit(90);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!fundId,
  });
}

export function useFundCapitalCalls(fundId?: string) {
  return useQuery({
    queryKey: ['fund-capital-calls', fundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fund_capital_calls' as any)
        .select('*')
        .eq('fund_id', fundId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!fundId,
  });
}

export function useFundDistributions(fundId?: string) {
  return useQuery({
    queryKey: ['fund-distributions', fundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fund_distributions' as any)
        .select('*')
        .eq('fund_id', fundId!)
        .order('distribution_date', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!fundId,
  });
}

export function useCalculateNAV() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { fund_id: string }) => invokeEngine('calculate_nav', params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fund-nav-history'] });
      qc.invalidateQueries({ queryKey: ['fund-positions'] });
      toast.success('NAV calculated successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useProcessCapitalCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { capital_call_id: string }) => invokeEngine('process_capital_call', params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fund-capital-calls'] });
      qc.invalidateQueries({ queryKey: ['fund-positions'] });
      qc.invalidateQueries({ queryKey: ['investment-funds'] });
      toast.success('Capital call processed');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useProcessDistribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { fund_id: string; amount: number; distribution_type?: string }) =>
      invokeEngine('process_distribution', params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fund-distributions'] });
      qc.invalidateQueries({ queryKey: ['fund-positions'] });
      toast.success('Distribution processed');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useFundDashboardStats() {
  return useQuery({
    queryKey: ['fund-dashboard-stats'],
    queryFn: () => invokeEngine('fund_dashboard'),
    staleTime: 60_000,
  });
}
