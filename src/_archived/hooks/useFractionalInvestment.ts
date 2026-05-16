import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

async function invokeFractional(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("fractional-investment-engine", {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export function useFractionalDashboard(enabled = true) {
  return useQuery({
    queryKey: ["fractional-dashboard"],
    queryFn: () => invokeFractional("dashboard"),
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useFractionalOffers(enabled = true) {
  return useQuery({
    queryKey: ["fractional-offers"],
    queryFn: () => invokeFractional("list_offers"),
    enabled,
    staleTime: 30_000,
  });
}

export function useMyFractionalPositions(enabled = true) {
  return useQuery({
    queryKey: ["fractional-my-positions"],
    queryFn: () => invokeFractional("my_positions"),
    enabled,
    staleTime: 30_000,
  });
}

export function useReserveShares() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { offer_id: string; share_units: number }) =>
      invokeFractional("reserve_shares", params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["fractional-offers"] });
      qc.invalidateQueries({ queryKey: ["fractional-my-positions"] });
      qc.invalidateQueries({ queryKey: ["fractional-dashboard"] });
      toast.success(data.message || "Shares reserved successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useFundPosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { position_id: string }) =>
      invokeFractional("fund_position", params),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["fractional-offers"] });
      qc.invalidateQueries({ queryKey: ["fractional-my-positions"] });
      qc.invalidateQueries({ queryKey: ["fractional-dashboard"] });
      toast.success(data.message || "Position funded successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreateFractionalOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      property_id: string;
      total_property_value_idr: number;
      total_shares_available: number;
      minimum_investment_ticket_idr?: number;
      expected_annual_yield_pct?: number;
      funding_deadline?: string;
    }) => invokeFractional("create_offer", params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fractional-offers"] });
      qc.invalidateQueries({ queryKey: ["fractional-dashboard"] });
      toast.success("Fractional offer created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAssignSyndicationRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      offer_id: string;
      lead_investor_user_id: string;
      role_type?: string;
      sponsor_fee_pct?: number;
    }) => invokeFractional("assign_syndication_role", params),
    onSuccess: () => {
      toast.success("Syndication role assigned");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
