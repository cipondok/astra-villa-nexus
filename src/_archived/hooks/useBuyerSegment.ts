import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface BuyerSegmentInput {
  property_type: string;
  transaction_type: string;
  village?: string;
  district?: string;
  city: string;
  nearby_facilities?: string;
}

export interface BuyerSegmentResult {
  primary_buyer_segment: string;
  secondary_buyer_segments: string[];
  segment_demand_distribution: string;
  segment_insight: string;
}

export interface BuyerSegmentResponse {
  result: BuyerSegmentResult;
  input: BuyerSegmentInput;
}

export function useBuyerSegment() {
  return useMutation({
    mutationFn: async (input: BuyerSegmentInput): Promise<BuyerSegmentResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "buyer-segment", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
