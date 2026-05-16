import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface SupplyGrowthInput {
  listings: number;
  agents: number;
  traffic: number;
}

export interface SupplyGrowthResult {
  listing_growth_methods: string[];
  agent_activation_triggers: string[];
  inventory_scaling_strategy: string;
}

export interface SupplyGrowthResponse {
  result: SupplyGrowthResult;
  input: SupplyGrowthInput;
}

export function useSupplyGrowth() {
  return useMutation({
    mutationFn: async (input: SupplyGrowthInput): Promise<SupplyGrowthResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "supply-growth", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
