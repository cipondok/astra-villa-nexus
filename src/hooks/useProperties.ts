
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProperties = (options?: {
  limit?: number;
  status?: string;
  searchTerm?: string;
  propertyType?: string;
}) => {
  const { limit = 20, status = 'active', searchTerm, propertyType } = options || {};

  return useQuery({
    queryKey: ['properties', limit, status, searchTerm, propertyType],
    queryFn: async () => {
      console.log('Fetching properties with optimized query...');
      
      let query = supabase
        .from('properties')
        .select(`
          id,
          title,
          description,
          price,
          location,
          city,
          state,
          property_type,
          listing_type,
          bedrooms,
          bathrooms,
          area_sqm,
          status,
          image_urls,
          thumbnail_url,
          created_at,
          owner_id
        `)
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply filters only if provided
      if (searchTerm?.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
      }

      if (propertyType && propertyType !== 'all') {
        query = query.eq('property_type', propertyType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Properties fetch error:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} properties successfully`);
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const usePropertyById = (propertyId: string | null) => {
  return useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      
      console.log('Fetching single property:', propertyId);
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:profiles!properties_owner_id_fkey(
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('id', propertyId)
        .single();

      if (error) {
        console.error('Property fetch error:', error);
        throw error;
      }

      return data;
    },
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
  });
};
