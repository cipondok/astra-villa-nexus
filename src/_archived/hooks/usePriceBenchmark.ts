import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface PriceBenchmarkInput {
  property_type: string;
  transaction_type: string;
  price: number;
  building_size: number;
  land_size: number;
  village: string;
  district: string;
  city: string;
  province: string;
  nearby_facilities: string;
}

export interface PriceBenchmarkResult {
  price_position: string;
  estimated_market_price_range: string;
  price_attractiveness_score: number;
  benchmark_insight: string;
  buyer_psychology_effect: string;
}

export interface PriceBenchmarkResponse {
  result: PriceBenchmarkResult;
  input: PriceBenchmarkInput;
}

export function usePriceBenchmark() {
  return useMutation({
    mutationFn: async (input: PriceBenchmarkInput): Promise<PriceBenchmarkResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "price-benchmark", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
