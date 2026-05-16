import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface MarketCycleInput {
  growth_score: number;
  demand_score: number;
  price_trend: string;
}

export type MarketCycleStage = "EARLY RECOVERY" | "GROWTH PHASE" | "PEAK MARKET" | "CORRECTION PHASE";

export interface MarketCycleResult {
  market_cycle_stage: MarketCycleStage;
  cycle_insight: string;
}

export interface MarketCycleResponse {
  result: MarketCycleResult;
  input: MarketCycleInput;
}

export function useMarketCycle() {
  return useMutation({
    mutationFn: async (input: MarketCycleInput): Promise<MarketCycleResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "market-cycle", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
