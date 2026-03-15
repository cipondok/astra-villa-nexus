import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface HeatNarrativeInput {
  heat_zone: string;
  city: string;
}

export interface HeatNarrativeResponse {
  result: { narrative: string };
  input: HeatNarrativeInput;
}

export function useHeatNarrative() {
  return useMutation({
    mutationFn: async (input: HeatNarrativeInput): Promise<HeatNarrativeResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "heat-narrative", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
