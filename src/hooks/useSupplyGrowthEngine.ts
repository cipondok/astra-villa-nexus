import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SupplyDashboardData {
  summary: {
    total_events: number;
    live_listings: number;
    escrows_started: number;
    deals_closed: number;
    avg_listing_quality: number;
    pending_nudges: number;
    zones_tracked: number;
  };
  funnel: Record<string, number>;
  by_channel: Record<string, number>;
  by_city: Record<string, number>;
  quality_signals: any[];
  zones: any[];
  pending_actions: any[];
  conversions: any[];
}

export function useSupplyGrowthDashboard(enabled = true) {
  return useQuery({
    queryKey: ['supply-growth-dashboard'],
    queryFn: async (): Promise<SupplyDashboardData> => {
      const { data, error } = await supabase.functions.invoke('supply-growth-engine', {
        body: { mode: 'dashboard' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.data;
    },
    enabled,
    staleTime: 30_000,
    refetchInterval: 120_000,
  });
}

export function useAgentSupplyScores(enabled = true) {
  return useQuery({
    queryKey: ['agent-supply-scores'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('supply-growth-engine', {
        body: { mode: 'score_agents' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.data as { agent_user_id: string; score: number; listings_live: number; deals_closed: number; total_events: number }[];
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useGenerateSupplyNudges() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('supply-growth-engine', {
        body: { mode: 'generate_nudges' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supply-growth-dashboard'] });
    },
  });
}
