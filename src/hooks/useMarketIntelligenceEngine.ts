import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MarketDashboardStats {
  total_scored: number;
  total_signals: number;
  total_forecasts: number;
  total_recommendations: number;
  total_anomalies: number;
  top_properties: { id: string; title: string; city: string; investment_score: number; price: number }[];
  hot_zones: { city: string; buyer_demand_index: number; price_momentum_score: number; investment_hotspot_rank: number }[];
}

export function useMarketDashboardStats(enabled = true) {
  return useQuery({
    queryKey: ['market-intelligence-dashboard'],
    queryFn: async (): Promise<MarketDashboardStats> => {
      const { data, error } = await supabase.functions.invoke('market-intelligence-engine', {
        body: { mode: 'dashboard_stats' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useScoreProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId: string) => {
      const { data, error } = await supabase.functions.invoke('market-intelligence-engine', {
        body: { mode: 'score_property', property_id: propertyId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['market-intelligence-dashboard'] });
      qc.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Investment score calculated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useBatchScoreProperties() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (limit: number = 50) => {
      const { data, error } = await supabase.functions.invoke('market-intelligence-engine', {
        body: { mode: 'batch_score', limit },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ['market-intelligence-dashboard'] });
      toast.success(`Scored ${data.scored} properties`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRefreshZoneMetrics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('market-intelligence-engine', {
        body: { mode: 'zone_metrics' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['market-intelligence-dashboard'] });
      toast.success(`Updated ${data.zones} market zones`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDetectAnomalies() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('market-intelligence-engine', {
        body: { mode: 'detect_anomalies' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['market-intelligence-dashboard'] });
      toast.success(`Found ${data.anomalies_found} price anomalies`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useGenerateRecommendations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('market-intelligence-engine', {
        body: { mode: 'generate_recommendations' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['market-intelligence-dashboard'] });
      toast.success(`Generated ${data.recommendations_generated} recommendations`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useROIForecastEngine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId: string) => {
      const { data, error } = await supabase.functions.invoke('market-intelligence-engine', {
        body: { mode: 'roi_forecast', property_id: propertyId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['market-intelligence-dashboard'] });
      toast.success('ROI forecasts generated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMarketZoneMetrics(limit = 20) {
  return useQuery({
    queryKey: ['market-zone-metrics', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_zone_metrics' as any)
        .select('*')
        .order('investment_hotspot_rank', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60_000,
  });
}

export function useInvestorRecommendations(userId?: string) {
  return useQuery({
    queryKey: ['investor-recommendations', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investor_recommendations' as any)
        .select('*')
        .eq('is_dismissed', false)
        .order('confidence_level', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60_000,
  });
}
