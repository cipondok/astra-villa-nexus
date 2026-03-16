import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MarketHeatZone {
  city: string;
  state: string;
  property_count: number;
  active_listings: number;
  new_listings_30d: number;
  heat_score: number;
  avg_opportunity_score: number;
  avg_deal_score: number;
  avg_demand_score: number;
  opportunity_density: number;
  total_views: number;
  total_saves: number;
  total_inquiries: number;
  avg_days_on_market: number;
  heat_label: string;
  zone_status: 'hotspot' | 'surging' | 'growing' | 'stable' | 'cooling' | 'cooling_risk';
  hot_count: number;
  stable_count: number;
  cooling_count: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  avg_price_per_sqm: number;
  median_price: number;
  trend_direction: 'rising' | 'stable' | 'declining';
  heat_trend_3m: string;
  trend_confidence: number;
  cooling_risk_signals: string[];
  emerging_signals: string[];
  cluster_center_lat: number | null;
  cluster_center_lng: number | null;
  computed_at: string;
}

export interface HeatmapPoint {
  cluster_key: string;
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
  heat_score: number;
  heat_label: string;
  zone_status: string;
  opportunity_density: number;
  trend_direction: string;
  heat_trend_3m: string;
  confidence: number;
  property_count: number;
  avg_price: number;
}

/** Fetch heat zones from cache table */
export function useMarketHeatZones(minProperties = 3) {
  return useQuery({
    queryKey: ['market-heat-zones', minProperties],
    queryFn: async (): Promise<MarketHeatZone[]> => {
      const { data, error } = await supabase.rpc(
        'get_market_heat_zones' as any,
        { p_min_properties: minProperties }
      );
      if (error) throw error;
      return (data as any) || [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/** Fetch lightweight heatmap dataset for map rendering */
export function useHeatmapDataset(minScore = 0) {
  return useQuery({
    queryKey: ['heatmap-dataset', minScore],
    queryFn: async (): Promise<HeatmapPoint[]> => {
      const { data, error } = await supabase.rpc(
        'get_heatmap_dataset' as any,
        { p_min_score: minScore }
      );
      if (error) throw error;
      return (data as any) || [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/** Trigger full cluster computation */
export function useComputeHeatClusters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (minProperties = 3) => {
      const { data, error } = await supabase.rpc(
        'compute_market_heat_clusters' as any,
        { p_min_properties: minProperties }
      );
      if (error) throw error;
      return data as unknown as { clusters_computed: number; duration_ms: number; timestamp: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['market-heat-zones'] });
      queryClient.invalidateQueries({ queryKey: ['heatmap-dataset'] });
      if (data?.clusters_computed > 0) {
        toast.success(`Computed ${data.clusters_computed} heat clusters in ${Math.round(data.duration_ms)}ms`);
      } else {
        toast.info('No clusters to compute');
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Cluster computation failed');
    },
  });
}

export function useInvestmentReasoning(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['investment-reasoning', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        'get_investment_reasoning' as any,
        { p_property_id: propertyId }
      );
      if (error) throw error;
      return data as any;
    },
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000,
  });
}

export const ZONE_STATUS_CONFIG = {
  hotspot: { label: 'Investment Hotspot', color: 'text-destructive bg-destructive/10 border-destructive/20', icon: '🔥' },
  surging: { label: 'Surging Zone', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', icon: '🚀' },
  growing: { label: 'Growing Market', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: '📈' },
  stable: { label: 'Stable Market', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: '⚖️' },
  cooling: { label: 'Cooling Market', color: 'text-muted-foreground bg-muted/30 border-border/40', icon: '❄️' },
  cooling_risk: { label: 'Cooling Risk', color: 'text-destructive bg-destructive/10 border-destructive/20', icon: '⚠️' },
} as const;

export const HEAT_COLORS = {
  extreme: { min: 76, color: '#EF4444', label: 'Extreme' },
  high: { min: 51, color: '#FB923C', label: 'High' },
  moderate: { min: 26, color: '#FACC15', label: 'Moderate' },
  low: { min: 0, color: '#93C5FD', label: 'Low' },
} as const;

export function getHeatColor(score: number) {
  if (score >= 76) return HEAT_COLORS.extreme;
  if (score >= 51) return HEAT_COLORS.high;
  if (score >= 26) return HEAT_COLORS.moderate;
  return HEAT_COLORS.low;
}
