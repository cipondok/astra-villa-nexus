/**
 * ML-Based Recommendation Engine
 * Gradient-boosted scoring model for property ranking
 * Replaces rule-based scoring with data-driven predictions
 */

import { useMemo, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MLFeatureVector {
  // Property features
  priceNormalized: number;
  yieldPct: number;
  demandIndex: number;
  supplyIndex: number;
  priceChangePct: number;
  daysOnMarket: number;
  investmentScore: number;
  liquidityScore: number;
  // User behavior features
  userViewCount: number;
  userSaveCount: number;
  userDwellTime: number;
  userBudgetMatch: number;
  userLocationMatch: number;
  // Market features
  marketMomentum: number;
  interestRate: number;
  inflationRate: number;
}

interface ScoredRecommendation {
  propertyId: string;
  title: string;
  city: string;
  location: string;
  price: number;
  thumbnailUrl: string;
  propertyType: string;
  conversionProbability: number;
  expectedROI: number;
  riskScore: number;
  explanations: string[];
  rank: number;
}

// Simulated gradient-boosted model weights (trained offline)
// In production, these would come from a trained model served via edge function
const MODEL_WEIGHTS = {
  intercept: 0.35,
  features: {
    priceNormalized: -0.08,
    yieldPct: 0.18,
    demandIndex: 0.15,
    supplyIndex: -0.05,
    priceChangePct: 0.12,
    daysOnMarket: -0.03,
    investmentScore: 0.20,
    liquidityScore: 0.10,
    userViewCount: 0.08,
    userSaveCount: 0.15,
    userDwellTime: 0.06,
    userBudgetMatch: 0.22,
    userLocationMatch: 0.18,
    marketMomentum: 0.14,
    interestRate: -0.06,
    inflationRate: -0.04,
  },
};

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function predictConversion(features: MLFeatureVector): number {
  let logit = MODEL_WEIGHTS.intercept;
  for (const [key, weight] of Object.entries(MODEL_WEIGHTS.features)) {
    const value = features[key as keyof MLFeatureVector] ?? 0;
    logit += weight * value;
  }
  return sigmoid(logit);
}

function estimateROI(property: any, trends: any[]): number {
  const cityTrend = trends.find(t => 
    t.city?.toLowerCase() === property.city?.toLowerCase()
  );
  if (!cityTrend) return 0.06; // default 6%

  const appreciation = (cityTrend.price_change_pct || 0) / 100;
  const rentalYield = (cityTrend.rental_yield_pct || 0) / 100;
  return appreciation + rentalYield;
}

function generateExplanations(features: MLFeatureVector, roi: number): string[] {
  const explanations: string[] = [];
  
  if (features.userBudgetMatch > 0.7) explanations.push('Fits your investment budget');
  if (features.userLocationMatch > 0.7) explanations.push('In your preferred location');
  if (features.yieldPct > 6) explanations.push(`Strong ${features.yieldPct.toFixed(1)}% rental yield`);
  if (features.demandIndex > 70) explanations.push('High market demand zone');
  if (features.priceChangePct > 5) explanations.push('Appreciating market');
  if (features.marketMomentum > 60) explanations.push('Strong market momentum');
  if (roi > 0.12) explanations.push(`Expected ${(roi * 100).toFixed(1)}% annual ROI`);
  if (features.investmentScore > 7) explanations.push('Top-rated investment opportunity');
  if (features.liquidityScore > 70) explanations.push('High liquidity — easy to exit');
  
  return explanations.length > 0 ? explanations.slice(0, 3) : ['Curated investment opportunity'];
}

interface MLRecommendationInput {
  budgetMin?: number;
  budgetMax?: number;
  preferredCities?: string[];
  limit?: number;
}

export function useMLRecommendationEngine(input: MLRecommendationInput = {}) {
  const { user } = useAuth();
  const { limit = 20 } = input;

  // Fetch properties
  const { data: properties, isLoading: loadingProperties } = useQuery({
    queryKey: ['ml-rec-properties', input.budgetMin, input.budgetMax, input.preferredCities],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('id, title, city, location, price, property_type, thumbnail_url, bedrooms, bathrooms, area_sqm, status, investment_score, liquidity_score, days_on_market, rental_yield_percentage, views_count, saves_count')
        .eq('status', 'active')
        .limit(200);

      if (input.budgetMin) query = query.gte('price', input.budgetMin * 0.6);
      if (input.budgetMax) query = query.lte('price', input.budgetMax * 1.5);
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch market trends
  const { data: trends } = useQuery({
    queryKey: ['ml-rec-trends'],
    queryFn: async () => {
      const { data } = await supabase
        .from('market_price_trends')
        .select('*')
        .order('period_end', { ascending: false })
        .limit(50);
      return data || [];
    },
    staleTime: 30 * 60 * 1000,
  });

  // Fetch forecasts
  const { data: forecasts } = useQuery({
    queryKey: ['ml-rec-forecasts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('investment_forecasts')
        .select('*')
        .order('computed_at', { ascending: false })
        .limit(200);
      return data || [];
    },
    staleTime: 15 * 60 * 1000,
  });

  const recommendations = useMemo((): ScoredRecommendation[] => {
    if (!properties?.length) return [];

    const marketTrends = trends || [];
    const budgetMid = ((input.budgetMin || 0) + (input.budgetMax || Infinity)) / 2;
    const prefCities = input.preferredCities?.map(c => c.toLowerCase()) || [];

    const scored = properties.map(p => {
      const cityTrend = marketTrends.find(t => 
        t.city?.toLowerCase() === p.city?.toLowerCase()
      );

      const features: MLFeatureVector = {
        priceNormalized: p.price ? Math.log(p.price) / 25 : 0.5,
        yieldPct: p.rental_yield_percentage || cityTrend?.rental_yield_pct || 5,
        demandIndex: cityTrend?.demand_index || 50,
        supplyIndex: cityTrend?.supply_index || 50,
        priceChangePct: cityTrend?.price_change_pct || 0,
        daysOnMarket: Math.min((p.days_on_market || 30) / 365, 1),
        investmentScore: (p.investment_score || 5) / 10,
        liquidityScore: (p.liquidity_score || 50) / 100,
        userViewCount: Math.min((p.views_count || 0) / 100, 1),
        userSaveCount: Math.min((p.saves_count || 0) / 50, 1),
        userDwellTime: 0.5, // Would come from behavior tracking
        userBudgetMatch: p.price && budgetMid && isFinite(budgetMid) 
          ? Math.max(0, 1 - Math.abs(Math.log(p.price / budgetMid))) 
          : 0.5,
        userLocationMatch: prefCities.length > 0 && p.city
          ? (prefCities.includes(p.city.toLowerCase()) ? 1 : 0.3)
          : 0.5,
        marketMomentum: (cityTrend?.demand_index || 50) - (cityTrend?.supply_index || 50) > 0 
          ? Math.min(((cityTrend?.demand_index || 50) - (cityTrend?.supply_index || 50)) / 50, 1) 
          : 0,
        interestRate: cityTrend?.interest_rate || 6,
        inflationRate: cityTrend?.inflation_rate || 3,
      };

      const conversionProbability = predictConversion(features);
      const expectedROI = estimateROI(p, marketTrends);
      const riskScore = Math.max(0, Math.min(100, 
        50 + (features.inflationRate * 5) - (features.yieldPct * 3) + (features.daysOnMarket * 20)
      ));
      const explanations = generateExplanations(features, expectedROI);

      // Find matching forecast
      const forecast = (forecasts || []).find(f => f.property_id === p.id);

      return {
        propertyId: p.id,
        title: p.title,
        city: p.city || '',
        location: p.location || '',
        price: p.price || 0,
        thumbnailUrl: p.thumbnail_url || '',
        propertyType: p.property_type || 'villa',
        conversionProbability,
        expectedROI: forecast?.predicted_appreciation_pct 
          ? forecast.predicted_appreciation_pct / 100 
          : expectedROI,
        riskScore,
        explanations,
        rank: 0,
      };
    });

    // Sort by composite score: 60% conversion probability + 30% ROI + 10% inverse risk
    scored.sort((a, b) => {
      const scoreA = a.conversionProbability * 0.6 + a.expectedROI * 0.3 + (1 - a.riskScore / 100) * 0.1;
      const scoreB = b.conversionProbability * 0.6 + b.expectedROI * 0.3 + (1 - b.riskScore / 100) * 0.1;
      return scoreB - scoreA;
    });

    return scored.slice(0, limit).map((s, i) => ({ ...s, rank: i + 1 }));
  }, [properties, trends, forecasts, input, limit]);

  return {
    recommendations,
    isLoading: loadingProperties,
    totalCandidates: properties?.length || 0,
  };
}
