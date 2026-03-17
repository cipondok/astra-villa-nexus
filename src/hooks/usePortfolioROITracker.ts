import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PropertyROIAnalytics {
  id: string;
  title: string;
  city: string | null;
  property_type: string | null;
  purchase_price: number;
  current_value: number;
  capital_gain: number;
  capital_gain_pct: number;
  monthly_rent_estimate: number;
  annual_rental_income: number;
  rental_yield_pct: number;
  appreciation_forecast: number;
  opportunity_score: number;
  opportunity_trend: 'rising' | 'stable' | 'declining';
  risk_class: 'conservative' | 'moderate' | 'aggressive' | 'speculative';
  risk_score: number;
  roi_5y_pct: number;
  is_owned: boolean;
  thumbnail_url: string | null;
}

export interface PortfolioROIOverview {
  total_portfolio_value: number;
  total_invested_capital: number;
  unrealized_gain_loss: number;
  unrealized_pct: number;
  projected_annual_roi: number;
  avg_rental_yield: number;
  avg_5y_roi: number;
  total_properties: number;
  owned_properties: number;
  market_avg_growth: number;
  market_avg_score: number;
}

export interface AllocationData {
  by_city: { name: string; value: number }[];
  by_type: { name: string; value: number }[];
  risk_distribution: { name: string; count: number }[];
}

export interface GrowthPoint {
  month: number;
  portfolio_value: number;
  market_benchmark: number;
}

export interface SellSimulation {
  property: { id: string; title: string; price: number; city: string };
  sell_price: number;
  gross_profit: number;
  tax_pph: number;
  notary_fee: number;
  agent_commission: number;
  total_costs: number;
  net_profit: number;
  net_roi_pct: number;
}

export function usePortfolioROITracker() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['portfolio-roi-tracker', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('portfolio-roi-tracker', {
        body: { mode: 'dashboard', user_id: user?.id },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data as {
        overview: PortfolioROIOverview;
        properties: PropertyROIAnalytics[];
        allocations: AllocationData;
        growth_timeline: GrowthPoint[];
      };
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useSellSimulation() {
  return useMutation({
    mutationFn: async ({ property_id, sell_price }: { property_id: string; sell_price: number }) => {
      const { data, error } = await supabase.functions.invoke('portfolio-roi-tracker', {
        body: { mode: 'simulate_sell', property_id, sell_price },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data as SellSimulation;
    },
  });
}
