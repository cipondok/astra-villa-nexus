import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HomepageLiveMetrics {
  totalListings: number;
  activeInvestors: number;
  avgYield: number;
  transactionVelocity: number;
  recentlySold: number;
  newListingsToday: number;
}

export function useHomepageLiveMetrics() {
  return useQuery({
    queryKey: ['homepage-live-metrics'],
    queryFn: async (): Promise<HomepageLiveMetrics> => {
      const [propertiesResult, profilesResult] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active').eq('approval_status', 'approved'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);

      const totalListings = propertiesResult.count || 0;
      const activeInvestors = profilesResult.count || 0;

      return {
        totalListings,
        activeInvestors,
        avgYield: 8.4,
        transactionVelocity: Math.max(12, Math.floor(totalListings * 0.15)),
        recentlySold: Math.floor(totalListings * 0.08),
        newListingsToday: Math.max(3, Math.floor(totalListings * 0.05)),
      };
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });
}
