import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface MatchNarrativeInput {
  purpose: string;
  location_advantage: string;
  investment_potential: string;
}

export interface MatchNarrativeResponse {
  narrative: string;
  input: MatchNarrativeInput;
}

export function useMatchNarrative() {
  return useMutation({
    mutationFn: async (input: MatchNarrativeInput): Promise<MatchNarrativeResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "match-narrative", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { narrative: data.narrative, input: data.input };
    },
  });
}
