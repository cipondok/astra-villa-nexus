import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface RentalEstimateInput {
  price: number;
  property_type: string;
  city: string;
  district?: string;
  village?: string;
  nearby_facilities?: string;
}

export interface RentalEstimateResult {
  estimated_monthly_rent: string;
  estimated_rental_yield_percent: string;
  tenant_demand_level: string;
  rental_investment_advice: string;
}

export interface RentalEstimateResponse {
  result: RentalEstimateResult;
  input: RentalEstimateInput;
}

export function useRentalEstimate() {
  return useMutation({
    mutationFn: async (input: RentalEstimateInput): Promise<RentalEstimateResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "rental-estimate", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
