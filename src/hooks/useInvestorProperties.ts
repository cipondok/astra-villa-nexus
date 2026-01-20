import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useInvestorProfile } from './useInvestorProfile';

export interface InvestorProperty {
  id: string;
  title: string;
  description: string | null;
  property_type: string | null;
  listing_type: string | null;
  price: number;
  location: string | null;
  city: string | null;
  state: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  thumbnail_url: string | null;
  image_urls: string[] | null;
  wna_eligible: boolean;
  is_featured: boolean;
  investor_highlight: boolean;
  created_at: string;
}

interface UseInvestorPropertiesOptions {
  limit?: number;
  onlyFeatured?: boolean;
  onlyWnaEligible?: boolean;
}

export const useInvestorProperties = (options: UseInvestorPropertiesOptions = {}) => {
  const { user } = useAuth();
  const { data: investorProfile, isLoading: profileLoading } = useInvestorProfile();
  
  const { limit = 6, onlyFeatured, onlyWnaEligible } = options;

  return useQuery({
    queryKey: ['investor-properties', user?.id, investorProfile?.investor_type, limit, onlyFeatured, onlyWnaEligible],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select(`
          id,
          title,
          description,
          property_type,
          listing_type,
          price,
          location,
          city,
          state,
          bedrooms,
          bathrooms,
          area_sqm,
          thumbnail_url,
          image_urls,
          wna_eligible,
          is_featured,
          investor_highlight,
          created_at
        `)
        .eq('status', 'active')
        .eq('approval_status', 'approved');

      // If user is WNA investor, prioritize WNA-eligible properties
      if (investorProfile?.investor_type === 'wna' || onlyWnaEligible) {
        query = query.eq('wna_eligible', true);
      }

      // Filter by featured if requested
      if (onlyFeatured) {
        query = query.eq('is_featured', true);
      }

      // Filter by investor preferences if available
      if (investorProfile?.preferred_locations && investorProfile.preferred_locations.length > 0) {
        // Use OR filter for preferred locations
        const locationFilters = investorProfile.preferred_locations
          .map(loc => `city.ilike.%${loc}%,state.ilike.%${loc}%,location.ilike.%${loc}%`)
          .join(',');
        // Note: This is a simplification - full implementation would use more complex filtering
      }

      // Filter by budget if available
      if (investorProfile?.investment_budget_min) {
        query = query.gte('price', investorProfile.investment_budget_min);
      }
      if (investorProfile?.investment_budget_max) {
        query = query.lte('price', investorProfile.investment_budget_max);
      }

      // Filter by preferred property types
      if (investorProfile?.preferred_property_types && investorProfile.preferred_property_types.length > 0) {
        query = query.in('property_type', investorProfile.preferred_property_types);
      }

      const { data, error } = await query
        .order('is_featured', { ascending: false })
        .order('investor_highlight', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching investor properties:', error);
        return [];
      }

      return (data || []) as InvestorProperty[];
    },
    enabled: !profileLoading,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useFeaturedInvestorProperties = (limit = 4) => {
  return useQuery({
    queryKey: ['featured-investor-properties', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          description,
          property_type,
          listing_type,
          price,
          location,
          city,
          state,
          bedrooms,
          bathrooms,
          area_sqm,
          thumbnail_url,
          image_urls,
          wna_eligible,
          is_featured,
          investor_highlight,
          created_at
        `)
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .or('is_featured.eq.true,investor_highlight.eq.true')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured properties:', error);
        return [];
      }

      return (data || []) as InvestorProperty[];
    },
    staleTime: 60 * 1000,
  });
};

export const useSavedInvestorProperties = (limit = 4) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved-investor-properties', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          property_id,
          properties (
            id,
            title,
            description,
            property_type,
            listing_type,
            price,
            location,
            city,
            state,
            bedrooms,
            bathrooms,
            area_sqm,
            thumbnail_url,
            image_urls,
            wna_eligible,
            is_featured,
            investor_highlight,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching saved properties:', error);
        return [];
      }

      // Extract properties from favorites
      return (data || [])
        .map(fav => fav.properties)
        .filter(Boolean) as InvestorProperty[];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
  });
};
