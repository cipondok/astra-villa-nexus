import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NegotiationDealIntel {
  id: string;
  deal_id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  negotiation_stage: string;
  buyer_offer_price: number;
  seller_counter_price: number;
  price_gap_percentage: number;
  interaction_frequency_score: number;
  buyer_intent_strength: number;
  seller_flexibility_score: number;
  negotiation_momentum_score: number;
  risk_of_drop_probability: number;
  recommended_next_action: string;
  ai_confidence_level: number;
  last_updated_at: string;
}

export interface NegotiationMessage {
  whatsapp: string;
  call_points: string[];
  psychology: string;
}

export function useNegotiationIntelligence(limit = 30) {
  return useQuery<NegotiationDealIntel[]>({
    queryKey: ["negotiation-deal-intelligence", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("negotiation_deal_intelligence" as any)
        .select("*")
        .order("negotiation_momentum_score", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as any) ?? [];
    },
    staleTime: 60_000,
  });
}

export function useNegotiationScoring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("negotiation-ai-assistant", {
        body: { mode: "score" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Negotiation scores updated");
      qc.invalidateQueries({ queryKey: ["negotiation-deal-intelligence"] });
    },
    onError: (e: any) => toast.error(e.message || "Scoring failed"),
  });
}

export function useNegotiationMessage() {
  return useMutation<NegotiationMessage, Error, {
    stage: string;
    buyer_type: string;
    price_gap: number;
    urgency: string;
    language?: string;
  }>({
    mutationFn: async (input) => {
      const { data, error } = await supabase.functions.invoke("negotiation-ai-assistant", {
        body: { mode: "message", ...input },
      });
      if (error) throw error;
      return data as NegotiationMessage;
    },
  });
}
