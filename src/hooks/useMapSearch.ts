import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapProperty {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  price: number;
  city: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  thumbnail_url: string | null;
  listing_type: string;
  investment_score: number;
  demand_heat_score: number;
  heat_score: number;
  zone: "hot_investment" | "growing" | "stable";
}

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;
  zone: string;
}

export interface MapSearchResult {
  properties: MapProperty[];
  heatmap_points: HeatmapPoint[];
  total: number;
}

async function fetchMapSearch(bounds: MapBounds, limit = 200): Promise<MapSearchResult> {
  const { data, error } = await supabase.functions.invoke("core-engine", {
    body: { mode: "map_search", map_bounds: bounds, limit },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data?.data || { properties: [], heatmap_points: [], total: 0 };
}

export function useMapSearch(bounds: MapBounds | null, limit = 200) {
  return useQuery({
    queryKey: ["map-search", bounds, limit],
    queryFn: () => fetchMapSearch(bounds!, limit),
    enabled: !!bounds,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}
