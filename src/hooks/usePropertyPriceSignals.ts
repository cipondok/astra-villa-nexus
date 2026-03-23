import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PropertyPriceSignal {
  id: string;
  property_id: string;
  city: string;
  property_type: string;
  listing_price: number;
  estimated_market_price: number;
  demand_adjusted_price: number;
  liquidity_adjusted_price: number;
  investor_bid_pressure_score: number;
  price_volatility_index: number;
  confidence_score: number;
  signal_source: string;
  created_at: string;
}

export function usePropertyPriceSignals(propertyId?: string, enabled = true) {
  return useQuery({
    queryKey: ['property-price-signals', propertyId],
    queryFn: async (): Promise<PropertyPriceSignal[]> => {
      let q = supabase
        .from('property_price_signals' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (propertyId) {
        q = q.eq('property_id', propertyId);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as PropertyPriceSignal[];
    },
    enabled,
    staleTime: 60_000,
  });
}

export interface CapitalFlowSignal {
  id: string;
  city: string;
  segment: string;
  capital_inflow_score: number;
  avg_ticket_size: number;
  investor_growth_rate: number;
  capital_volume: number;
  created_at: string;
}

export function useCapitalFlowSignals(enabled = true) {
  return useQuery({
    queryKey: ['capital-flow-signals'],
    queryFn: async (): Promise<CapitalFlowSignal[]> => {
      const { data, error } = await supabase
        .from('capital_flow_signals' as any)
        .select('*')
        .order('capital_inflow_score', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as unknown as CapitalFlowSignal[];
    },
    enabled,
    staleTime: 120_000,
  });
}
