import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface DemandForecastInput {
  property_type: string;
  transaction_type: string;
  price: number;
  building_size?: number;
  land_size?: number;
  village?: string;
  district?: string;
  city: string;
  province?: string;
  nearby_facilities?: string;
}

export interface DemandForecastResult {
  demand_level: "LOW" | "MODERATE" | "HIGH" | "VERY HIGH";
  estimated_time_on_market: string;
  demand_score: number;
  key_demand_drivers: string[];
  demand_risk_factors: string[];
  forecast_summary: string;
}

export interface DemandForecastResponse {
  result: DemandForecastResult;
  input: DemandForecastInput;
}

export function useDemandForecast() {
  return useMutation({
    mutationFn: async (input: DemandForecastInput): Promise<DemandForecastResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "demand-forecast", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
