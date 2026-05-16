import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface RentalRoiInput {
  price: number;
  monthly_rent: number;
  city: string;
  demand_level?: string;
}

export interface RentalRoiResult {
  annual_rental_income: string;
  gross_yield_percent: string;
  rental_stability: string;
  rental_roi_summary: string;
}

export interface RentalRoiResponse {
  result: RentalRoiResult;
  input: RentalRoiInput;
}

export function useRentalRoiProjection() {
  return useMutation({
    mutationFn: async (input: RentalRoiInput): Promise<RentalRoiResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "rental-roi-projection", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
