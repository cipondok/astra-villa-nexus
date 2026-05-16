import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PropertyInvestmentScore {
  id: string;
  property_id: string;
  investment_score: number;
  roi_forecast: number;
  rental_yield: number;
  growth_prediction: number;
  risk_level: 'low' | 'medium' | 'high';
  location_demand_score: number;
  price_fairness_score: number;
  liquidity_score: number;
  grade: string;
  recommendation: string | null;
  factors: Record<string, number>;
  last_updated: string;
}

export interface LeaderboardProperty {
  property_id: string;
  investment_score: number;
  roi_forecast: number;
  rental_yield: number;
  growth_prediction: number;
  risk_level: string;
  grade: string;
  recommendation: string | null;
  factors: Record<string, number>;
  last_updated: string;
  // Joined from properties
  title?: string;
  price?: number;
  city?: string;
  state?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  thumbnail_url?: string;
  images?: string[];
}

/** Fetch investment score for a single property */
export function usePropertyInvestmentScore(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['property-investment-score', propertyId],
    queryFn: async (): Promise<PropertyInvestmentScore | null> => {
      const { data, error } = await (supabase as any)
        .from('property_investment_scores')
        .select('*')
        .eq('property_id', propertyId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000,
  });
}

/** Fetch leaderboard: top properties ranked by investment score */
export function useInvestmentLeaderboard(options: {
  limit?: number;
  riskLevel?: string;
  minScore?: number;
  city?: string;
} = {}) {
  const { limit = 50, riskLevel, minScore = 0, city } = options;

  return useQuery({
    queryKey: ['investment-leaderboard', limit, riskLevel, minScore, city],
    queryFn: async (): Promise<LeaderboardProperty[]> => {
      let query = (supabase as any)
        .from('property_investment_scores')
        .select(`
          property_id, investment_score, roi_forecast, rental_yield,
          growth_prediction, risk_level, grade, recommendation, factors, last_updated,
          properties!inner(title, price, city, state, property_type, bedrooms, bathrooms, area_sqm, thumbnail_url, images)
        `)
        .gte('investment_score', minScore)
        .order('investment_score', { ascending: false })
        .limit(limit);

      if (riskLevel && riskLevel !== 'all') {
        query = query.eq('risk_level', riskLevel);
      }
      if (city) {
        query = query.ilike('properties.city', `%${city}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((row: any) => ({
        ...row,
        title: row.properties?.title,
        price: row.properties?.price,
        city: row.properties?.city,
        state: row.properties?.state,
        property_type: row.properties?.property_type,
        bedrooms: row.properties?.bedrooms,
        bathrooms: row.properties?.bathrooms,
        area_sqm: row.properties?.area_sqm,
        thumbnail_url: row.properties?.thumbnail_url,
        images: row.properties?.images,
        properties: undefined,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Fetch score distribution stats */
export function useInvestmentScoreStats() {
  return useQuery({
    queryKey: ['investment-score-stats'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('property_investment_scores')
        .select('investment_score, grade, risk_level');
      if (error) throw error;

      const scores = (data || []) as PropertyInvestmentScore[];
      const total = scores.length;
      if (total === 0) return { total: 0, avgScore: 0, gradeDistribution: {}, riskDistribution: {} };

      const avgScore = Math.round(scores.reduce((a, b) => a + b.investment_score, 0) / total);
      const gradeDistribution: Record<string, number> = {};
      const riskDistribution: Record<string, number> = {};

      scores.forEach(s => {
        gradeDistribution[s.grade] = (gradeDistribution[s.grade] || 0) + 1;
        riskDistribution[s.risk_level] = (riskDistribution[s.risk_level] || 0) + 1;
      });

      return { total, avgScore, gradeDistribution, riskDistribution };
    },
    staleTime: 10 * 60 * 1000,
  });
}
