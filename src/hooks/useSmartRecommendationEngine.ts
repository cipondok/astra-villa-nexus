/**
 * AI Property Recommendation Engine
 * Scores and ranks properties based on user behavior, segment, and market data
 */

import { useMemo, useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RecommendationInput {
  segment?: string;
  budgetMin?: number;
  budgetMax?: number;
  location?: string;
  conversionScore?: number;
  behaviorSignals?: BehaviorSignals;
}

interface BehaviorSignals {
  viewedPropertyIds: string[];
  savedPropertyIds: string[];
  searchQueries: string[];
  dwellTimeByProperty: Record<string, number>;
  clickPatterns: string[];
}

interface ScoredProperty {
  propertyId: string;
  title: string;
  location: string;
  price: number;
  imageUrl: string;
  propertyType: string;
  score: number;
  reasons: string[];
  category: 'recommended' | 'high_growth' | 'similar' | 'trending';
}

interface RecommendationResult {
  recommended: ScoredProperty[];
  highGrowth: ScoredProperty[];
  similar: ScoredProperty[];
  trending: ScoredProperty[];
}

function scoreProperty(
  property: any,
  input: RecommendationInput,
  viewCounts: Record<string, number>
): { score: number; reasons: string[] } {
  let score = 50;
  const reasons: string[] = [];

  // Budget match (0–25 pts)
  if (input.budgetMin !== undefined && input.budgetMax !== undefined) {
    const price = property.price || 0;
    if (price >= input.budgetMin && price <= input.budgetMax) {
      score += 25;
      reasons.push('Within your budget range');
    } else if (price < input.budgetMin * 1.2 && price > input.budgetMax * 0.8) {
      score += 10;
      reasons.push('Close to your budget');
    }
  }

  // Location match (0–20 pts)
  if (input.location && property.city?.toLowerCase().includes(input.location.toLowerCase())) {
    score += 20;
    reasons.push(`Located in ${property.city}`);
  }

  // Popularity signal (0–15 pts)
  const views = viewCounts[property.id] || 0;
  if (views > 50) {
    score += 15;
    reasons.push('High investor interest');
  } else if (views > 20) {
    score += 8;
    reasons.push('Growing demand');
  }

  // Behavior match (0–20 pts)
  if (input.behaviorSignals) {
    const { viewedPropertyIds, savedPropertyIds, dwellTimeByProperty } = input.behaviorSignals;
    
    // Similar to saved
    if (savedPropertyIds.length > 0) {
      score += 10;
      reasons.push('Similar to your watchlist');
    }
    
    // High dwell time on similar type
    const avgDwell = Object.values(dwellTimeByProperty).reduce((a, b) => a + b, 0) / 
      Math.max(Object.values(dwellTimeByProperty).length, 1);
    if (avgDwell > 30) {
      score += 10;
      reasons.push('Matches your browsing pattern');
    }
  }

  // ROI potential (simulated, 0–20 pts)
  if (property.investment_score && property.investment_score > 7) {
    score += 20;
    reasons.push('High ROI potential zone');
  } else if (property.investment_score && property.investment_score > 5) {
    score += 10;
    reasons.push('Solid growth trajectory');
  }

  return { score: Math.min(score, 100), reasons };
}

export function useSmartRecommendationEngine(input: RecommendationInput = {}) {
  const { user } = useAuth();
  const learningRef = useRef<Map<string, number>>(new Map());

  const { data: properties, isLoading } = useQuery({
    queryKey: ['recommendation-properties', input.location, input.budgetMin, input.budgetMax],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('id, title, city, location, price, property_type, thumbnail_url, bedrooms, bathrooms, area, status, investment_score')
        .eq('status', 'active')
        .limit(100);

      if (input.budgetMin) query = query.gte('price', input.budgetMin * 0.7);
      if (input.budgetMax) query = query.lte('price', input.budgetMax * 1.3);
      if (input.location) query = query.ilike('city', `%${input.location}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: true,
  });

  const { data: viewCounts } = useQuery({
    queryKey: ['property-view-counts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('property_analytics')
        .select('property_id, views');
      const map: Record<string, number> = {};
      data?.forEach(r => { map[r.property_id] = r.views || 0; });
      return map;
    },
    staleTime: 10 * 60 * 1000,
  });

  const recommendations = useMemo((): RecommendationResult => {
    if (!properties?.length) return { recommended: [], highGrowth: [], similar: [], trending: [] };

    const scored: ScoredProperty[] = properties.map(p => {
      const { score, reasons } = scoreProperty(p, input, viewCounts || {});
      // Apply learning adjustments
      const learningBoost = learningRef.current.get(p.id) || 0;
      
      return {
        propertyId: p.id,
        title: p.title,
        location: p.location || p.city || '',
        price: p.price || 0,
        imageUrl: p.thumbnail_url || '',
        propertyType: p.property_type || 'villa',
        score: Math.min(score + learningBoost, 100),
        reasons,
        category: 'recommended' as const,
      };
    });

    scored.sort((a, b) => b.score - a.score);

    const recommended = scored.slice(0, 6).map(p => ({ ...p, category: 'recommended' as const }));
    
    const highGrowth = scored
      .filter(p => p.reasons.some(r => r.includes('ROI') || r.includes('growth')))
      .slice(0, 6)
      .map(p => ({ ...p, category: 'high_growth' as const }));

    const trending = scored
      .filter(p => p.reasons.some(r => r.includes('interest') || r.includes('demand')))
      .slice(0, 6)
      .map(p => ({ ...p, category: 'trending' as const }));

    const similar = scored
      .filter(p => p.reasons.some(r => r.includes('watchlist') || r.includes('browsing')))
      .slice(0, 6)
      .map(p => ({ ...p, category: 'similar' as const }));

    return { recommended, highGrowth, similar, trending };
  }, [properties, input, viewCounts]);

  // Adaptive learning: boost properties user interacts with
  const recordInteraction = useCallback((propertyId: string, type: 'click' | 'save' | 'dwell' | 'purchase') => {
    const boostMap = { click: 2, save: 5, dwell: 3, purchase: 10 };
    const current = learningRef.current.get(propertyId) || 0;
    learningRef.current.set(propertyId, current + boostMap[type]);
  }, []);

  return {
    recommendations,
    isLoading,
    recordInteraction,
  };
}
