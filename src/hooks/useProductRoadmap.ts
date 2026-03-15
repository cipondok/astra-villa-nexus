import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface ProductRoadmapInput {
  traffic: number;
  listings: number;
  agents: number;
  leads: number;
  revenue_stage: string;
}

export interface ProductRoadmapResult {
  platform_stage: string;
  next_priority_features: string[];
  traffic_impact_features: string[];
  conversion_impact_features: string[];
  revenue_impact_features: string[];
  recommended_30_day_focus: string;
  recommended_90_day_focus: string;
  recommended_12_month_strategy: string;
  delay_risk_warning: string;
}

export interface ProductRoadmapResponse {
  result: ProductRoadmapResult;
  input: ProductRoadmapInput;
}

export function useProductRoadmap() {
  return useMutation({
    mutationFn: async (input: ProductRoadmapInput): Promise<ProductRoadmapResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "product-roadmap", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
