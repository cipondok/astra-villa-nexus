import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Types for secure property data
export interface SecureProperty {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: string;
  listing_type: string;
  location: string;
  city: string;
  area: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  images: string[];
  image_urls: string[];
  status: string;
  created_at: string;
  development_status: string;
  thumbnail_url: string;
  virtual_tour_url: string;
  total_count: number;
  can_view_contact_info: boolean;
  can_view_owner_info: boolean;
}

export interface PropertyDetails extends Omit<SecureProperty, 'total_count' | 'can_view_contact_info' | 'can_view_owner_info'> {
  property_features: any;
  three_d_model_url: string;
  rental_periods: string[];
  minimum_rental_days: number;
  updated_at: string;
  owner_contact_info: any;
  agent_contact_info: any;
  can_view_contact_info: boolean;
  access_level: string;
}

export interface PropertySearchFilters {
  search?: string;
  property_type?: string;
  listing_type?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
  limit?: number;
  offset?: number;
}

// Hook for secure property listings
export const useSecureProperties = (filters: PropertySearchFilters = {}) => {
  return useQuery({
    queryKey: ['secure-properties', filters],
    queryFn: async (): Promise<SecureProperty[]> => {
      const { data, error } = await supabase.rpc('get_public_property_listings_secure', {
        p_limit: filters.limit || 20,
        p_offset: filters.offset || 0,
        p_search: filters.search || null,
        p_property_type: filters.property_type || null,
        p_listing_type: filters.listing_type || null,
        p_city: filters.city || null,
        p_min_price: filters.min_price || null,
        p_max_price: filters.max_price || null,
        p_require_auth: true
      });

      if (error) {
        console.error('Error fetching secure properties:', error);
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: true, // Always enabled since the function handles authentication
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for property details
export const usePropertyDetails = (propertyId: string) => {
  return useQuery({
    queryKey: ['property-details', propertyId],
    queryFn: async (): Promise<any> => {
      if (!propertyId) return null;

      const { data, error } = await supabase.rpc('get_property_details_secure', {
        p_property_id: propertyId
      });

      if (error) {
        console.error('Error fetching property details:', error);
        throw new Error(error.message);
      }

      return data?.[0] || null;
    },
    enabled: !!propertyId,
    staleTime: 3 * 60 * 1000, // Cache for 3 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for property statistics (admin only)
export const usePropertyStatistics = () => {
  return useQuery({
    queryKey: ['property-statistics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_property_statistics_secure');

      if (error) {
        console.error('Error fetching property statistics:', error);
        throw new Error(error.message);
      }

      return data;
    },
    enabled: true, // Function handles access control
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for property search with debouncing
export const usePropertySearch = (searchTerm: string, delay = 300) => {
  return useQuery({
    queryKey: ['property-search', searchTerm],
    queryFn: async (): Promise<SecureProperty[]> => {
      if (!searchTerm || searchTerm.length < 2) return [];

      const { data, error } = await supabase.rpc('get_public_property_listings_secure', {
        p_search: searchTerm,
        p_limit: 10,
        p_offset: 0,
        p_require_auth: true
      });

      if (error) {
        console.error('Error searching properties:', error);
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: searchTerm.length >= 2,
    staleTime: 30 * 1000, // Cache search results for 30 seconds
    refetchOnWindowFocus: false,
  });
};

// Hook for creating/updating properties (authenticated users only)
export const usePropertyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyData: any) => {
      const { data, error } = await supabase
        .from('properties')
        .insert(propertyData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate property queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['secure-properties'] });
      queryClient.invalidateQueries({ queryKey: ['property-statistics'] });
    },
  });
};

// Hook for updating property status (owners/agents/admins only)
export const usePropertyStatusUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('properties')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['secure-properties'] });
      queryClient.invalidateQueries({ queryKey: ['property-details', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['property-statistics'] });
    },
  });
};

// Hook for my properties (owners/agents)
export const useMyProperties = () => {
  return useQuery({
    queryKey: ['my-properties'],
    queryFn: async (): Promise<any[]> => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      // Use the existing secure function but filter for user's properties
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id, title, description, price, property_type, listing_type,
          location, city, area, state, bedrooms, bathrooms, area_sqm,
          images, image_urls, status, created_at, development_status,
          thumbnail_url, virtual_tour_url
        `)
        .or(`owner_id.eq.${user.id},agent_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my properties:', error);
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: true,
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};