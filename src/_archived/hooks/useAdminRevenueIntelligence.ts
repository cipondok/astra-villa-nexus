import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RevenueIntelligenceData {
  sales: {
    total_transaction_value: number;
    total_commission: number;
    avg_commission_rate: number;
    transaction_count: number;
    this_month_commission: number;
    prev_month_commission: number;
  };
  rental: {
    total_revenue: number;
    active_contracts: number;
    completed_bookings: number;
    avg_booking_value: number;
    this_month_revenue: number;
    total_bookings: number;
  };
  vendor: {
    total_revenue: number;
    total_bookings: number;
    completed_bookings: number;
    completion_rate: number;
    platform_fee_total: number;
    provider_earnings_total: number;
    this_month_revenue: number;
  };
  subscriptions: {
    active_subscribers: number;
    total_subscribers: number;
    mrr: number;
    plan_distribution: Array<{ plan: string; count: number }>;
    churned_this_month: number;
  };
  top_agents: Array<{
    agent_id: string;
    full_name: string;
    avatar_url: string | null;
    total_commission: number;
    transaction_count: number;
  }>;
  city_breakdown: Array<{
    city: string;
    transactions: number;
    revenue: number;
    avg_value: number;
  }>;
  daily_series: Array<{
    date: string;
    sales: number;
    rental: number;
    vendor: number;
  }>;
}

export function useAdminRevenueIntelligence() {
  return useQuery({
    queryKey: ['admin-revenue-intelligence'],
    queryFn: async (): Promise<RevenueIntelligenceData> => {
      const { data, error } = await supabase.rpc('get_admin_revenue_intelligence');
      if (error) throw error;
      return data as unknown as RevenueIntelligenceData;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
