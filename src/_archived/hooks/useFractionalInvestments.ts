import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateFractionalModel, type InvestorDemand } from './useFractionalModel';

export interface FractionalListing {
  id: string;
  property_id: string;
  title: string;
  location: string;
  thumbnail_url: string | null;
  property_value: number;
  min_investment: number;
  total_tokens: number;
  tokens_sold: number;
  token_price: number;
  yield_pct: number;
  appreciation_forecast_pct: number;
  investor_demand: InvestorDemand;
  fractional_structure: string;
  liquidity_model: string;
  innovation_summary: string;
  projected_annual_return_per_token: number;
  status: 'open' | 'funding' | 'funded' | 'closed';
}

export interface PortfolioHolding {
  listing_id: string;
  title: string;
  tokens_held: number;
  token_price: number;
  yield_pct: number;
  projected_monthly_income: number;
  total_invested: number;
  current_value: number;
  gain_pct: number;
}

// Generate mock fractional listings from real properties
const generateListings = (properties: any[]): FractionalListing[] => {
  const demands: InvestorDemand[] = ['very_high', 'high', 'moderate', 'low'];
  const yields = [5.2, 6.8, 7.5, 4.5, 8.1, 5.9, 6.2, 7.8];
  const appreciations = [8.5, 12.3, 6.7, 15.2, 9.8, 11.4, 7.2, 10.5];
  const soldPcts = [0.85, 0.42, 0.67, 0.93, 0.28, 0.55, 0.71, 0.38];
  const statuses: FractionalListing['status'][] = ['funding', 'open', 'funding', 'funded', 'open', 'funding', 'open', 'open'];

  return properties.slice(0, 8).map((p, i) => {
    const yieldPct = yields[i % yields.length];
    const demand = demands[i % demands.length];
    const value = p.price || 2_000_000_000;
    const model = generateFractionalModel({ property_value: value, investor_demand: demand, yield_pct: yieldPct });
    const soldPct = soldPcts[i % soldPcts.length];

    return {
      id: `frac-${p.id}`,
      property_id: p.id,
      title: p.title || `Premium Property ${i + 1}`,
      location: p.location || p.city || 'Jakarta',
      thumbnail_url: p.thumbnail_url || (p.image_urls?.[0]) || null,
      property_value: value,
      min_investment: model.token_price,
      total_tokens: model.total_tokens,
      tokens_sold: Math.round(model.total_tokens * soldPct),
      token_price: model.token_price,
      yield_pct: yieldPct,
      appreciation_forecast_pct: appreciations[i % appreciations.length],
      investor_demand: demand,
      fractional_structure: model.fractional_structure,
      liquidity_model: model.liquidity_model,
      innovation_summary: model.innovation_summary,
      projected_annual_return_per_token: model.projected_annual_return_per_token,
      status: statuses[i % statuses.length],
    };
  });
};

export function useFractionalInvestments() {
  return useQuery({
    queryKey: ['fractional-investments'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('id, title, location, city, price, thumbnail_url, image_urls')
        .order('price', { ascending: false })
        .limit(8);
      return generateListings(data || []);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFractionalPortfolio() {
  return useQuery({
    queryKey: ['fractional-portfolio'],
    queryFn: async (): Promise<PortfolioHolding[]> => {
      // Conceptual portfolio data
      return [
        {
          listing_id: 'frac-1',
          title: 'Luxury Villa Seminyak',
          tokens_held: 5,
          token_price: 5_000_000,
          yield_pct: 6.8,
          projected_monthly_income: 283_333,
          total_invested: 25_000_000,
          current_value: 27_500_000,
          gain_pct: 10.0,
        },
        {
          listing_id: 'frac-2',
          title: 'Jakarta CBD Apartment',
          tokens_held: 10,
          token_price: 10_000_000,
          yield_pct: 5.2,
          projected_monthly_income: 433_333,
          total_invested: 100_000_000,
          current_value: 108_000_000,
          gain_pct: 8.0,
        },
        {
          listing_id: 'frac-3',
          title: 'Bali Beachfront Resort',
          tokens_held: 2,
          token_price: 25_000_000,
          yield_pct: 7.5,
          projected_monthly_income: 312_500,
          total_invested: 50_000_000,
          current_value: 56_000_000,
          gain_pct: 12.0,
        },
      ];
    },
    staleTime: 5 * 60 * 1000,
  });
}
