import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface TitleVariant {
  title: string;
  reasoning: string;
  predicted_ctr: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
}

export interface TitleRewriteResult {
  titles: TitleVariant[];
  keywords_used: string[];
  original_issues: string[];
}

export interface TitleRewriteResponse {
  result: TitleRewriteResult;
  original_title: string;
}

export function useTitleRewrite() {
  return useMutation({
    mutationFn: async (propertyId: string): Promise<TitleRewriteResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "rewrite-title", propertyId } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, original_title: data.original_title };
    },
  });
}
