import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WalletStats {
  totalRewards: number;
  todayRewards: number;
  weekRewards: number;
  currentStreak: number;
  lastCheckin: string | null;
  canClaimToday: boolean;
}

export const useAstraWalletStats = () => {
  const { user } = useAuth();

  const { data: walletStats, isLoading, refetch } = useQuery({
    queryKey: ['astra-wallet-stats', user?.id],
    queryFn: async (): Promise<WalletStats> => {
      if (!user?.id) {
        return {
          totalRewards: 0,
          todayRewards: 0,
          weekRewards: 0,
          currentStreak: 0,
          lastCheckin: null,
          canClaimToday: true,
        };
      }

      // Get balance
      const { data: balance } = await supabase
        .from('astra_token_balances')
        .select('total_tokens, lifetime_earned')
        .eq('user_id', user.id)
        .single();

      // Get today's date in UTC
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      // Get week start (Monday)
      const weekStart = new Date(today);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
      weekStart.setDate(diff);
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Get today's rewards from transactions
      const { data: todayTransactions } = await supabase
        .from('astra_token_transactions')
        .select('amount')
        .eq('user_id', user.id)
        .gte('created_at', todayStr)
        .gt('amount', 0);

      const todayRewards = todayTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // Get this week's rewards
      const { data: weekTransactions } = await supabase
        .from('astra_token_transactions')
        .select('amount')
        .eq('user_id', user.id)
        .gte('created_at', weekStartStr)
        .gt('amount', 0);

      const weekRewards = weekTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // Get latest checkin info
      const { data: latestCheckin } = await supabase
        .from('astra_daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('checkin_date', { ascending: false })
        .limit(1)
        .single();

      // Check if already claimed today
      const { data: todayCheckin } = await supabase
        .from('astra_daily_checkins')
        .select('id')
        .eq('user_id', user.id)
        .eq('checkin_date', todayStr)
        .single();

      const canClaimToday = !todayCheckin;

      return {
        totalRewards: balance?.lifetime_earned || 0,
        todayRewards,
        weekRewards,
        currentStreak: latestCheckin?.streak_count || 0,
        lastCheckin: latestCheckin?.checkin_date || null,
        canClaimToday,
      };
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
  });

  return {
    walletStats: walletStats || {
      totalRewards: 0,
      todayRewards: 0,
      weekRewards: 0,
      currentStreak: 0,
      lastCheckin: null,
      canClaimToday: true,
    },
    isLoading,
    refetch,
  };
};

export default useAstraWalletStats;
