import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface SmartCollectionV2 {
  title: string;
  description: string;
  properties: SmartCollectionProperty[];
}

export interface SmartCollectionProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  property_type: string;
  listing_type: string;
  images: string[];
  thumbnail_url: string;
  roi_percentage: number;
  rental_yield_percentage: number;
  legal_status: string;
  wna_eligible: boolean;
  view_type: string;
  scores: {
    engagement_score: number;
    investment_score: number;
    livability_score: number;
    luxury_score: number;
    predicted_roi: number;
    roi_confidence: number;
  } | null;
  deal_score_percent?: number;
  saves_last_30_days?: number;
}

async function fetchSmartCollectionsV2(limit = 12): Promise<SmartCollectionV2[]> {
  const { data, error } = await supabase.functions.invoke("ai-smart-collections", {
    body: { action: "get_smart_collections_v2", limit },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data?.collections || [];
}

async function fallbackCollections(limit: number): Promise<SmartCollectionV2[]> {
  const { data } = await supabase
    .from('properties')
    .select('id, title, price, location, city, state, bedrooms, bathrooms, area_sqm, property_type, listing_type, images, thumbnail_url')
    .eq('status', 'active')
    .not('price', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!data || data.length === 0) return [];

  const props = data.map(p => ({
    ...p,
    roi_percentage: 0, rental_yield_percentage: 0, legal_status: '', wna_eligible: false, view_type: '',
    scores: null, deal_score_percent: 0, saves_last_30_days: 0,
  })) as SmartCollectionProperty[];

  return [
    { title: 'Latest Properties', description: 'Recently listed properties', properties: props },
  ];
}

export function useSmartCollectionsV2(limit = 12) {
  return useQuery({
    queryKey: ["smart-collections-v2", limit],
    queryFn: async () => {
      try {
        const result = await fetchSmartCollectionsV2(limit);
        // If edge function returned empty collections, use fallback
        if (!result || result.length === 0 || result.every(c => c.properties.length === 0)) {
          return fallbackCollections(limit);
        }
        return result;
      } catch {
        return fallbackCollections(limit);
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}
