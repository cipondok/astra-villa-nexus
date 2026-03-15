import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface SalesClosingInput {
  buyer_profile: string;
  property_advantage: string;
  negotiation_context: string;
}

export interface SalesClosingResult {
  closing_message: string;
}

export interface SalesClosingResponse {
  result: SalesClosingResult;
  input: SalesClosingInput;
}

export function useSalesClosing() {
  return useMutation({
    mutationFn: async (input: SalesClosingInput): Promise<SalesClosingResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "sales-closing", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
