import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PortfolioProperty {
  id: string;
  title: string;
  price: number;
  city: string | null;
  state: string | null;
  location: string | null;
  property_type: string | null;
  listing_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  thumbnail_url: string | null;
  is_owned: boolean;
  investment_score: number;
  demand_heat_score: number;
  rental_yield: number;
  annual_growth_rate: number;
  projected_value_5y: number;
  roi_5y: number;
  risk_factor: number;
}

export interface PortfolioData {
  portfolio_value: number;
  projected_value_5y: number;
  average_roi: number;
  risk_level: 'low' | 'medium' | 'high' | 'unknown';
  avg_investment_score: number;
  total_properties: number;
  geo_concentration: boolean;
  type_concentration: boolean;
  unique_cities: string[];
  unique_types: string[];
  top_performer: { id: string; title: string; roi_5y: number } | null;
  weakest_performer: { id: string; title: string; roi_5y: number } | null;
  properties: PortfolioProperty[];
  generated_at: string;
}

export const usePortfolioManager = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['portfolio-manager', user?.id],
    queryFn: async (): Promise<PortfolioData> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'portfolio_manager', user_id: user?.id },
      });

      if (error) throw new Error(error.message);
      return data?.data;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
