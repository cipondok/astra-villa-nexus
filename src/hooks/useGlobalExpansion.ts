import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

async function invokeExpansion(mode: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("global-expansion-engine", {
    body: { mode, params: params || {} },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export function useExpansionDashboard(enabled = true) {
  return useQuery({
    queryKey: ["global-expansion-dashboard"],
    queryFn: () => invokeExpansion("dashboard"),
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useCountryList(enabled = true) {
  return useQuery({
    queryKey: ["global-countries"],
    queryFn: () => invokeExpansion("list_countries"),
    enabled,
    staleTime: 30_000,
  });
}

export function useMarketInsights(countryCode?: string) {
  return useQuery({
    queryKey: ["global-market-insights", countryCode],
    queryFn: () => invokeExpansion("market_insights", { country_code: countryCode }),
    staleTime: 60_000,
  });
}

export function useAddCountry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { country_code: string; country_name: string; base_currency?: string; flag_emoji?: string }) =>
      invokeExpansion("add_country", params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["global-expansion-dashboard"] });
      qc.invalidateQueries({ queryKey: ["global-countries"] });
      toast.success("Country added successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAddPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { country_code: string; partner_name: string; partner_type: string; contact_email?: string }) =>
      invokeExpansion("add_partner", params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["global-expansion-dashboard"] });
      toast.success("Partner added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
