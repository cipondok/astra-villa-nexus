import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface MarketReportData {
  market_data: {
    city: string;
    total_listings: number;
    new_listings_30d: number;
    new_listings_90d: number;
    price_stats: { avg: number; median: number; min: number; max: number };
    avg_price_per_sqm: number;
    type_distribution: Record<string, number>;
    listing_type_split: { sale: number; rent: number };
    avg_investment_score: number;
    report_date: string;
  };
  narrative: {
    executive_summary: string;
    market_overview: string;
    price_analysis: string;
    investment_outlook: string;
    property_type_analysis: string;
    demand_indicators: string;
    recommendations: string[];
    risk_factors: string[];
    forecast: string;
  };
}

async function generateReport(city: string): Promise<MarketReportData> {
  const { data, error } = await supabase.functions.invoke("ai-engine", {
    body: { mode: "market_report", payload: { city } },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data as MarketReportData;
}

export function useMarketReport() {
  return useMutation({
    mutationFn: (city: string) => generateReport(city),
  });
}
