import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MarketAnomaly {
  anomaly_type: 'DEMAND_SHOCK' | 'OVERSUPPLY_ZONE' | 'PRICE_OVERHEATING' | 'LIQUIDITY_FREEZE';
  affected_area: string;
  severity: 'ALERT' | 'WATCH' | 'NORMAL';
  metric_value: number | Record<string, number>;
  insight_summary: string;
  recommended_admin_action: string;
}

export interface MarketAnomalyResult {
  anomalies: MarketAnomaly[];
  total_detected: number;
  alert_count: number;
  watch_count: number;
  scanned_at: string;
}

export function useMarketAnomalyDetector(enabled = true) {
  return useQuery({
    queryKey: ['market-anomaly-detector'],
    queryFn: async (): Promise<MarketAnomalyResult> => {
      const { data, error } = await supabase.rpc('detect_market_anomalies');
      if (error) throw error;
      return data as unknown as MarketAnomalyResult;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
