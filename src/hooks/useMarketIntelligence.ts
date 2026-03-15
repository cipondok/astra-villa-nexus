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

export function useLocationMarketInsights(limit = 20) {
  return useQuery({
    queryKey: ['location-market-insights', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('location_market_insights')
        .select('*')
        .order('avg_investment_score', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useHotMarkets() {
  return useQuery({
    queryKey: ['hot-markets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('location_market_insights')
        .select('*')
        .in('market_status', ['hot', 'emerging'])
        .order('avg_investment_score', { ascending: false })
        .limit(20);
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
      const [trendRes, rentalRes, hotspotRes, insightRes] = await Promise.all([
        supabase.from('location_price_trends').select('*').eq('city', city!).limit(1).maybeSingle(),
        supabase.from('rental_market_insights').select('*').eq('city', city!).limit(1).maybeSingle(),
        supabase.from('investment_hotspots').select('*').eq('city', city!).limit(1).maybeSingle(),
        supabase.from('location_market_insights').select('*').eq('city', city!).limit(1).maybeSingle(),
      ]);
      return {
        priceTrend: trendRes.data,
        rentalInsight: rentalRes.data,
        hotspot: hotspotRes.data,
        marketInsight: insightRes.data,
      };
    },
    staleTime: 10 * 60 * 1000,
  });
}

export interface MarketIntelligenceSummary {
  top_area: string;
  top_area_score: number;
  top_area_count: number;
  market_heat: 'HOT' | 'ACTIVE' | 'SLOW';
  avg_hotspot_score: number;
  avg_liquidity: number;
  liquidity_trend: 'IMPROVING' | 'STABLE' | 'WEAKENING';
  growth_hint: string;
  sparkline_data: { name: string; score: number }[];
}

export function useMarketIntelligence(enabled = true) {
  return useQuery({
    queryKey: ['market-intelligence-summary'],
    queryFn: async (): Promise<MarketIntelligenceSummary> => {
      const { data, error } = await supabase.rpc('get_market_intelligence_summary');
      if (error) throw error;
      return data as unknown as MarketIntelligenceSummary;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
