import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════
// INSTITUTIONAL PORTFOLIO INTELLIGENCE ENGINE
// Aggregates cross-market exposure, pipeline, and macro data
// ═══════════════════════════════════════════════════════════

export interface GeoExposure {
  province: string;
  city: string;
  listing_count: number;
  total_value: number;
  avg_price: number;
  avg_investment_score: number;
  avg_heat_score: number;
  asset_types: string[];
  weight_pct: number;
}

export interface AssetClassBreakdown {
  asset_class: string;
  count: number;
  total_value: number;
  avg_roi: number;
  avg_yield: number;
  weight_pct: number;
}

export interface PipelineCandidate {
  id: string;
  title: string;
  city: string;
  province: string;
  property_type: string;
  price: number;
  investment_score: number;
  demand_heat_score: number;
  rental_yield_est: number;
  risk_adjusted_return: number;
  opportunity_grade: 'A+' | 'A' | 'B+' | 'B' | 'C';
  thumbnail_url: string | null;
}

export interface CityOutlook {
  city: string;
  province: string;
  total_listings: number;
  avg_price: number;
  avg_investment_score: number;
  avg_heat_score: number;
  yoy_price_growth: number;
  momentum: 'ACCELERATING' | 'STABLE' | 'DECELERATING';
  risk_level: 'LOW' | 'MODERATE' | 'HIGH';
  top_asset_type: string;
  outlook_summary: string;
}

export interface InstitutionalData {
  geo_exposure: GeoExposure[];
  asset_classes: AssetClassBreakdown[];
  pipeline: PipelineCandidate[];
  city_outlooks: CityOutlook[];
  totals: {
    total_market_value: number;
    total_listings: number;
    avg_investment_score: number;
    avg_heat: number;
    unique_cities: number;
    unique_provinces: number;
  };
}

// ── Grade calculator ──
function gradeFromScore(score: number): PipelineCandidate['opportunity_grade'] {
  if (score >= 85) return 'A+';
  if (score >= 70) return 'A';
  if (score >= 55) return 'B+';
  if (score >= 40) return 'B';
  return 'C';
}

function momentum(heat: number, score: number): CityOutlook['momentum'] {
  const composite = heat * 0.6 + score * 0.4;
  if (composite >= 70) return 'ACCELERATING';
  if (composite >= 40) return 'STABLE';
  return 'DECELERATING';
}

function riskFromHeat(heat: number): CityOutlook['risk_level'] {
  if (heat >= 75) return 'LOW';
  if (heat >= 40) return 'MODERATE';
  return 'HIGH';
}

function generateOutlook(city: string, avgScore: number, heat: number, growth: number): string {
  if (avgScore >= 75 && heat >= 70) return `${city} presents strong institutional-grade opportunity with high demand velocity and above-market fundamentals. Recommend overweight allocation.`;
  if (avgScore >= 55) return `${city} shows stable market dynamics with moderate growth potential. Suitable for diversified exposure with medium-term hold strategy.`;
  return `${city} is in early-stage development with emerging demand signals. Consider selective entry on high-score individual assets only.`;
}

export function useInstitutionalPortfolio() {
  return useQuery({
    queryKey: ['institutional-portfolio-intelligence'],
    queryFn: async (): Promise<InstitutionalData> => {
      // Fetch properties with investment intelligence
      const { data: properties, error } = await supabase
        .from('properties')
        .select('id, title, city, state, property_type, price, investment_score, demand_heat_score, thumbnail_url, listing_type')
        .eq('status', 'active')
        .not('investment_score', 'is', null)
        .order('investment_score', { ascending: false })
        .limit(500);

      if (error) throw error;
      const props = properties || [];

      const totalValue = props.reduce((s, p) => s + (p.price || 0), 0);

      // ── Geographic Exposure ──
      const cityMap = new Map<string, { province: string; listings: typeof props }>();
      for (const p of props) {
        const key = p.city || 'Unknown';
        if (!cityMap.has(key)) cityMap.set(key, { province: p.state || 'Unknown', listings: [] });
        cityMap.get(key)!.listings.push(p);
      }

      const geo_exposure: GeoExposure[] = Array.from(cityMap.entries()).map(([city, { province, listings }]) => {
        const cityValue = listings.reduce((s, p) => s + (p.price || 0), 0);
        return {
          province,
          city,
          listing_count: listings.length,
          total_value: cityValue,
          avg_price: Math.round(cityValue / listings.length),
          avg_investment_score: Math.round(listings.reduce((s, p) => s + (p.investment_score || 0), 0) / listings.length),
          avg_heat_score: Math.round(listings.reduce((s, p) => s + (p.demand_heat_score || 0), 0) / listings.length),
          asset_types: [...new Set(listings.map(p => p.property_type || 'Other'))],
          weight_pct: totalValue > 0 ? Math.round((cityValue / totalValue) * 1000) / 10 : 0,
        };
      }).sort((a, b) => b.total_value - a.total_value);

      // ── Asset Class Breakdown ──
      const typeMap = new Map<string, typeof props>();
      for (const p of props) {
        const key = p.property_type || 'Other';
        if (!typeMap.has(key)) typeMap.set(key, []);
        typeMap.get(key)!.push(p);
      }

      const asset_classes: AssetClassBreakdown[] = Array.from(typeMap.entries()).map(([cls, listings]) => {
        const clsValue = listings.reduce((s, p) => s + (p.price || 0), 0);
        const avgScore = listings.reduce((s, p) => s + (p.investment_score || 0), 0) / listings.length;
        return {
          asset_class: cls,
          count: listings.length,
          total_value: clsValue,
          avg_roi: Math.round(avgScore * 0.12 * 10) / 10, // estimated from score
          avg_yield: Math.round(avgScore * 0.08 * 10) / 10,
          weight_pct: totalValue > 0 ? Math.round((clsValue / totalValue) * 1000) / 10 : 0,
        };
      }).sort((a, b) => b.total_value - a.total_value);

      // ── Pipeline Candidates (top 30 by score) ──
      const pipeline: PipelineCandidate[] = props.slice(0, 30).map(p => {
        const score = p.investment_score || 0;
        const heat = p.demand_heat_score || 0;
        const yieldEst = score * 0.08;
        const riskAdj = yieldEst * (1 - (100 - heat) / 200); // penalize low heat
        return {
          id: p.id,
          title: p.title,
          city: p.city || 'Unknown',
          province: p.state || '',
          property_type: p.property_type || 'Other',
          price: p.price || 0,
          investment_score: score,
          demand_heat_score: heat,
          rental_yield_est: Math.round(yieldEst * 10) / 10,
          risk_adjusted_return: Math.round(riskAdj * 10) / 10,
          opportunity_grade: gradeFromScore(score),
          thumbnail_url: p.thumbnail_url,
        };
      });

      // ── City Outlooks ──
      const city_outlooks: CityOutlook[] = geo_exposure.slice(0, 15).map(g => {
        const growth = Math.round((g.avg_heat_score * 0.15 - 2) * 10) / 10;
        return {
          city: g.city,
          province: g.province,
          total_listings: g.listing_count,
          avg_price: g.avg_price,
          avg_investment_score: g.avg_investment_score,
          avg_heat_score: g.avg_heat_score,
          yoy_price_growth: growth,
          momentum: momentum(g.avg_heat_score, g.avg_investment_score),
          risk_level: riskFromHeat(g.avg_heat_score),
          top_asset_type: g.asset_types[0] || 'Mixed',
          outlook_summary: generateOutlook(g.city, g.avg_investment_score, g.avg_heat_score, growth),
        };
      });

      const uniqueProvinces = new Set(props.map(p => p.state).filter(Boolean));

      return {
        geo_exposure,
        asset_classes,
        pipeline,
        city_outlooks,
        totals: {
          total_market_value: totalValue,
          total_listings: props.length,
          avg_investment_score: Math.round(props.reduce((s, p) => s + (p.investment_score || 0), 0) / (props.length || 1)),
          avg_heat: Math.round(props.reduce((s, p) => s + (p.demand_heat_score || 0), 0) / (props.length || 1)),
          unique_cities: cityMap.size,
          unique_provinces: uniqueProvinces.size,
        },
      };
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}
