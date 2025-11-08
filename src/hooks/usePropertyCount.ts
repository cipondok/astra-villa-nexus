import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PropertyFilters } from "@/components/search/AdvancedPropertyFilters";

export const usePropertyCount = (filters: PropertyFilters) => {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .eq('approval_status', 'approved');

        // Apply filters
        if (filters.searchQuery) {
          query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
        }

        if (filters.location && filters.location !== 'all') {
          query = query.eq('city', filters.location);
        }

        if (filters.propertyTypes.length > 0) {
          query = query.in('property_type', filters.propertyTypes);
        }

        if (filters.listingType && filters.listingType !== 'all') {
          query = query.eq('listing_type', filters.listingType);
        }

        if (filters.bedrooms) {
          query = query.gte('bedrooms', parseInt(filters.bedrooms));
        }

        if (filters.bathrooms) {
          query = query.gte('bathrooms', parseInt(filters.bathrooms));
        }

        if (filters.priceRange) {
          query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);
        }

        if (filters.minArea) {
          query = query.gte('area', filters.minArea);
        }

        if (filters.maxArea) {
          query = query.lte('area', filters.maxArea);
        }

        const { count: resultCount } = await query;
        setCount(resultCount || 0);
      } catch (error) {
        console.error('Error fetching property count:', error);
        setCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the count fetch
    const timer = setTimeout(() => {
      fetchCount();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  return { count, isLoading };
};
