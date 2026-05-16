import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface TrafficPredictionResult {
  estimated_search_demand: string;
  estimated_monthly_clicks: string;
  estimated_monthly_leads: string;
  investment_attractiveness_score: number;
  demand_breakdown: {
    transactional_searches: string;
    informational_searches: string;
    branded_searches: string;
  };
  keyword_opportunities: string[];
  competitive_difficulty: string;
  growth_trend: string;
  confidence_level: string;
  reasoning: string;
}

export interface TrafficPredictionResponse {
  result: TrafficPredictionResult;
  property_summary: {
    title: string;
    location: string;
    property_type: string;
    listing_type: string;
    price: number;
  };
}

export function useTrafficPrediction() {
  return useMutation({
    mutationFn: async (propertyId: string): Promise<TrafficPredictionResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "traffic-prediction", propertyId } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, property_summary: data.property_summary };
    },
  });
}
