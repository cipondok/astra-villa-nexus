import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

async function invokeGrowthEngine(action: string, payload?: any) {
  const { data, error } = await supabase.functions.invoke('investor-growth-engine', {
    body: { action, payload },
  });
  if (error) throw error;
  return data;
}

export function useInvestorGrowthDashboard() {
  return useQuery({
    queryKey: ['investor-growth-dashboard'],
    queryFn: () => invokeGrowthEngine('dashboard'),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useScoreInvestor() {
  return useMutation({
    mutationFn: (userId: string) => invokeGrowthEngine('score_investor', { user_id: userId }),
  });
}

export function useGenerateNudges() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeGrowthEngine('generate_nudges'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['investor-growth-dashboard'] }),
  });
}

export function useTrackGrowthEvent() {
  return useMutation({
    mutationFn: (payload: {
      user_id?: string;
      funnel_stage: string;
      source_channel?: string;
      campaign_tag?: string;
      geo_country?: string;
      device_type?: string;
      session_id?: string;
    }) => invokeGrowthEngine('track_event', payload),
  });
}

export function useGrowthEvents(limit = 100) {
  return useQuery({
    queryKey: ['investor-growth-events', limit],
    queryFn: async () => {
      const { data } = await supabase
        .from('investor_growth_events' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      return data ?? [];
    },
    staleTime: 15_000,
  });
}

export function useGrowthActions(status?: string) {
  return useQuery({
    queryKey: ['investor-growth-actions', status],
    queryFn: async () => {
      let q = supabase
        .from('investor_growth_actions' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (status) q = q.eq('action_status', status);
      const { data } = await q;
      return data ?? [];
    },
    staleTime: 15_000,
  });
}

export function useGrowthExperiments() {
  return useQuery({
    queryKey: ['growth-experiments'],
    queryFn: async () => {
      const { data } = await supabase
        .from('growth_experiment_metrics' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

export function useInvestorReferrals(limit = 50) {
  return useQuery({
    queryKey: ['investor-referrals', limit],
    queryFn: async () => {
      const { data } = await supabase
        .from('investor_referrals' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      return data ?? [];
    },
    staleTime: 30_000,
  });
}
