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

async function fetchCollection(type: CollectionType, limit = 8): Promise<CollectionProperty[]> {
  const { data, error } = await supabase.functions.invoke("ai-smart-collections", {
    body: { action: "get_collection", collection_type: type, limit },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data?.properties || [];
}

export function useSmartCollections(limit = 8) {
  const bestInvestment = useQuery({
    queryKey: ["smart-collection", "best_investment", limit],
    queryFn: () => fetchCollection("best_investment", limit),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const bestForLiving = useQuery({
    queryKey: ["smart-collection", "best_for_living", limit],
    queryFn: () => fetchCollection("best_for_living", limit),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const luxuryCollection = useQuery({
    queryKey: ["smart-collection", "luxury_collection", limit],
    queryFn: () => fetchCollection("luxury_collection", limit),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const trending = useQuery({
    queryKey: ["smart-collection", "trending", limit],
    queryFn: () => fetchCollection("trending", limit),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  return { bestInvestment, bestForLiving, luxuryCollection, trending };
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
