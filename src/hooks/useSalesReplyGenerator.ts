import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface SalesReplyInput {
  message: string;
  location: string;
}

export interface SalesReplyResult {
  reply_text: string;
}

export interface SalesReplyResponse {
  result: SalesReplyResult;
  input: SalesReplyInput;
}

export function useSalesReplyGenerator() {
  return useMutation({
    mutationFn: async (input: SalesReplyInput): Promise<SalesReplyResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "sales-reply", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
