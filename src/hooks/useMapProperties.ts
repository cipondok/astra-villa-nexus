import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapFilters {
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  propertyType?: string;
}

export interface MapProperty {
  id: string;
  title: string;
  price: number;
  property_type: string;
  listing_type: string;
  location: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  land_area_sqm: number | null;
  building_area_sqm: number | null;
  latitude: number;
  longitude: number;
  images: string[];
  image_urls: string[];
  thumbnail_url: string | null;
  investment_score: number | null;
  demand_heat_score: number | null;
}

export function useMapProperties(bounds: MapBounds | null, filters: MapFilters = {}, enabled = true) {
  return useQuery({
    queryKey: ['map-properties', bounds, filters],
    queryFn: async (): Promise<MapProperty[]> => {
      if (!bounds) return [];
      
      const { data, error } = await (supabase as any).rpc('get_properties_in_bounds', {
        p_north: bounds.north,
        p_south: bounds.south,
        p_east: bounds.east,
        p_west: bounds.west,
        p_limit: 500,
        p_min_price: filters.minPrice || null,
        p_max_price: filters.maxPrice || null,
        p_min_bedrooms: filters.minBedrooms || null,
        p_property_type: filters.propertyType || null,
      });

      if (error) throw error;
      return (data || []) as MapProperty[];
    },
    enabled: enabled && !!bounds,
    staleTime: 30_000,
    gcTime: 60_000,
    // Debounce rapid viewport changes by keeping previous data
    placeholderData: (prev) => prev,
  });
}
