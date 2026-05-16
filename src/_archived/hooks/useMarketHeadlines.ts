import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface MarketHeadlinesInput {
  city: string;
  market_condition: string;
}

export interface MarketHeadlinesResponse {
  headlines: string[];
  input: MarketHeadlinesInput;
}

export function useMarketHeadlines() {
  return useMutation({
    mutationFn: async (input: MarketHeadlinesInput): Promise<MarketHeadlinesResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "seo-headlines", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { headlines: data.result.headlines, input: data.input };
    },
  });
}
