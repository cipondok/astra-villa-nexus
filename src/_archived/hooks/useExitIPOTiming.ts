import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeGEITI(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('exit-ipo-timing', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function useGEITIDashboard() {
  return useQuery({
    queryKey: ['geiti-dashboard'],
    queryFn: () => invokeGEITI('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useMarketWindows() {
  return useQuery({
    queryKey: ['geiti-market-windows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geiti_market_window')
        .select('*')
        .order('window_confidence', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function usePlatformReadiness() {
  return useQuery({
    queryKey: ['geiti-platform-readiness'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geiti_platform_readiness')
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useLiquidityPathways() {
  return useQuery({
    queryKey: ['geiti-liquidity-pathways'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geiti_liquidity_pathway')
        .select('*')
        .order('suitability_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useValuationMaximization() {
  return useQuery({
    queryKey: ['geiti-valuation-maximization'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geiti_valuation_maximization')
        .select('*')
        .order('implied_valuation_usd', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function usePostListingControl() {
  return useQuery({
    queryKey: ['geiti-post-listing-control'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geiti_post_listing_control')
        .select('*')
        .order('effectiveness_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

// ── Mutations ──

export function useDetectWindow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGEITI('detect_window', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['geiti-market-windows'] });
      qc.invalidateQueries({ queryKey: ['geiti-dashboard'] });
      toast.success(`Window: ${data?.best_window ?? ''} (${data?.status ?? ''}, ${data?.confidence ?? 0}% confidence)`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useScoreReadiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGEITI('score_readiness', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['geiti-platform-readiness'] });
      qc.invalidateQueries({ queryKey: ['geiti-dashboard'] });
      toast.success(`Readiness: ${data?.readiness_score?.toFixed(1) ?? 0} (${data?.tier ?? ''}), ${data?.gaps_count ?? 0} gaps`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useEvaluatePathways() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGEITI('evaluate_pathways', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['geiti-liquidity-pathways'] });
      qc.invalidateQueries({ queryKey: ['geiti-dashboard'] });
      toast.success(`Pathways: ${data?.pathways_evaluated ?? 0} evaluated, recommended: ${data?.recommended ?? ''}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMaximizeValuation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGEITI('maximize_valuation', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['geiti-valuation-maximization'] });
      qc.invalidateQueries({ queryKey: ['geiti-dashboard'] });
      toast.success(`Valuation: max $${((data?.max_implied_valuation ?? 0) / 1e6).toFixed(0)}M, optimal: ${data?.optimal_timing ?? ''}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function usePlanPostListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: Record<string, unknown>) => invokeGEITI('plan_post_listing', params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['geiti-post-listing-control'] });
      qc.invalidateQueries({ queryKey: ['geiti-dashboard'] });
      toast.success(`Post-listing: ${data?.active ?? 0} active mechanisms, strongest: ${data?.strongest ?? ''}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
