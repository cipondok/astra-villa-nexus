import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserAiProfile {
  buyer_type: 'investor' | 'balanced' | 'lifestyle';
  preferred_city: string;
  avg_budget: number;
  pool_affinity_percent: number;
  property_type_preference: string;
  total_interactions: number;
}

/**
 * Lightweight hook that calls ai-match-engine-v2 and extracts just the user_ai_profile.
 * Shares the same cache key prefix as SmartAIFeed so data is reused.
 */
export function useUserAiProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-ai-profile', user?.id],
    queryFn: async (): Promise<UserAiProfile | null> => {
      const { data, error } = await supabase.functions.invoke('ai-match-engine-v2', {
        body: { limit: 1 },
      });
      if (error) return null;
      return (data?.user_ai_profile as UserAiProfile) ?? null;
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000, // matches engine cache TTL
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
