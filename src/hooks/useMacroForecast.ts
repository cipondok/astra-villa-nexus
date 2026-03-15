import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface MacroForecastInput {
  economic_signals: string;
  infra_level: string;
  urban_trend: string;
  interest_rate: string;
}

export interface MacroForecastResult {
  national_price_trend: "DECLINE" | "STABLE" | "GROWTH" | "STRONG BOOM";
  market_outlook_12m: string;
  growth_drivers: string[];
  macro_risks: string[];
  investor_sentiment: string;
}

export interface MacroForecastResponse {
  result: MacroForecastResult;
  input: MacroForecastInput;
}

export function useMacroForecast() {
  return useMutation({
    mutationFn: async (input: MacroForecastInput): Promise<MacroForecastResponse> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "seo_generate", payload: { action: "macro-forecast", ...input } },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return { result: data.result, input: data.input };
    },
  });
}
