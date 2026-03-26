import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function invokeGIWS(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('ipo-war-strategy', {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  return data;
}

// ── Queries ──

export function useGIWSDashboard() {
  return useQuery({
    queryKey: ['giws-dashboard'],
    queryFn: () => invokeGIWS('dashboard'),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useIPOReadiness() {
  return useQuery({
    queryKey: ['giws-readiness'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('giws_ipo_readiness' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useMarketPositioning() {
  return useQuery({
    queryKey: ['giws-positioning'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('giws_market_positioning' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useInvestorDemand() {
  return useQuery({
    queryKey: ['giws-demand'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('giws_investor_demand' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function useListingTiming() {
  return useQuery({
    queryKey: ['giws-timing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('giws_listing_timing' as any)
        .select('*')
        .order('assessed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    staleTime: 120_000,
  });
}

export function usePostListingStability() {
  return useQuery({
    queryKey: ['giws-post-listing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('giws_post_listing' as any)
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
    mutationFn: (p?: Record<string, unknown>) => invokeGIWS(mode, p),
    onSuccess: (data) => {
      keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      qc.invalidateQueries({ queryKey: ['giws-dashboard'] });
      toast.success(`${label}: ${JSON.stringify(data).slice(0, 80)}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useAssessReadiness = () => useMut('assess_readiness', 'IPO Readiness', ['giws-readiness']);
export const usePositionMarket = () => useMut('position_market', 'Market Positioning', ['giws-positioning']);
export const useStructureDemand = () => useMut('structure_demand', 'Investor Demand', ['giws-demand']);
export const useOptimizeTiming = () => useMut('optimize_timing', 'Listing Timing', ['giws-timing']);
export const usePlanPostListing = () => useMut('plan_post_listing', 'Post-Listing', ['giws-post-listing']);
