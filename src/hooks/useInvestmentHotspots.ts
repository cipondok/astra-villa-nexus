import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InvestmentHotspot {
  id: string;
  city: string;
  state: string | null;
  hotspot_score: number;
  growth_score: number;
  rental_score: number;
  roi_score: number;
  avg_investment_score: number;
  property_count: number;
  trend: string;
  avg_roi: number;
}

export function useInvestmentHotspots(enabled = true) {
  return useQuery({
    queryKey: ['investment-hotspots-map'],
    queryFn: async (): Promise<InvestmentHotspot[]> => {
      const { data, error } = await (supabase as any)
        .from('investment_hotspots')
        .select('id, city, state, hotspot_score, growth_score, rental_score, roi_score, avg_investment_score, property_count, trend, avg_roi')
        .gte('hotspot_score', 30)
        .order('hotspot_score', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as InvestmentHotspot[];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
