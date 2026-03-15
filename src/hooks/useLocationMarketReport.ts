import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface LocationMarketReportInput {
  village?: string;
  district?: string;
  city: string;
  province?: string;
  area_signals?: string;
}

export interface LocationMarketReportResult {
  report_title: string;
  market_overview: string;
  price_trend_analysis: string;
  demand_analysis: string;
  rental_market_insight: string;
  investment_outlook: string;
  future_growth_outlook: string;
}

export interface LocationMarketReportResponse {
  result: LocationMarketReportResult;
  input: LocationMarketReportInput;
}

export function useLocationMarketReport() {
  return useMutation({
    mutationFn: async (input: LocationMarketReportInput): Promise<LocationMarketReportResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "location-market-report", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
