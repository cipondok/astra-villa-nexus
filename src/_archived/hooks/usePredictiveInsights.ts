/**
 * Predictive Investment Insights Engine
 * Generates price forecasts, growth predictions, and market hotspot detection
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PredictionResult {
  city: string;
  district?: string;
  propertyType: string;
  currentMedianPrice: number;
  predictedPrice12m: number;
  predictedAppreciation: number;
  predictedYield: number;
  confidenceScore: number;
  growthDrivers: string[];
  riskFactors: string[];
  hotspotScore: number;
  trend: 'rising' | 'stable' | 'declining';
}

interface MarketHotspot {
  city: string;
  score: number;
  reasons: string[];
  predictedGrowth: number;
  investorActivity: string;
}

// Time-series forecasting using exponential smoothing
function exponentialSmoothing(values: number[], alpha: number = 0.3, periods: number = 4): number[] {
  if (values.length === 0) return [];
  
  const forecast: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    forecast.push(alpha * values[i] + (1 - alpha) * forecast[i - 1]);
  }
  
  // Extend forecast
  const lastValue = forecast[forecast.length - 1];
  const trend = values.length > 1 
    ? (values[values.length - 1] - values[0]) / values.length 
    : 0;
  
  for (let i = 0; i < periods; i++) {
    forecast.push(lastValue + trend * (i + 1));
  }
  
  return forecast;
}

function detectGrowthDrivers(trend: any): string[] {
  const drivers: string[] = [];
  if (trend.demand_index > 70) drivers.push('High buyer demand');
  if (trend.rental_yield_pct > 7) drivers.push('Strong rental yields');
  if (trend.price_change_pct > 5) drivers.push('Price momentum');
  if (trend.transaction_volume > 100) drivers.push('Active transaction market');
  if (trend.occupancy_rate_pct > 85) drivers.push('High occupancy rates');
  if (trend.gdp_growth_pct > 5) drivers.push('Strong economic growth');
  if (trend.supply_index < 40) drivers.push('Limited supply');
  return drivers.length > 0 ? drivers : ['Stable market conditions'];
}

function detectRiskFactors(trend: any): string[] {
  const risks: string[] = [];
  if (trend.interest_rate > 7) risks.push('High interest rates');
  if (trend.inflation_rate > 5) risks.push('Elevated inflation');
  if (trend.supply_index > 70) risks.push('Oversupply risk');
  if (trend.price_change_pct < -2) risks.push('Price correction underway');
  if (trend.demand_index < 30) risks.push('Weak demand');
  return risks;
}

export function usePredictiveInsights(city?: string) {
  const { data: trends, isLoading: loadingTrends } = useQuery({
    queryKey: ['predictive-trends', city],
    queryFn: async () => {
      let query = supabase
        .from('market_price_trends')
        .select('*')
        .order('period_end', { ascending: true })
        .limit(200);

      if (city) query = query.ilike('city', `%${city}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 15 * 60 * 1000,
  });

  const { data: forecasts } = useQuery({
    queryKey: ['predictive-forecasts', city],
    queryFn: async () => {
      let query = supabase
        .from('investment_forecasts')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(100);

      if (city) query = query.ilike('city', `%${city}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 15 * 60 * 1000,
  });

  const predictions = useMemo((): PredictionResult[] => {
    if (!trends?.length) return [];

    // Group by city
    const byCity = new Map<string, typeof trends>();
    for (const t of trends) {
      const key = `${t.city}-${t.property_type}`;
      if (!byCity.has(key)) byCity.set(key, []);
      byCity.get(key)!.push(t);
    }

    const results: PredictionResult[] = [];

    for (const [key, cityTrends] of byCity) {
      const latest = cityTrends[cityTrends.length - 1];
      const prices = cityTrends.map(t => t.median_price || 0).filter(p => p > 0);
      
      if (prices.length === 0) continue;

      const forecastPrices = exponentialSmoothing(prices, 0.3, 4);
      const currentPrice = prices[prices.length - 1];
      const predictedPrice = forecastPrices[forecastPrices.length - 1];
      const appreciation = currentPrice > 0 
        ? ((predictedPrice - currentPrice) / currentPrice) * 100 
        : 0;

      // Compute hotspot score
      const demandScore = (latest.demand_index || 50) / 100;
      const yieldScore = Math.min((latest.rental_yield_pct || 5) / 10, 1);
      const momentumScore = Math.min(Math.max((latest.price_change_pct || 0) / 20 + 0.5, 0), 1);
      const hotspotScore = (demandScore * 0.4 + yieldScore * 0.3 + momentumScore * 0.3) * 100;

      const trend: PredictionResult['trend'] = appreciation > 3 ? 'rising' 
        : appreciation < -2 ? 'declining' : 'stable';

      // Check if stored forecast exists
      const storedForecast = forecasts?.find(f => 
        f.city?.toLowerCase() === latest.city?.toLowerCase()
      );

      results.push({
        city: latest.city,
        district: latest.district || undefined,
        propertyType: latest.property_type,
        currentMedianPrice: currentPrice,
        predictedPrice12m: storedForecast?.predicted_price || predictedPrice,
        predictedAppreciation: storedForecast?.predicted_appreciation_pct || appreciation,
        predictedYield: storedForecast?.predicted_yield_pct || latest.rental_yield_pct || 5,
        confidenceScore: storedForecast?.confidence_score || Math.min(50 + prices.length * 5, 90),
        growthDrivers: storedForecast?.growth_drivers || detectGrowthDrivers(latest),
        riskFactors: storedForecast?.risk_factors || detectRiskFactors(latest),
        hotspotScore,
        trend,
      });
    }

    return results.sort((a, b) => b.hotspotScore - a.hotspotScore);
  }, [trends, forecasts]);

  const hotspots = useMemo((): MarketHotspot[] => {
    return predictions
      .filter(p => p.hotspotScore > 60)
      .slice(0, 10)
      .map(p => ({
        city: p.city,
        score: p.hotspotScore,
        reasons: p.growthDrivers.slice(0, 3),
        predictedGrowth: p.predictedAppreciation,
        investorActivity: p.hotspotScore > 80 ? 'Very High' : p.hotspotScore > 60 ? 'High' : 'Moderate',
      }));
  }, [predictions]);

  return {
    predictions,
    hotspots,
    isLoading: loadingTrends,
  };
}
