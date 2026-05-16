import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface MarketTrendInput {
  province: string;
  city: string;
  district?: string;
  village?: string;
  property_type: string;
}

export interface MarketTrendResult {
  price_trend: "UP" | "STABLE" | "DOWN";
  one_year_growth_estimate: string;
  five_year_growth_potential: string;
  growth_drivers: string[];
  market_outlook_summary: string;
}

export interface MarketTrendResponse {
  result: MarketTrendResult;
  input: MarketTrendInput;
}

export function useMarketTrendPrediction() {
  return useMutation({
    mutationFn: async (input: MarketTrendInput): Promise<MarketTrendResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "market-trend-prediction", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
