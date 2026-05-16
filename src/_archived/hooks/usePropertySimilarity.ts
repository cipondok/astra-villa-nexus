import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface PropertySimilarityInput {
  price: number;
  property_type: string;
  city: string;
}

export interface PropertySimilarityResult {
  price_similarity_rule: string;
  location_similarity_rule: string;
  investment_similarity_rule: string;
  lifestyle_similarity_rule: string;
}

export interface PropertySimilarityResponse {
  result: PropertySimilarityResult;
  input: PropertySimilarityInput;
}

export function usePropertySimilarity() {
  return useMutation({
    mutationFn: async (input: PropertySimilarityInput): Promise<PropertySimilarityResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "property-similarity", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
