import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface MarketHeatInput {
  village: string;
  district: string;
  city: string;
  property_type: string;
}

export interface MarketHeatResult {
  area_price_heat: string;
  demand_strength: string;
  market_heat_summary: string;
}

export interface MarketHeatResponse {
  result: MarketHeatResult;
  input: MarketHeatInput;
}

export function useMarketHeat() {
  return useMutation({
    mutationFn: async (input: MarketHeatInput): Promise<MarketHeatResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "market-heat", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
