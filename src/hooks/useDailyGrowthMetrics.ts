import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DailyTrendPoint {
  date: string;
  listings: number;
  users: number;
  inquiries: number;
  offers: number;
}

export interface DailyGrowthMetrics {
  total_active_listings: number;
  new_listings_today: number;
  new_listings_yesterday: number;
  developer_projects: number;
  new_users_today: number;
  new_users_yesterday: number;
  watchlist_actions_today: number;
  watchlist_actions_yesterday: number;
  inquiries_today: number;
  inquiries_yesterday: number;
  active_negotiations: number;
  offers_today: number;
  offers_yesterday: number;
  deals_closed_week: number;
  referral_signups: number;
  social_traffic_leads: number;
  ai_alert_engagement: number;
  daily_trend: DailyTrendPoint[];
}

export function useDailyGrowthMetrics(enabled = true) {
  return useQuery({
    queryKey: ['daily-growth-metrics'],
    queryFn: async (): Promise<DailyGrowthMetrics> => {
      const { data, error } = await supabase.rpc('get_daily_growth_metrics');
      if (error) throw error;
      return data as unknown as DailyGrowthMetrics;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
