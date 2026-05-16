import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CopilotKPIs {
  total_properties: number;
  active_listings_last_30_days: number;
  total_users: number;
  new_users_last_7_days: number;
  deals_open: number;
  deals_closed_30_days: number;
  escrow_active: number;
  stale_listings_count: number;
  ai_signals_generated_7_days: number;
  copilot_actions_7_days: number;
  top_cities_by_listing: { city: string; count: number }[];
}

interface DealFunnel {
  inquiry_count: number;
  negotiation_count: number;
  escrow_count: number;
  closed_count: number;
  conversion_rate: number;
}

interface Recommendation {
  id: string;
  type: "growth" | "vendor" | "liquidity" | "monetization";
  title: string;
  description: string;
  confidence: number;
  impact: string;
  timeWindow: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "pending" | "approved" | "executed" | "dismissed";
}

interface RiskAlert {
  id: string;
  category: string;
  severity: "critical" | "warning" | "info";
  title: string;
  metric: string;
  trend: "up" | "down" | "flat";
  probability: number;
}

export interface CopilotIntelligence {
  kpis: CopilotKPIs;
  funnel: DealFunnel;
  recommendations: Recommendation[];
  risk_alerts: RiskAlert[];
  performance: { actions_executed_7d: number; ai_signals_7d: number };
  generated_at: string;
}

export function useCopilotIntelligence() {
  const queryClient = useQueryClient();

  const query = useQuery<CopilotIntelligence>({
    queryKey: ["copilot-intelligence"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("copilot-intelligence");
      if (error) throw error;
      return data as CopilotIntelligence;
    },
    refetchInterval: 60000, // refresh every 60s
    staleTime: 30000,
  });

  const executeAction = useMutation({
    mutationFn: async ({ actionType, payload }: { actionType: string; payload?: any }) => {
      const { data, error } = await supabase.functions.invoke("copilot-intelligence", {
        method: "POST",
        body: { action_type: actionType, payload },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Action executed successfully");
      queryClient.invalidateQueries({ queryKey: ["copilot-intelligence"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Action failed");
    },
  });

  return { ...query, executeAction };
}