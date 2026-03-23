import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useInvestorReviews(userId?: string) {
  return useQuery({
    queryKey: ['investor-reviews', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('investor_reviews' as any)
        .select('*')
        .eq('investor_user_id', userId)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!userId,
  });
}

export function usePublishedReviews(limit = 10) {
  return useQuery({
    queryKey: ['published-reviews', limit],
    queryFn: async () => {
      const { data } = await supabase
        .from('investor_reviews' as any)
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      return data ?? [];
    },
  });
}

export function useDealSuccessHighlights(limit = 5) {
  return useQuery({
    queryKey: ['deal-success-highlights', limit],
    queryFn: async () => {
      const { data } = await supabase
        .from('deal_success_highlights' as any)
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      return data ?? [];
    },
  });
}

export function useReferralRewards(userId?: string) {
  return useQuery({
    queryKey: ['referral-rewards', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('referral_rewards' as any)
        .select('*')
        .eq('referrer_user_id', userId)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!userId,
  });
}

export function useRetentionActions(userId?: string) {
  return useQuery({
    queryKey: ['retention-actions', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('retention_actions' as any)
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('scheduled_time', { ascending: true })
        .limit(20);
      return data ?? [];
    },
    enabled: !!userId,
  });
}

export function useReferralGrowthMetrics() {
  return useQuery({
    queryKey: ['referral-growth-metrics'],
    queryFn: async () => {
      const { data } = await supabase
        .from('referral_growth_metrics' as any)
        .select('*')
        .order('period_start', { ascending: false })
        .limit(12);
      return data ?? [];
    },
  });
}
