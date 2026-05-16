import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface KeywordClusterResult {
  buy_keywords: string[];
  rent_keywords: string[];
  investment_keywords: string[];
  urgent_keywords: string[];
  lifestyle_keywords: string[];
  total_keywords: number;
  estimated_combined_volume: string;
  top_opportunity: string;
}

export interface KeywordClusterInput {
  province: string;
  city: string;
  district?: string;
  village?: string;
}

export interface KeywordClusterResponse {
  result: KeywordClusterResult;
  location: KeywordClusterInput;
}

export function useKeywordCluster() {
  return useMutation({
    mutationFn: async (location: KeywordClusterInput): Promise<KeywordClusterResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "keyword-cluster", ...location } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, location: data.location };
    },
  });
}
