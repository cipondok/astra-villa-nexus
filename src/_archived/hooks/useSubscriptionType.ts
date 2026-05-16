import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type SubscriptionType = 'free' | 'pro' | 'enterprise';

interface UseSubscriptionTypeResult {
  subscriptionType: SubscriptionType;
  isFree: boolean;
  isPro: boolean;
  isEnterprise: boolean;
  isLoading: boolean;
}

export function useSubscriptionType(): UseSubscriptionTypeResult {
  const { user } = useAuth();

  const { data: subscriptionType = 'free' as SubscriptionType, isLoading } = useQuery({
    queryKey: ['subscription-type', user?.id],
    queryFn: async (): Promise<SubscriptionType> => {
      if (!user?.id) return 'free';

      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_type')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return (data?.subscription_type as SubscriptionType) || 'free';
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    subscriptionType,
    isFree: subscriptionType === 'free',
    isPro: subscriptionType === 'pro',
    isEnterprise: subscriptionType === 'enterprise',
    isLoading,
  };
}

export default useSubscriptionType;
