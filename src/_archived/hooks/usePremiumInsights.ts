import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PremiumInsightsData {
  access_level: 'free' | 'pro' | 'enterprise';
  insights: {
    investment_score: number;
    deal_rating?: string;
    deal_score_percent?: number;
    fair_market_value?: number;
    rental_yield_estimate?: number;
    price_forecast_5y?: {
      current_price: number;
      forecast_price: number;
      annual_growth_rate: number;
    };
    buyer_demand_score?: number;
    market_density?: number;
  };
  upgrade_hint?: string;
}

async function fetchPremiumInsights(propertyId: string): Promise<PremiumInsightsData> {
  const { data, error } = await supabase.functions.invoke('core-engine', {
    body: { mode: 'premium_insights', property_id: propertyId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.data;
}

export function usePremiumInsights(propertyId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['premium-insights', propertyId],
    queryFn: () => fetchPremiumInsights(propertyId!),
    enabled: !!propertyId && !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });
}
