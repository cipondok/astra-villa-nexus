import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TrendingCity {
  city: string;
  property_count: number;
  avg_investment_score: number;
  avg_demand_heat: number;
  avg_price: number;
  interaction_count: number;
  trend_score: number;
  property_types: string[];
}

export interface InvestorHotspot {
  city: string;
  investment_rating: string;
  demand_level: string;
  avg_investment_score: number;
  avg_demand_heat: number;
  property_count: number;
}

export interface PopularPropertyType {
  type: string;
  listing_count: number;
  view_count: number;
  save_count: number;
  avg_price: number;
  popularity_score: number;
}

export interface KnowledgeNetworkResult {
  trending_cities: TrendingCity[];
  investor_hotspots: InvestorHotspot[];
  popular_property_types: PopularPropertyType[];
  graph_stats: {
    total_edges: number;
    edges_updated: number;
    total_properties: number;
    active_users_30d: number;
    unique_cities: number;
  };
  generated_at: string;
}

export const useKnowledgeNetwork = () => {
  return useQuery({
    queryKey: ['knowledge-network'],
    queryFn: async (): Promise<KnowledgeNetworkResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'knowledge_network' },
      });
      if (error) throw new Error(error.message);
      return data?.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
