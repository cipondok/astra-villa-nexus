import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface MarketHeatLabelInput {
  price_index_score: number;
  market_cycle_stage: string;
}

export type MarketHeatLabel =
  | "INVESTOR ACCUMULATION ZONE"
  | "HIGH GROWTH MARKET"
  | "PREMIUM PEAK AREA"
  | "WAIT AND WATCH MARKET"
  | "VALUE BUYING WINDOW";

export interface MarketHeatLabelResponse {
  result: { label: MarketHeatLabel };
  input: MarketHeatLabelInput;
}

export function useMarketHeatLabel() {
  return useMutation({
    mutationFn: async (input: MarketHeatLabelInput): Promise<MarketHeatLabelResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "market-heat-label", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
