import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface SeoUrlVariation {
  slug: string;
  category: string;
  target_keyword: string;
  suggested_title: string;
  search_intent: string;
  estimated_volume: string;
}

export interface UrlSlugResult {
  seo_url_variations: SeoUrlVariation[];
  total_pages: number;
  implementation_priority: string[];
  sitemap_strategy: string;
}

export interface UrlSlugInput {
  province: string;
  city: string;
  district?: string;
  village?: string;
}

export interface UrlSlugResponse {
  result: UrlSlugResult;
  location: UrlSlugInput;
}

export function useUrlSlugGenerator() {
  return useMutation({
    mutationFn: async (location: UrlSlugInput): Promise<UrlSlugResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "url-slug-generator", ...location } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, location: data.location };
    },
  });
}
