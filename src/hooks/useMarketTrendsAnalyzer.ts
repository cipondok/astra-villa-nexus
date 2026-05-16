import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type TimeRange = '1m' | '3m' | '6m' | '12m';
export type TrendDirection = 'rising' | 'stable' | 'declining' | 'insufficient_data';
export type HeatLevel = 'hot' | 'warm' | 'moderate' | 'cool';

export interface HotZone {
  zone: string;
  listing_count: number;
  avg_demand_heat: number;
  avg_investment_score: number;
  avg_price: number;
  heat_level: HeatLevel;
}

export interface MarketTrendsResult {
  avg_price: number;
  median_price: number;
  price_change_pct: number;
  trend_direction: TrendDirection;
  avg_days_on_market: number;
  hot_zones: HotZone[];
  forecast_next_quarter: {
    predicted_avg_price: number;
    predicted_change_pct: number;
    confidence: 'high' | 'medium' | 'low';
    predicted_demand: 'increasing' | 'decreasing' | 'steady';
  } | null;
  price_distribution: { range: string; count: number }[];
  total_listings: number;
  new_listings_in_period: number;
  analysis_period: TimeRange;
  city: string;
  property_type: string;
  generated_at: string;
}

export const useMarketTrendsAnalyzer = (params: {
  city?: string;
  property_type?: string;
  time_range?: TimeRange;
  enabled?: boolean;
}) => {
  const query = useQuery<MarketTrendsResult>({
    queryKey: ['market-trends-analyzer', params.city, params.property_type, params.time_range],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: {
          mode: 'market_trends_analyzer',
          city: params.city || '',
          property_type: params.property_type || '',
          time_range: params.time_range || '6m',
        },
      });
      if (error) throw error;
      if (data?.data?.error) throw new Error(data.data.error);
      return data.data;
    },
    enabled: params.enabled !== false,
    staleTime: 10 * 60 * 1000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
