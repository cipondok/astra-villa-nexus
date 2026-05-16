import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface DescriptionSeoElements {
  lifestyle_hook: string;
  urgency_trigger: string;
  investment_angle: string;
  infrastructure_mentioned: string[];
}

export interface DescriptionRewriteResult {
  description: string;
  word_count: number;
  keywords_embedded: string[];
  improvements: string[];
  original_issues: string[];
  seo_elements: DescriptionSeoElements;
}

export interface DescriptionRewriteResponse {
  result: DescriptionRewriteResult;
  original_description: string;
}

export function useDescriptionRewrite() {
  return useMutation({
    mutationFn: async (propertyId: string): Promise<DescriptionRewriteResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "rewrite-description", propertyId } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, original_description: data.original_description };
    },
  });
}
