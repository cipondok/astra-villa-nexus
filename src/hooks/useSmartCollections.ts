import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export type CollectionType = "best_investment" | "best_for_living" | "luxury_collection" | "trending";

interface CollectionProperty {
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
  };
}

async function fetchAllCollections(limit = 8): Promise<Record<CollectionType, CollectionProperty[]>> {
  const { data, error } = await supabase.functions.invoke("ai-smart-collections", {
    body: { action: "get_all_collections", limit },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data?.collections || {};
}

export function useSmartCollections(limit = 8) {
  const allCollections = useQuery({
    queryKey: ["smart-collections-all", limit],
    queryFn: () => fetchAllCollections(limit),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  // Derive individual collection queries from the batch result for backwards compatibility
  const makeResult = (type: CollectionType) => ({
    data: allCollections.data?.[type] || [],
    isLoading: allCollections.isLoading,
    isError: allCollections.isError,
    error: allCollections.error,
    refetch: allCollections.refetch,
  });

  return {
    bestInvestment: makeResult("best_investment"),
    bestForLiving: makeResult("best_for_living"),
    luxuryCollection: makeResult("luxury_collection"),
    trending: makeResult("trending"),
  };
}

export function usePropertyROIPrediction(propertyId: string | null) {
  return useQuery({
    queryKey: ["roi-prediction", propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      const { data, error } = await supabase.functions.invoke("ai-smart-collections", {
        body: { action: "predict_roi", property_id: propertyId },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data as { predicted_roi: number; confidence: number; trend: string; explanation: string };
    },
    enabled: !!propertyId,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
}

export function useRecalculateScores() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-smart-collections", {
        body: { action: "recalculate_scores" },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data;
    },
  });
}
