import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LiquidityMetric {
  id: string;
  district: string;
  segment_type: string;
  viewing_velocity_score: number;
  offer_conversion_score: number;
  avg_days_to_offer: number;
  avg_days_to_close: number;
  deal_close_probability: number;
  viewing_count_30d: number;
  offer_count_30d: number;
  escrow_count_30d: number;
  closed_count_30d: number;
  active_listings: number;
  absorption_rate: number;
  supply_demand_ratio: number;
  liquidity_strength_index: number;
  momentum_trend: string;
  last_recalculated_at: string;
}

export interface PropertyLiquidity {
  id: string;
  property_id: string;
  viewing_velocity: number;
  offer_momentum: number;
  inquiry_intensity: number;
  price_competitiveness: number;
  days_on_market: number;
  liquidity_score: number;
  liquidity_grade: string;
  last_signal_at: string | null;
}

export const useLiquidityMetrics = (district?: string) => {
  return useQuery({
    queryKey: ['liquidity-metrics', district],
    queryFn: async () => {
      let query = supabase
        .from('market_liquidity_metrics')
        .select('*')
        .order('liquidity_strength_index', { ascending: false });
      if (district) query = query.eq('district', district);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as LiquidityMetric[];
    },
  });
};

export const usePropertyLiquidity = (propertyId?: string) => {
  return useQuery({
    queryKey: ['property-liquidity', propertyId],
    queryFn: async () => {
      let query = supabase
        .from('property_liquidity_scores')
        .select('*')
        .order('liquidity_score', { ascending: false });
      if (propertyId) query = query.eq('property_id', propertyId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PropertyLiquidity[];
    },
    enabled: propertyId ? true : true,
  });
};

export const useLiquidityHotspots = () => {
  return useQuery({
    queryKey: ['liquidity-hotspots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('liquidity_hotspot_zones')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });
};
