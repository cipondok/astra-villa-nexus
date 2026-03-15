import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface CityPriceIndexInput {
  city: string;
  province: string;
  market_signals?: Record<string, unknown>;
}

export type PriceTrend = "DOWN" | "STABLE" | "RISING" | "SURGING";

export interface CityPriceIndexResult {
  price_trend: PriceTrend;
  price_index_score: number;
  growth_drivers: string[];
  risk_factors: string[];
  market_summary: string;
}

export interface CityPriceIndexResponse {
  result: CityPriceIndexResult;
  input: CityPriceIndexInput;
}

export function useCityPriceIndex() {
  return useMutation({
    mutationFn: async (input: CityPriceIndexInput): Promise<CityPriceIndexResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "city-price-index", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
