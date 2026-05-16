import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function invokeFounderKpi(mode: string, extra?: Record<string, any>) {
  const { data, error } = await supabase.functions.invoke("founder-kpi-engine", {
    body: { mode, ...extra },
  });
  if (error) throw error;
  return data;
}

export function useFounderDashboard() {
  return useQuery({
    queryKey: ["founder-kpi-dashboard"],
    queryFn: () => invokeFounderKpi("dashboard"),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useAggregateKpis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeFounderKpi("aggregate"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["founder-kpi-dashboard"] }),
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => invokeFounderKpi("resolve_alert", { alert_id: alertId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["founder-kpi-dashboard"] }),
  });
}
