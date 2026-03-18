import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useCallback } from "react";

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapFilters {
  property_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  min_score?: number;
  trend_view?: 'short_term' | 'long_term';
}

export interface MapProperty {
  id: string;
  title: string;
  city: string;
  district: string | null;
  state: string | null;
  price: number;
  property_type: string | null;
  bedrooms: number | null;
  area_sqm: number | null;
  latitude: number;
  longitude: number;
  image_url: string | null;
  developer: string | null;
  opportunity_score: number | null;
  demand_score: number | null;
  listing_type: string | null;
}

export interface HeatPoint {
  lat: number;
  lng: number;
  weight: number;
  demand: number;
  price: number;
}

export interface MapZone {
  city: string;
  count: number;
  avg_score: number;
  avg_demand: number;
  avg_price: number;
  lat: number;
  lng: number;
  classification: "hot_investment" | "growing" | "stable";
}

export interface ZoneStats {
  city: string;
  total_properties: number;
  avg_price: number;
  avg_opportunity_score: number;
  avg_demand_score: number;
  elite_opportunities: number;
  type_distribution: Record<string, number>;
  classification: string;
}

export interface ZoneComparison {
  city: string;
  total_properties: number;
  avg_price: number;
  avg_opportunity_score: number;
  avg_demand_score: number;
  elite_count: number;
  elite_ratio: number;
}

export function useInvestmentMapExplorer(bounds: MapBounds | null, filters: MapFilters) {
  return useQuery({
    queryKey: ["investment-map-explorer", bounds, filters],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("investment-map-explorer", {
        body: { mode: "explore", bounds, filters },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as {
        properties: MapProperty[];
        heat_points: HeatPoint[];
        zones: MapZone[];
        total: number;
      };
    },
    enabled: !!bounds,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useZoneStats() {
  return useMutation({
    mutationFn: async (city: string) => {
      const { data, error } = await supabase.functions.invoke("investment-map-explorer", {
        body: { mode: "zone_stats", city },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as ZoneStats;
    },
  });
}

export function useZoneComparison() {
  const [comparisonData, setComparisonData] = useState<ZoneComparison[] | null>(null);

  const compare = useCallback(async (cities: string[]) => {
    const { data, error } = await supabase.functions.invoke("investment-map-explorer", {
      body: { mode: "compare_zones", cities },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    setComparisonData(data.comparisons);
    return data.comparisons as ZoneComparison[];
  }, []);

  const clearComparison = useCallback(() => setComparisonData(null), []);

  return { comparisonData, compare, clearComparison };
}
