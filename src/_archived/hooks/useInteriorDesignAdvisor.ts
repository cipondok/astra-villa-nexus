import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface InteriorDesignRequest {
  room_type: string;
  style: string;
  budget_level: "low" | "medium" | "high" | "luxury";
  room_dimensions?: string;
  current_description?: string;
  preferences?: string[];
  color_preferences?: string[];
}

export interface FurnitureItem {
  name: string;
  category: string;
  estimated_price_idr: number;
  placement_tip: string;
  brand_suggestion?: string;
  purchase_link_keyword?: string;
}

export interface InteriorDesignResult {
  design_concept: string;
  style_description: string;
  color_palette: { name: string; hex: string; usage: string }[];
  furniture_recommendations: FurnitureItem[];
  layout_tips: string[];
  lighting_suggestions: string[];
  accent_pieces: string[];
  estimated_total_budget_idr: number;
  mood_keywords: string[];
  dos: string[];
  donts: string[];
}

export function useInteriorDesignAdvisor() {
  return useMutation({
    mutationFn: async (input: InteriorDesignRequest): Promise<InteriorDesignResult> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "interior_design", payload: input },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data as InteriorDesignResult;
    },
  });
}
