import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface SeoLandingContentInput {
  province: string;
  city: string;
  district: string;
  village: string;
}

export interface SeoLandingContentResult {
  seo_title: string;
  meta_description: string;
  intro_content: string;
  investment_insight: string;
  primary_keywords: string[];
  secondary_keywords: string[];
  long_tail_keywords: string[];
  urgent_buyer_keywords: string[];
}

export function useSeoLandingContent() {
  return useMutation({
    mutationFn: async (input: SeoLandingContentInput): Promise<SeoLandingContentResult> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_landing_content", payload: input },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data as SeoLandingContentResult;
    },
  });
}
