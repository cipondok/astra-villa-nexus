
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BaseProperty } from '@/types/property';
import { logSearchError } from '@/utils/errorLogger';
import { trackSearch } from '@/hooks/useSearchTracking';

interface SearchFilters {
  query?: string;
  propertyType?: string;
  listingType?: string;
  priceRange?: [number, number];
  bedrooms?: string;
  bathrooms?: string;
  areaRange?: [number, number];
  location?: string;
  state?: string;
  city?: string;
  developmentStatus?: string;
  features?: string[];
  amenities?: string[];
  furnishing?: string;
  parking?: string;
  floorLevel?: string;
  buildingAge?: string;
  certification?: string[];
  has3D?: boolean;
  hasVirtualTour?: boolean;
  sortBy?: string;
}

export const usePropertySearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const {
    data: searchResults,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['property-search', filters, page],
    queryFn: async () => {
      const startTime = performance.now();
      const offset = (page - 1) * pageSize;
      
      const payload = {
        p_search_text: (filters.query && filters.query.trim() !== '') ? filters.query : null,
        p_property_type: (filters.propertyType && filters.propertyType !== 'all') ? filters.propertyType : null,
        p_listing_type: (filters.listingType && filters.listingType !== 'all') ? filters.listingType : null,
        p_development_status: (filters.developmentStatus && filters.developmentStatus !== 'all') ? filters.developmentStatus : null,
        p_state: (filters.state && filters.state !== 'all') ? filters.state : null,
        p_city: (filters.city && filters.city !== 'all') ? filters.city : null,
        p_location: (filters.location && filters.location !== 'all') ? filters.location : null,
        p_min_price: filters.priceRange?.[0] && filters.priceRange[0] > 0 ? filters.priceRange[0] : null,
        p_max_price: filters.priceRange?.[1] && filters.priceRange[1] < 20000000000 ? filters.priceRange[1] : null,
        p_min_bedrooms: (() => {
          const v = filters.bedrooms;
          if (!v || v === 'all' || v === '') return null;
          const n = parseInt(String(v).replace(/[^0-9]/g, ''), 10);
          return Number.isNaN(n) ? null : n;
        })(),
        p_max_bedrooms: null,
        p_min_bathrooms: (() => {
          const v = filters.bathrooms;
          if (!v || v === 'all' || v === '') return null;
          const n = parseInt(String(v).replace(/[^0-9]/g, ''), 10);
          return Number.isNaN(n) ? null : n;
        })(),
        p_max_bathrooms: null,
        p_min_area: filters.areaRange?.[0] && filters.areaRange[0] > 0 ? filters.areaRange[0] : null,
        p_max_area: filters.areaRange?.[1] && filters.areaRange[1] < 2000 ? filters.areaRange[1] : null,
        p_furnishing: (filters.furnishing && filters.furnishing !== 'all') ? filters.furnishing : null,
        p_parking: (filters.parking && filters.parking !== 'all') ? filters.parking : null,
        p_floor_level: (filters.floorLevel && filters.floorLevel !== 'all') ? filters.floorLevel : null,
        p_building_age: (filters.buildingAge && filters.buildingAge !== 'all') ? filters.buildingAge : null,
        p_amenities: (filters.amenities && filters.amenities.length > 0) ? filters.amenities : null,
        p_certifications: (filters.certification && filters.certification.length > 0) ? filters.certification : null,
        p_features: (filters.features && filters.features.length > 0) ? filters.features : null,
        p_has_3d: typeof filters.has3D === 'boolean' ? filters.has3D : null,
        p_has_virtual_tour: typeof filters.hasVirtualTour === 'boolean' ? filters.hasVirtualTour : null,
        p_sort_by: filters.sortBy || 'newest',
        p_limit: pageSize,
        p_offset: offset
      } as const;

      let data: any[] = [];
      try {
        const res = await supabase.rpc('search_properties_advanced', payload);
        if (res.error) throw res.error;
        data = res.data || [];
      } catch (primaryError) {
        const fallbackPayload = {
          p_search_text: payload.p_search_text,
          p_property_type: payload.p_property_type,
          p_listing_type: payload.p_listing_type,
          p_city: payload.p_city,
          p_min_price: payload.p_min_price,
          p_max_price: payload.p_max_price,
          p_min_bedrooms: payload.p_min_bedrooms,
          p_max_bedrooms: payload.p_max_bedrooms,
          p_min_bathrooms: payload.p_min_bathrooms,
          p_max_bathrooms: payload.p_max_bathrooms,
          p_min_area: payload.p_min_area,
          p_max_area: payload.p_max_area,
          p_limit: payload.p_limit,
          p_offset: payload.p_offset
        };
        const fallbackRes = await supabase.rpc('search_properties_optimized', fallbackPayload);
        if (fallbackRes.error) {
          // Log both errors and attempt a final safe client-side query to avoid 500 page
          await logSearchError(fallbackRes.error, { primaryError, payload, fallbackPayload });
          console.warn('Both advanced and optimized searches failed. Falling back to basic query.');

          // Final fallback: direct table query (safe subset of filters)
          try {
            let query = supabase
              .from('properties')
              .select(
                'id, title, property_type, listing_type, price, location, bedrooms, bathrooms, area_sqm, images, thumbnail_url, state, city, development_status, description, three_d_model_url, virtual_tour_url',
                { count: 'exact' }
              )
              .eq('status', 'active')
              .eq('approval_status', 'approved');

            if (payload.p_search_text) {
              const term = String(payload.p_search_text).replace(/[(),;%]/g, ' ').trim().slice(0, 100);
              if (term) {
                query = query.or(
                  `title.ilike.%${term}%,location.ilike.%${term}%,city.ilike.%${term}%,state.ilike.%${term}%`
                );
              }
            }
            if (payload.p_city) query = query.ilike('city', `%${payload.p_city}%`);
            if (payload.p_property_type) query = query.eq('property_type', payload.p_property_type);
            if (payload.p_listing_type) query = query.eq('listing_type', payload.p_listing_type);
            if (payload.p_min_price) query = query.gte('price', payload.p_min_price);
            if (payload.p_max_price) query = query.lte('price', payload.p_max_price);
            if (payload.p_min_bedrooms) query = query.gte('bedrooms', payload.p_min_bedrooms);
            if (payload.p_min_bathrooms) query = query.gte('bathrooms', payload.p_min_bathrooms);
            if (payload.p_min_area) query = query.gte('area_sqm', payload.p_min_area);
            if (payload.p_max_area) query = query.lte('area_sqm', payload.p_max_area);

            // Pagination
            const from = offset;
            const to = offset + pageSize - 1;
            const { data: basicData, error: basicError, count } = await query
              .order('created_at', { ascending: false })
              .range(from, to);

            if (basicError) throw basicError;

            const mapped = (basicData || []).map((p: any) => ({
              ...p,
              listing_type: p.listing_type as 'sale' | 'rent' | 'lease',
              image_urls: p.images || []
            }));

            // Ensure total_count is present for downstream pagination logic
            if (mapped.length > 0) {
              (mapped[0] as any).total_count = count ?? mapped.length;
            }

            data = mapped;
          } catch (basicError) {
            await logSearchError(basicError, { note: 'basic_query_failed', payload });
            throw basicError;
          }
        } else {
          data = fallbackRes.data || [];
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Track search analytics (non-blocking)
      trackSearch({
        search_query: filters.query || null,
        search_filters: {
          property_type: filters.propertyType,
          listing_type: filters.listingType,
          city: filters.city,
          state: filters.state,
          price_range: filters.priceRange,
          bedrooms: filters.bedrooms,
          bathrooms: filters.bathrooms,
          area_range: filters.areaRange
        },
        results_count: data?.length || 0,
        response_time_ms: Math.round(duration),
        cache_hit: false
      }).catch(() => {}); // Silently ignore tracking errors
      
      // Log slow queries for monitoring
      if (duration > 1000) {
        console.warn(`Slow property search: ${duration.toFixed(0)}ms`, {
          filters,
          page,
          resultCount: data?.length || 0
        });
      } else {
        console.log(`Property search completed in ${duration.toFixed(0)}ms`);
      }
      
      if (error) {
        await logSearchError(error, { filters, page, pageSize });
        throw error;
      }
      
      const results = data || [];
      const total = results.length > 0 ? Number(results[0].total_count) : 0;
      setTotalCount(total);
      
      return results as BaseProperty[];
    },
    enabled: Object.keys(filters).length > 0 || searchQuery.length > 0,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  const searchProperties = useCallback((searchFilters: SearchFilters) => {
    setFilters(searchFilters);
    setSearchQuery(searchFilters.query || '');
    setPage(1); // Reset to first page on new search
  }, []);

  const clearSearch = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
    setTotalCount(0);
  }, []);

  const goToPage = useCallback((newPage: number) => {
    const totalPages = Math.ceil(totalCount / pageSize);
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalCount, pageSize]);

  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [page, goToPage]);

  const previousPage = useCallback(() => {
    goToPage(page - 1);
  }, [page, goToPage]);

  return {
    searchResults: searchResults || [],
    isLoading,
    error,
    searchProperties,
    clearSearch,
    filters,
    refetch,
    // Pagination
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    goToPage,
    nextPage,
    previousPage,
    hasNextPage: page < Math.ceil(totalCount / pageSize),
    hasPreviousPage: page > 1,
  };
};
