import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CachedRecommendation {
  id: string;
  title: string;
  price: number;
  city: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  property_type: string;
  listing_type: string;
  images: string[];
  thumbnail_url: string | null;
  investment_score: number | null;
  recommendation_score: number;
  recommendation_type: string;
}

const PROPERTY_SELECT = 'id, title, price, city, location, bedrooms, bathrooms, area_sqm, property_type, listing_type, images, thumbnail_url, investment_score';

/**
 * Fetch precomputed recommendations from property_recommendations table.
 * Falls back to a live query if no cached recommendations exist.
 */
export function usePropertyRecommendations(
  propertyId: string | undefined,
  type: 'similar' | 'nearby_investment' | 'trending' | 'top_roi' = 'similar',
  limit = 6
) {
  return useQuery({
    queryKey: ['property-recommendations', propertyId, type, limit],
    queryFn: async (): Promise<CachedRecommendation[]> => {
      if (!propertyId) return [];

      // Try cached recommendations first
      const { data: cached } = await (supabase as any)
        .from('property_recommendations')
        .select('recommended_property_id, recommendation_score, recommendation_type')
        .eq('property_id', propertyId)
        .eq('recommendation_type', type)
        .order('recommendation_score', { ascending: false })
        .limit(limit);

      if (cached && cached.length > 0) {
        const ids = cached.map((r: any) => r.recommended_property_id);
        const scoreMap = new Map(cached.map((r: any) => [r.recommended_property_id, r.recommendation_score]));

        const { data: properties } = await supabase
          .from('properties')
          .select(PROPERTY_SELECT)
          .in('id', ids)
          .eq('status', 'available');

        if (properties) {
          return ids
            .map((id: string) => {
              const p = properties.find((prop) => prop.id === id);
              if (!p) return null;
              return {
                ...p,
                recommendation_score: Number(scoreMap.get(id) || 0),
                recommendation_type: type,
              } as CachedRecommendation;
            })
            .filter(Boolean) as CachedRecommendation[];
        }
      }

      // Fallback: live query for nearby investment opportunities
      if (type === 'nearby_investment') {
        return fetchNearbyInvestments(propertyId, limit);
      }

      return [];
    },
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Fetch trending properties (most saved/viewed in last 30 days).
 */
export function useTrendingProperties(limit = 6) {
  return useQuery({
    queryKey: ['trending-properties', limit],
    queryFn: async () => {
      // Get properties with highest recent engagement
      const { data } = await supabase
        .from('properties')
        .select(PROPERTY_SELECT)
        .eq('status', 'available')
        .not('investment_score', 'is', null)
        .order('save_count', { ascending: false })
        .limit(limit);

      return (data || []) as any[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch top ROI deal properties.
 */
export function useTopROIDeals(limit = 6) {
  return useQuery({
    queryKey: ['top-roi-deals', limit],
    queryFn: async () => {
      const { data: forecasts } = await (supabase as any)
        .from('property_roi_forecast')
        .select('property_id, expected_roi, rental_yield, risk_level')
        .order('expected_roi', { ascending: false })
        .limit(limit * 2); // fetch extra to filter out unavailable

      if (!forecasts || forecasts.length === 0) {
        // Fallback: high investment score properties
        const { data } = await supabase
          .from('properties')
          .select(PROPERTY_SELECT)
          .eq('status', 'available')
          .not('investment_score', 'is', null)
          .order('investment_score', { ascending: false })
          .limit(limit);

        return (data || []).map((p: any) => ({
          ...p,
          expected_roi: null,
          rental_yield: null,
          risk_level: null,
        }));
      }

      const ids = forecasts.map((f: any) => f.property_id);
      const { data: properties } = await supabase
        .from('properties')
        .select(PROPERTY_SELECT)
        .in('id', ids)
        .eq('status', 'available');

      if (!properties) return [];

      const roiMap = new Map(forecasts.map((f: any) => [f.property_id, f]));
      return properties
        .map((p: any) => {
          const roi = roiMap.get(p.id);
          return { ...p, expected_roi: roi?.expected_roi, rental_yield: roi?.rental_yield, risk_level: roi?.risk_level };
        })
        .sort((a: any, b: any) => (b.expected_roi || b.investment_score || 0) - (a.expected_roi || a.investment_score || 0))
        .slice(0, limit);
    },
    staleTime: 5 * 60 * 1000,
  });
}

async function fetchNearbyInvestments(propertyId: string, limit: number) {
  // Get the source property's location and city
  const { data: source } = await supabase
    .from('properties')
    .select('city, latitude, longitude, price, property_type')
    .eq('id', propertyId)
    .single();

  if (!source) return [];

  // Find high-investment-score properties in the same city
  const { data } = await supabase
    .from('properties')
    .select(PROPERTY_SELECT)
    .eq('status', 'available')
    .eq('city', source.city)
    .neq('id', propertyId)
    .not('investment_score', 'is', null)
    .order('investment_score', { ascending: false })
    .limit(limit);

  return (data || []).map((p: any) => ({
    ...p,
    recommendation_score: p.investment_score || 0,
    recommendation_type: 'nearby_investment',
  }));
}
