import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface ArchitectureAdvisorInput {
  feature_context: string;
  platform_status?: string;
}

export interface ArchitectureAdvisorResult {
  architecture_layer: string;
  required_data_entities: string[];
  workflow_logic: string;
  ui_feature_placement: string;
  scalability_note: string;
  next_evolution_level: string;
}

export interface ArchitectureAdvisorResponse {
  result: ArchitectureAdvisorResult;
  input: ArchitectureAdvisorInput;
}

export function useArchitectureAdvisor() {
  return useMutation({
    mutationFn: async (input: ArchitectureAdvisorInput): Promise<ArchitectureAdvisorResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "architecture-advisor", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
