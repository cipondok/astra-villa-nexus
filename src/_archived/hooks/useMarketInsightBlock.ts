import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface MarketInsightBlockInput {
  village?: string;
  district?: string;
  city: string;
  price_trend: string;
  demand_level: string;
  growth_score: number;
}

export interface MarketInsightBlockResponse {
  insight_text: string;
  input: MarketInsightBlockInput;
}

export function useMarketInsightBlock() {
  return useMutation({
    mutationFn: async (input: MarketInsightBlockInput): Promise<MarketInsightBlockResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "market-insight-block", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { insight_text: data.result.insight_text, input: data.input };
    },
  });
}
