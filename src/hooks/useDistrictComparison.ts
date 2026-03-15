import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface DistrictComparisonInput {
  city: string;
  district_list: string[];
}

export interface DistrictRanking {
  rank: number;
  district: string;
  score: number;
  reason: string;
}

export interface InvestmentFocus {
  district: string;
  rationale: string;
}

export interface DistrictComparisonResult {
  district_ranking: DistrictRanking[];
  emerging_districts: string[];
  mature_districts: string[];
  top_investment_focus: InvestmentFocus[];
}

export interface DistrictComparisonResponse {
  result: DistrictComparisonResult;
  input: DistrictComparisonInput;
}

export function useDistrictComparison() {
  return useMutation({
    mutationFn: async (input: DistrictComparisonInput): Promise<DistrictComparisonResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "district-comparison", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
