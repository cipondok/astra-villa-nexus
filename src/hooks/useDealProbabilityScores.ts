import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DealProbabilityScore {
  id: string;
  property_id: string;
  city: string;
  listing_price: number;
  demand_signal_score: number;
  investor_intent_density: number;
  inquiry_velocity: number;
  viewing_frequency: number;
  negotiation_activity_level: number;
  pricing_alignment_score: number;
  liquidity_zone_score: number;
  seller_flexibility_index: number;
  overall_close_probability: number;
  predicted_days_to_close: number;
  confidence_level: number;
  computed_at: string;
}

export function useDealProbabilityScores(limit = 20) {
  return useQuery<DealProbabilityScore[]>({
    queryKey: ["deal-probability-scores", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deal_probability_scores" as any)
        .select("*")
        .order("overall_close_probability", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as any) ?? [];
    },
    staleTime: 60_000,
  });
}
