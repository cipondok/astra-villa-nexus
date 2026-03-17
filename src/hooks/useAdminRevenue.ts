import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminRevenueStats {
  total_revenue: number;
  monthly_revenue: number;
  prev_monthly_revenue: number;
  total_commissions: number;
  pending_commissions: number;
  paid_commissions: number;
  total_transactions: number;
  completed_transactions: number;
  pending_transactions: number;
  mortgage_applications: number;
  mortgage_approved: number;
  mortgage_pending: number;
  active_affiliates: number;
  total_affiliate_earnings: number;
}

export function useAdminRevenue() {
  return useQuery({
    queryKey: ['admin-revenue-stats'],
    queryFn: async (): Promise<AdminRevenueStats> => {
      const { data, error } = await supabase.rpc('get_admin_revenue_stats');
      if (error) throw error;
      return data as unknown as AdminRevenueStats;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
