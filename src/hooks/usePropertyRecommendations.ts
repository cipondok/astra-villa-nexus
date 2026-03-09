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
  expected_roi?: number | null;
  rental_yield?: number | null;
  risk_level?: string | null;
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
        .select('recommended_property_id, recommendation_score, recommendation_type, factors')
        .eq('property_id', propertyId)
        .eq('recommendation_type', type)
        .order('recommendation_score', { ascending: false })
        .limit(limit);

      if (cached && cached.length > 0) {
        const ids = cached.map((r: any) => r.recommended_property_id);
        const scoreMap = new Map(cached.map((r: any) => [r.recommended_property_id, r.recommendation_score]));

        const [propsRes, roiRes] = await Promise.all([
          supabase
            .from('properties')
            .select(PROPERTY_SELECT)
            .in('id', ids)
            .eq('status', 'available'),
          (supabase as any)
            .from('property_roi_forecast')
            .select('property_id, expected_roi, rental_yield, risk_level')
            .in('property_id', ids),
        ]);

        const roiMap = new Map((roiRes.data || []).map((r: any) => [r.property_id, r]));

        if (propsRes.data) {
          return ids
            .map((id: string) => {
              const p = propsRes.data!.find((prop) => prop.id === id);
              if (!p) return null;
              const roi = roiMap.get(id) as any;
              return {
                ...p,
                recommendation_score: Number(scoreMap.get(id) || 0),
                recommendation_type: type,
                expected_roi: roi?.expected_roi || null,
                rental_yield: roi?.rental_yield || null,
                risk_level: roi?.risk_level || null,
              } as CachedRecommendation;
            })
            .filter(Boolean) as CachedRecommendation[];
        }
      }

      // Fallback: live queries
      if (type === 'nearby_investment') {
        return fetchNearbyInvestments(propertyId, limit);
      }
      if (type === 'similar') {
        return fetchSimilarProperties(propertyId, limit);
      }

      return [];
    },
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Fetch trending properties using composite trending score (saves + views + inquiries).
 */
export function useTrendingProperties(limit = 6) {
  return useQuery({
    queryKey: ['trending-properties', limit],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select(PROPERTY_SELECT + ', save_count')
        .eq('status', 'available')
        .not('save_count', 'is', null)
        .gt('save_count', 0)
        .order('save_count', { ascending: false })
        .limit(limit);

      return (data || []) as any[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch top ROI deal properties with rental yield data.
 */
export function useTopROIDeals(limit = 6) {
  return useQuery({
    queryKey: ['top-roi-deals', limit],
    queryFn: async () => {
      const { data: forecasts } = await (supabase as any)
        .from('property_roi_forecast')
        .select('property_id, expected_roi, rental_yield, risk_level')
        .order('expected_roi', { ascending: false })
        .limit(limit * 3);

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
        .map((p) => {
          const roi = roiMap.get(p.id) as any;
          return {
            ...p,
            expected_roi: roi?.expected_roi,
            rental_yield: roi?.rental_yield,
            risk_level: roi?.risk_level,
          };
        })
        .sort((a, b) => ((b as any).expected_roi || (b as any).investment_score || 0) - ((a as any).expected_roi || (a as any).investment_score || 0))
        .slice(0, limit);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fallback: live similar property query using weighted scoring.
 */
async function fetchSimilarProperties(propertyId: string, limit: number): Promise<CachedRecommendation[]> {
  const { data: source } = await supabase
    .from('properties')
    .select('city, state, price, property_type, bedrooms, area_sqm')
    .eq('id', propertyId)
    .single();

  if (!source) return [];

  // Get candidates from same city, then same state
  const { data: candidates } = await supabase
    .from('properties')
    .select(PROPERTY_SELECT + ', area_sqm')
    .eq('status', 'available')
    .eq('city', source.city)
    .neq('id', propertyId)
    .limit(20);

  if (!candidates || candidates.length === 0) return [];

  // Score candidates
  const scored = candidates.map((s: any) => {
    let score = 0;
    if (s.property_type === source.property_type) score += 25;
    score += 20; // same city
    const priceDiff = Math.abs(s.price - source.price) / Math.max(source.price, 1);
    score += priceDiff < 0.15 ? 20 : priceDiff < 0.3 ? 10 : 0;
    if (s.bedrooms === source.bedrooms) score += 15;
    if (source.area_sqm && s.area_sqm) {
      const areaDiff = Math.abs(s.area_sqm - source.area_sqm) / Math.max(source.area_sqm, 1);
      score += areaDiff < 0.2 ? 10 : areaDiff < 0.4 ? 5 : 0;
    }
    if (s.investment_score >= 70) score += 10;
    return { ...s, recommendation_score: score, recommendation_type: 'similar' as const };
  });

  return scored
    .sort((a, b) => b.recommendation_score - a.recommendation_score)
    .slice(0, limit);
}

async function fetchNearbyInvestments(propertyId: string, limit: number): Promise<CachedRecommendation[]> {
  const { data: source } = await supabase
    .from('properties')
    .select('city, latitude, longitude, price, property_type')
    .eq('id', propertyId)
    .single();

  if (!source) return [];

  const [propsRes, roiRes] = await Promise.all([
    supabase
      .from('properties')
      .select(PROPERTY_SELECT)
      .eq('status', 'available')
      .eq('city', source.city)
      .neq('id', propertyId)
      .not('investment_score', 'is', null)
      .order('investment_score', { ascending: false })
      .limit(limit * 2),
    (supabase as any)
      .from('property_roi_forecast')
      .select('property_id, expected_roi, rental_yield, risk_level'),
  ]);

  const properties = propsRes.data || [];
  const roiMap = new Map((roiRes.data || []).map((r: any) => [r.property_id, r]));

  return properties.slice(0, limit).map((p: any) => {
    const roi = roiMap.get(p.id) as any;
    return {
      ...p,
      recommendation_score: p.investment_score || 0,
      recommendation_type: 'nearby_investment',
      expected_roi: roi?.expected_roi || null,
      rental_yield: roi?.rental_yield || null,
      risk_level: roi?.risk_level || null,
    };
  });
}
