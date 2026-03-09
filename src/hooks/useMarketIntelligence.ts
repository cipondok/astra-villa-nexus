import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useLocationPriceTrends(limit = 20) {
  return useQuery({
    queryKey: ['location-price-trends', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('location_price_trends')
        .select('*')
        .order('property_count', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useRentalMarketInsights(limit = 20) {
  return useQuery({
    queryKey: ['rental-market-insights', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rental_market_insights')
        .select('*')
        .order('demand_score', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useInvestmentHotspots(limit = 20) {
  return useQuery({
    queryKey: ['investment-hotspots', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investment_hotspots')
        .select('*')
        .order('hotspot_score', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function usePropertyMarketContext(city: string | null) {
  return useQuery({
    queryKey: ['property-market-context', city],
    enabled: !!city,
    queryFn: async () => {
      const [trendRes, rentalRes, hotspotRes] = await Promise.all([
        supabase.from('location_price_trends').select('*').eq('city', city!).limit(1).maybeSingle(),
        supabase.from('rental_market_insights').select('*').eq('city', city!).limit(1).maybeSingle(),
        supabase.from('investment_hotspots').select('*').eq('city', city!).limit(1).maybeSingle(),
      ]);
      return {
        priceTrend: trendRes.data,
        rentalInsight: rentalRes.data,
        hotspot: hotspotRes.data,
      };
    },
    staleTime: 10 * 60 * 1000,
  });
}
