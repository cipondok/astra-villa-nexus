import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface MarketMomentumInput {
  growth_score: number;
  demand_score: number;
  price_trend: string;
  city?: string;
}

export interface MarketMomentumResult {
  market_momentum: "DECLINING" | "STABLE" | "RISING" | "BOOMING";
  activity_forecast: string;
  timing_strategy: string;
}

export interface MarketMomentumResponse {
  result: MarketMomentumResult;
  input: MarketMomentumInput;
}

export function useMarketMomentum() {
  return useMutation({
    mutationFn: async (input: MarketMomentumInput): Promise<MarketMomentumResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "market-momentum", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
