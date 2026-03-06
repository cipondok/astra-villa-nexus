import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface NeighborhoodInsightsInput {
  location: string;
  question?: string;
  coordinates?: { lat: number; lng: number };
}

export interface NotableSchool {
  name: string;
  type: string;
  rating?: string;
}

export interface CommuteOption {
  mode: string;
  description: string;
}

export interface NeighborhoodInsightsResult {
  overview: {
    summary: string;
    livability_score: number;
    property_type_fit: string[];
    demographic: string;
  };
  education: {
    score: number;
    highlights: string[];
    notable_schools?: NotableSchool[];
  };
  safety: {
    score: number;
    highlights: string[];
    considerations?: string[];
  };
  transportation: {
    score: number;
    highlights: string[];
    commute_options?: CommuteOption[];
  };
  amenities: {
    score: number;
    highlights: string[];
    categories?: {
      shopping?: string[];
      healthcare?: string[];
      dining?: string[];
      recreation?: string[];
    };
  };
  market_insights: {
    avg_price_range: string;
    price_trend: "rising" | "stable" | "declining";
    rental_yield?: string;
    investment_outlook: "excellent" | "good" | "moderate" | "cautious";
    key_developments?: string[];
  };
  environment: {
    flood_risk: "low" | "moderate" | "high";
    green_spaces?: string[];
    air_quality?: "good" | "moderate" | "poor";
    noise_level: "quiet" | "moderate" | "noisy";
  };
  chat_response: string;
}

export function useNeighborhoodInsights() {
  return useMutation({
    mutationFn: async (input: NeighborhoodInsightsInput): Promise<NeighborhoodInsightsResult> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "neighborhood_insights", payload: input },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data as NeighborhoodInsightsResult;
    },
  });
}
