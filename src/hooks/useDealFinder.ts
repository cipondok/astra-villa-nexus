import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DealFinderResult {
  property_id: string;
  title: string;
  city: string | null;
  location: string | null;
  property_type: string | null;
  listing_type: string | null;
  price: number;
  area_sqm: number;
  bedrooms: number | null;
  bathrooms: number | null;
  thumbnail_url: string | null;
  deal_score: number;
  undervalue_percent: number;
  rental_yield_percent: number;
  monthly_rent_estimate: number;
  price_per_sqm: number;
  city_avg_price_per_sqm: number;
  views_30d: number;
  saves_30d: number;
  investment_score: number;
  deal_rating: 'hot_deal' | 'good_deal' | 'fair' | 'low';
}

export interface DealFinderResponse {
  deals: DealFinderResult[];
  total_scanned: number;
  total_deals_found: number;
  city_averages: { city: string; avg_price_per_sqm: number }[];
  generated_at: string;
}

export interface DealFinderFilters {
  city?: string;
  property_type?: string;
  min_score?: number;
  limit?: number;
}

export const useDealFinder = (filters: DealFinderFilters = {}) => {
  return useQuery({
    queryKey: ['deal-finder', filters],
    queryFn: async (): Promise<DealFinderResponse> => {
      const { data, error } = await supabase.functions.invoke('deal-engine', {
        body: {
          mode: 'deal_finder',
          city: filters.city || null,
          property_type: filters.property_type || null,
          min_score: filters.min_score || 0,
          limit: filters.limit || 20,
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data?.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
