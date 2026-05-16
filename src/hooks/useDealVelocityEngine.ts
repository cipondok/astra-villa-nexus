import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function invokeDealVelocity(mode: string) {
  const { data, error } = await supabase.functions.invoke("deal-velocity-engine", { body: { mode } });
  if (error) throw error;
  return data;
}

export function useDealVelocityDashboard() {
  return useQuery({
    queryKey: ["deal-velocity-dashboard"],
    queryFn: () => invokeDealVelocity("dashboard"),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useDealConversionScoring() {
  return useQuery({
    queryKey: ["deal-velocity-scoring"],
    queryFn: () => invokeDealVelocity("score_deal"),
    staleTime: 60_000,
  });
}

export function useGenerateFollowups() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => invokeDealVelocity("generate_followups"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deal-velocity-dashboard"] }),
  });
}
