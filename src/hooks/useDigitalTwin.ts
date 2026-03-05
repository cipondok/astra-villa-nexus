import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface RoomInsight {
  room_name: string;
  size_sqm: number;
  renovation_cost_estimate: number;
  market_appeal_score: number;
  ai_insight: string;
}

export interface DigitalTwinData {
  property: {
    id: string;
    title: string;
    city: string;
    price: number;
    property_type: string;
    area_sqm: number;
    bedrooms: number;
    bathrooms: number;
    glb_model_url: string | null;
    listing_type: string;
  };
  scores: {
    investment_score: number;
    demand_heat_score: number;
    livability_score: number;
    luxury_score: number;
    engagement_score: number;
  };
  price_forecast: {
    current_price: number;
    forecast_price: number;
    growth_rate: number;
    forecast_years: number;
  };
  property_insights: string;
  room_insights: RoomInsight[];
  investment_analysis: string;
}

async function fetchDigitalTwin(propertyId: string): Promise<DigitalTwinData> {
  const { data, error } = await supabase.functions.invoke("core-engine", {
    body: { mode: "digital_twin", property_id: propertyId },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data?.data;
}

export function useDigitalTwin(propertyId: string | null) {
  return useQuery({
    queryKey: ["digital-twin", propertyId],
    queryFn: () => fetchDigitalTwin(propertyId!),
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}
