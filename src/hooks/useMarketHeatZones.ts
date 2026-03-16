import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MarketHeatZone {
  city: string;
  state: string;
  property_count: number;
  avg_price: number;
  avg_opportunity_score: number;
  avg_deal_score: number;
  avg_demand_score: number;
  total_views: number;
  total_saves: number;
  heat_score: number;
  hot_count: number;
  stable_count: number;
  cooling_count: number;
  zone_status: 'surging' | 'emerging' | 'stable' | 'cooling';
  min_price: number;
  max_price: number;
  avg_price_per_sqm: number;
}

export function useMarketHeatZones(minProperties = 3) {
  return useQuery({
    queryKey: ['market-heat-zones', minProperties],
    queryFn: async (): Promise<MarketHeatZone[]> => {
      const { data, error } = await supabase.rpc(
        'get_market_heat_zones' as any,
        { p_min_properties: minProperties }
      );
      if (error) throw error;
      return (data as any) || [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useInvestmentReasoning(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['investment-reasoning', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        'get_investment_reasoning' as any,
        { p_property_id: propertyId }
      );
      if (error) throw error;
      return data as any;
    },
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000,
  });
}

export const ZONE_STATUS_CONFIG = {
  surging: { label: 'Surging', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', icon: '🔥' },
  emerging: { label: 'Emerging', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: '📈' },
  stable: { label: 'Stable', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: '⚖️' },
  cooling: { label: 'Cooling', color: 'text-muted-foreground bg-muted/30 border-border/40', icon: '❄️' },
} as const;
