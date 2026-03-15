import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface LandingPageResult {
  seo_title: string;
  meta_description: string;
  intro_content: string;
  investment_section: string;
  rental_potential_section: string;
  lifestyle_section: string;
  infrastructure_section: string;
  primary_keywords: string[];
  secondary_keywords: string[];
}

export interface LandingPageInput {
  province: string;
  city: string;
  district?: string;
  village?: string;
}

export interface LandingPageResponse {
  result: LandingPageResult;
  location: LandingPageInput;
}

export function useLandingPageGenerator() {
  return useMutation({
    mutationFn: async (location: LandingPageInput): Promise<LandingPageResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "landing-page-content", ...location } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, location: data.location };
    },
  });
}
