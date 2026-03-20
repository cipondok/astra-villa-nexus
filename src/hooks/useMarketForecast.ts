import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PriceGrowthForecast {
  current_trend: 'rising' | 'stable' | 'declining';
  next_quarter_pct: number;
  next_year_pct: number;
  confidence: number;
}

export interface RentalYieldProjection {
  current_avg_pct: number;
  projected_pct: number;
  trend: 'improving' | 'stable' | 'declining';
  confidence: number;
}

export interface LiquidityCycle {
  current_phase: 'accumulation' | 'expansion' | 'distribution' | 'contraction';
  phase_strength: number;
  months_remaining: number;
  next_phase: string;
}

export interface RiskFactor {
  name: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface OpportunityWindow {
  type: string;
  window: string;
  confidence: number;
  description: string;
}

export interface MarketForecast {
  city: string;
  timeframe: string;
  generated_at: string;
  price_growth_forecast: PriceGrowthForecast;
  rental_yield_projection: RentalYieldProjection;
  liquidity_cycle: LiquidityCycle;
  risk_score: { overall: number; factors: RiskFactor[] };
  opportunity_windows: OpportunityWindow[];
  key_drivers: string[];
  seasonal_insight: string;
}

export function useMarketForecast() {
  const [forecast, setForecast] = useState<MarketForecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = useCallback(async (cityId: string, timeframe = '12m') => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('forecast-market-trends', {
        body: { city_id: cityId, timeframe },
      });

      if (fnError) throw fnError;

      if (data?.error) {
        throw new Error(data.error);
      }

      setForecast(data as MarketForecast);
      return data as MarketForecast;
    } catch (err: any) {
      const msg = err?.message || 'Failed to generate forecast';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { forecast, isLoading, error, fetchForecast };
}
