import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

async function invokeFund(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("fund-management-engine", {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export function useFundDashboard(enabled = true) {
  return useQuery({
    queryKey: ["fund-dashboard"],
    queryFn: () => invokeFund("dashboard"),
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useFundList(enabled = true) {
  return useQuery({
    queryKey: ["fund-list"],
    queryFn: () => invokeFund("list_funds"),
    enabled,
    staleTime: 30_000,
  });
}

export function useFundDetail(fundId: string | undefined) {
  return useQuery({
    queryKey: ["fund-detail", fundId],
    queryFn: () => invokeFund("fund_detail", { fund_id: fundId }),
    enabled: !!fundId,
    staleTime: 30_000,
  });
}

export function useMyFundPositions(enabled = true) {
  return useQuery({
    queryKey: ["fund-my-positions"],
    queryFn: () => invokeFund("my_positions"),
    enabled,
    staleTime: 30_000,
  });
}

export function useSubscribeToFund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { fund_id: string; amount_idr: number }) =>
      invokeFund("subscribe", params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["fund-dashboard"] });
      qc.invalidateQueries({ queryKey: ["fund-list"] });
      qc.invalidateQueries({ queryKey: ["fund-my-positions"] });
      toast.success(data.message || "Subscription successful");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRedeemFundUnits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { position_id: string; units: number }) =>
      invokeFund("redeem", params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["fund-my-positions"] });
      qc.invalidateQueries({ queryKey: ["fund-dashboard"] });
      toast.success(data.message || "Redemption request submitted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCalculateNAV() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { fund_id: string }) =>
      invokeFund("calculate_nav", params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["fund-dashboard"] });
      toast.success(`NAV updated: Rp ${data.nav_per_unit?.toLocaleString()}/unit`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDistributeFundYield() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { fund_id: string; total_amount_idr: number; distribution_type?: string }) =>
      invokeFund("distribute", params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fund-dashboard"] });
      toast.success("Distribution processed");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
