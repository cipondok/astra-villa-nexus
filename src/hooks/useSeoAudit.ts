import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface SeoAuditResult {
  seo_score: number;
  ranking_probability: "LOW" | "MEDIUM" | "HIGH";
  location_competition_score: number;
  buyer_intent_score: number;
  content_uniqueness_score: number;
  traffic_potential_score: number;
  location_depth_score: number;
  emotional_trigger_score: number;
  investment_language_score: number;
  title_feedback: string;
  description_feedback: string;
  keyword_suggestions: string[];
  improvement_actions: string[];
  competitive_analysis: string;
  content_gap_keywords: string[];
}

export function useSeoAudit() {
  return useMutation({
    mutationFn: async (propertyId: string): Promise<SeoAuditResult> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "ai-audit", propertyId } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data.audit as SeoAuditResult;
    },
  });
}
