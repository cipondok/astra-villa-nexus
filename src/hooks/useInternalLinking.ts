import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface InternalLinkSuggestion {
  anchor_text: string;
  target_url: string;
  link_type: string;
  seo_value: string;
  reasoning: string;
}

export interface InternalLinkingResult {
  internal_link_suggestions: InternalLinkSuggestion[];
  linking_strategy: string;
  estimated_authority_boost: string;
  pillar_page_recommendation: string;
}

export interface InternalLinkingResponse {
  result: InternalLinkingResult;
  property_summary: {
    title: string;
    location: string;
    property_type: string;
    listing_type: string;
  };
}

export function useInternalLinking() {
  return useMutation({
    mutationFn: async (propertyId: string): Promise<InternalLinkingResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "internal-linking", propertyId } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, property_summary: data.property_summary };
    },
  });
}
