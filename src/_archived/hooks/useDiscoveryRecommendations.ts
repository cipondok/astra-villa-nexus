import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface DiscoveryRecommendationsInput {
  budget: string;
  city: string;
  property_type: string;
  purpose: string;
}

export interface DiscoveryRecommendationsResult {
  recommended_search_themes: string[];
  discovery_keywords: string[];
  lifestyle_categories: string[];
  engagement_triggers: string[];
}

export interface DiscoveryRecommendationsResponse {
  result: DiscoveryRecommendationsResult;
  input: DiscoveryRecommendationsInput;
}

export function useDiscoveryRecommendations() {
  return useMutation({
    mutationFn: async (input: DiscoveryRecommendationsInput): Promise<DiscoveryRecommendationsResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "discovery-recommendations", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
