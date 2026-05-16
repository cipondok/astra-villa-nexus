import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSearchKeywordAnalytics = (days: number = 30) => {
  return useQuery({
    queryKey: ['search-keyword-analytics', days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_search_keyword_analytics', { days_back: days });
      if (error) throw error;
      return (data || []) as Array<{
        search_query: string;
        search_count: number;
        avg_results: number;
        last_searched: string;
      }>;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useVisitorLocationAnalytics = (days: number = 30) => {
  return useQuery({
    queryKey: ['visitor-location-analytics', days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_visitor_location_analytics', { days_back: days });
      if (error) throw error;
      return (data || []) as Array<{
        country: string;
        city: string;
        visitor_count: number;
        page_views: number;
        avg_duration: number;
      }>;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const usePropertyViewsByLocation = (days: number = 30) => {
  return useQuery({
    queryKey: ['property-views-by-location', days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_property_views_by_location', { days_back: days });
      if (error) throw error;
      return (data || []) as Array<{
        page_path: string;
        country: string;
        city: string;
        view_count: number;
      }>;
    },
    staleTime: 2 * 60 * 1000,
  });
};
