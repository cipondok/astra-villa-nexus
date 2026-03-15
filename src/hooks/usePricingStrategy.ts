import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface PricingStrategyInput {
  price: number;
  property_type: string;
  village: string;
  district: string;
  city: string;
  province: string;
  price_position: string;
}

export interface PricingStrategyResult {
  recommended_price_strategy: string;
  suggested_price_range: string;
  negotiation_tip: string;
  sale_speed_impact: string;
}

export interface PricingStrategyResponse {
  result: PricingStrategyResult;
  input: PricingStrategyInput;
}

export function usePricingStrategy() {
  return useMutation({
    mutationFn: async (input: PricingStrategyInput): Promise<PricingStrategyResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "pricing-strategy", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
