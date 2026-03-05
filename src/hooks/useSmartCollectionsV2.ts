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

export function useSmartCollectionsV2(limit = 12) {
  return useQuery({
    queryKey: ["smart-collections-v2", limit],
    queryFn: () => fetchSmartCollectionsV2(limit),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}
