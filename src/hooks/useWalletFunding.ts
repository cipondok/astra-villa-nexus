import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

async function invokeEngine(action: string, payload?: any) {
  const { data, error } = await supabase.functions.invoke('wallet-funding-engine', {
    body: { action, payload },
  });
  if (error) throw error;
  return data;
}

export function useTrackFundingEvent() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (params: {
      stage: string;
      amount?: number;
      device_type?: string;
      geo_country?: string;
    }) => {
      if (!user?.id) return null;
      return invokeEngine('track_event', params);
    },
    onError: () => {},
  });
}

export function usePlatformFundingStats() {
  return useQuery({
    queryKey: ['platform-funding-stats'],
    queryFn: () => invokeEngine('platform_stats'),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useFundingNudges() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['funding-nudges', user?.id],
    queryFn: () => invokeEngine('get_nudges'),
    enabled: !!user?.id,
    staleTime: 30_000,
  });
}

export function useDismissNudge() {
  return useMutation({
    mutationFn: (nudgeId: string) => invokeEngine('dismiss_nudge', { nudge_id: nudgeId }),
  });
}

export function useFundingFunnelAnalytics(days = 30) {
  return useQuery({
    queryKey: ['funding-funnel-analytics', days],
    queryFn: () => invokeEngine('funnel_analytics', { days }),
    staleTime: 60_000,
  });
}

export function useCapitalActivationDashboard(days = 30) {
  return useQuery({
    queryKey: ['capital-activation-dashboard', days],
    queryFn: () => invokeEngine('activation_dashboard', { days }),
    staleTime: 30_000,
    refetchInterval: 120_000,
  });
}
