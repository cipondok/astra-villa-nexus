import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InventoryGap {
  city: string;
  demand: number;
  supply: number;
  gap_ratio: number;
}

export interface ExpansionZone {
  city: string;
  demand_score: number;
  growth_score: number;
  hotspot_score: number;
  listing_volume: number;
  property_count: number;
  opportunity_score: number;
  expansion_priority: 'IMMEDIATE' | 'MONITOR' | 'LOW_PRIORITY';
  market_growth_rate: number;
}

export interface GeoExpansionIntelligence {
  top_demand_city: string;
  top_demand_score: number;
  top_demand_volume: number;
  inventory_gaps: InventoryGap[];
  expansion_zones: ExpansionZone[];
}

export function useGeoExpansionIntelligence(enabled = true) {
  return useQuery({
    queryKey: ['geo-expansion-intelligence'],
    queryFn: async (): Promise<GeoExpansionIntelligence> => {
      const { data, error } = await supabase.rpc('get_geo_expansion_intelligence');
      if (error) throw error;
      return data as unknown as GeoExpansionIntelligence;
    },
    enabled,
    staleTime: 120_000,
    refetchInterval: 300_000,
  });
}
