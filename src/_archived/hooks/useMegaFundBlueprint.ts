import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeMFCB(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('mega-fund-blueprint', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function useMFCBDashboard() {
  return useQuery({
    queryKey: ['mfcb-dashboard'],
    queryFn: () => invokeMFCB('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useFundTheses() {
  return useQuery({
    queryKey: ['mfcb-fund-theses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mfcb_fund_thesis')
        .select('*')
        .order('conviction_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useFundStructures() {
  return useQuery({
    queryKey: ['mfcb-fund-structures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mfcb_fund_structure')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useDealOrigination() {
  return useQuery({
    queryKey: ['mfcb-deal-origination'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mfcb_deal_origination')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useCapitalRaising() {
  return useQuery({
    queryKey: ['mfcb-capital-raising'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mfcb_capital_raising')
        .select('*')
        .order('mandate_alignment_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function usePerformanceFlywheel() {
  return useQuery({
    queryKey: ['mfcb-performance-flywheel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mfcb_performance_flywheel')
        .select('*')
        .order('period_quarter', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

// ── Mutations ──

export function useGenerateThesis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeMFCB('generate_thesis', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['mfcb-fund-theses'] });
      qc.invalidateQueries({ queryKey: ['mfcb-dashboard'] });
      toast.success(`Theses: ${data?.theses_generated ?? 0} generated, top: ${data?.top_conviction ?? ''}, avg IRR ${data?.avg_target_irr ?? 0}%`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useStructureFund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeMFCB('structure_fund', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['mfcb-fund-structures'] });
      qc.invalidateQueries({ queryKey: ['mfcb-dashboard'] });
      toast.success(`Funds: ${data?.funds_structured ?? 0} structured, target AUM $${((data?.total_target_aum ?? 0) / 1e6).toFixed(0)}M`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useOriginateDeals() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeMFCB('originate_deals', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['mfcb-deal-origination'] });
      qc.invalidateQueries({ queryKey: ['mfcb-dashboard'] });
      toast.success(`Deals: ${data?.deals_originated ?? 0} originated, ${data?.platform_sourced_pct ?? 0}% platform-sourced`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRaiseCapital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeMFCB('raise_capital', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['mfcb-capital-raising'] });
      qc.invalidateQueries({ queryKey: ['mfcb-dashboard'] });
      toast.success(`Capital: ${data?.lp_segments_targeted ?? 0} LP segments, pipeline $${((data?.total_pipeline_usd ?? 0) / 1e6).toFixed(1)}M`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useComputePerformanceFlywheel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeMFCB('compute_flywheel', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['mfcb-performance-flywheel'] });
      qc.invalidateQueries({ queryKey: ['mfcb-dashboard'] });
      toast.success(`Flywheel: ${data?.quarters_computed ?? 0} quarters, momentum ${data?.final_momentum?.toFixed(1) ?? 0}, stage: ${data?.final_stage ?? ''}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
