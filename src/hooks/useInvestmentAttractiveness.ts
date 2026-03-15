import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface InvestmentAttractivenessInput {
  property_type: string;
  transaction_type: string;
  price: number;
  building_size?: number;
  land_size?: number;
  province: string;
  city: string;
  district?: string;
  village?: string;
  nearby_facilities?: string;
}

export interface InvestmentAttractivenessResult {
  investment_score: number;
  investment_grade: "LOW" | "MEDIUM" | "HIGH" | "PRIME";
  capital_growth_potential: string;
  rental_yield_potential: string;
  location_growth_signal: string;
  investment_summary: string;
}

export interface InvestmentAttractivenessResponse {
  result: InvestmentAttractivenessResult;
  input: InvestmentAttractivenessInput;
}

export function useInvestmentAttractiveness() {
  return useMutation({
    mutationFn: async (input: InvestmentAttractivenessInput): Promise<InvestmentAttractivenessResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "investment-attractiveness", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
