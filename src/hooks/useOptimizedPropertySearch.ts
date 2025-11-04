import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { logSearchError } from '@/utils/errorLogger';

interface SearchFilters {
  searchText?: string;
  propertyType?: string;
  listingType?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  amenities?: string[];
}

interface SearchResult {
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
  total_count: number;
}

interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  responseTime: number;
  cacheHit: boolean;
}

// Simple in-memory cache with TTL
class SearchCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxSize = 100;
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl: number = this.defaultTTL) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

const searchCache = new SearchCache();

export const useOptimizedPropertySearch = (initialFilters: SearchFilters = {}) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [responseTime, setResponseTime] = useState(0);
  const [cacheHit, setCacheHit] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { toast } = useToast();
  
  // Debounce search text to avoid excessive API calls
  const debouncedSearchText = useDebounce(filters.searchText || '', 300);

  // Generate cache key from filters
  const cacheKey = useMemo(() => {
    return JSON.stringify({ ...filters, searchText: debouncedSearchText, page, pageSize });
  }, [filters, debouncedSearchText, page, pageSize]);

  // Log search analytics
  const logSearchAnalytics = useCallback(async (
    searchQuery: string,
    searchFilters: SearchFilters,
    resultCount: number,
    responseTimeMs: number,
    cacheHit: boolean
  ) => {
    try {
      // Generate session ID if needed
      const sessionId = crypto.randomUUID();
      const visitorId = crypto.randomUUID();
      
      await supabase.from('search_analytics').insert({
        visitor_id: visitorId,
        session_id: sessionId,
        search_query: searchQuery,
        search_filters: searchFilters as any, // Cast to satisfy JSON type
        results_count: resultCount,
        response_time_ms: responseTimeMs,
        cache_hit: cacheHit
      });
    } catch (error) {
      console.error('Failed to log search analytics:', error);
    }
  }, []);

  // Optimized search function
  const performSearch = useCallback(async (currentFilters: SearchFilters, currentPage: number) => {
    const startTime = Date.now();
    
    // Check cache first
    const cached = searchCache.get(cacheKey);
    if (cached) {
      setResults(cached.results);
      setTotalCount(cached.totalCount);
      setCacheHit(true);
      setResponseTime(Date.now() - startTime);
      return;
    }

    setIsLoading(true);
    setError(null);
    setCacheHit(false);
    
    try {
      const offset = (currentPage - 1) * pageSize;

      // Sanitize all inputs to prevent RPC 500s from invalid types/NaN
      const safe = {
        searchText: debouncedSearchText && debouncedSearchText.trim() !== '' ? debouncedSearchText.trim() : null,
        propertyType: currentFilters.propertyType && currentFilters.propertyType !== 'all' ? currentFilters.propertyType : null,
        listingType: currentFilters.listingType && currentFilters.listingType !== 'all' ? currentFilters.listingType : null,
        city: currentFilters.city && currentFilters.city.trim() !== '' ? currentFilters.city.trim() : null,
        minPrice: (typeof currentFilters.minPrice === 'number' && Number.isFinite(currentFilters.minPrice) && currentFilters.minPrice > 0) ? currentFilters.minPrice : null,
        maxPrice: (typeof currentFilters.maxPrice === 'number' && Number.isFinite(currentFilters.maxPrice) && currentFilters.maxPrice > 0) ? currentFilters.maxPrice : null,
        minBedrooms: (typeof currentFilters.minBedrooms === 'number' && Number.isFinite(currentFilters.minBedrooms)) ? currentFilters.minBedrooms : null,
        maxBedrooms: (typeof currentFilters.maxBedrooms === 'number' && Number.isFinite(currentFilters.maxBedrooms)) ? currentFilters.maxBedrooms : null,
        minBathrooms: (typeof currentFilters.minBathrooms === 'number' && Number.isFinite(currentFilters.minBathrooms)) ? currentFilters.minBathrooms : null,
        maxBathrooms: (typeof currentFilters.maxBathrooms === 'number' && Number.isFinite(currentFilters.maxBathrooms)) ? currentFilters.maxBathrooms : null,
        minArea: (typeof currentFilters.minArea === 'number' && Number.isFinite(currentFilters.minArea)) ? currentFilters.minArea : null,
        maxArea: (typeof currentFilters.maxArea === 'number' && Number.isFinite(currentFilters.maxArea)) ? currentFilters.maxArea : null,
      };

      const payload = {
        p_search_text: safe.searchText,
        p_property_type: safe.propertyType,
        p_listing_type: safe.listingType,
        p_development_status: null,
        p_state: null,
        p_city: safe.city,
        p_location: null,
        p_min_price: safe.minPrice,
        p_max_price: safe.maxPrice,
        p_min_bedrooms: safe.minBedrooms,
        p_max_bedrooms: safe.maxBedrooms,
        p_min_bathrooms: safe.minBathrooms,
        p_max_bathrooms: safe.maxBathrooms,
        p_min_area: safe.minArea,
        p_max_area: safe.maxArea,
        p_furnishing: null,
        p_parking: null,
        p_floor_level: null,
        p_building_age: null,
        p_amenities: null,
        p_certifications: null,
        p_features: null,
        p_has_3d: null,
        p_has_virtual_tour: null,
        p_sort_by: 'newest',
        p_limit: pageSize,
        p_offset: offset
      };

      // Helpful when debugging
      console.log('search_properties_advanced payload', payload);
      
      let data: any[] = [];
      try {
        const res = await supabase.rpc('search_properties_advanced', payload);
        if (res.error) throw res.error;
        data = res.data || [];
      } catch (primaryError) {
        console.warn('Advanced search failed, attempting fallback to search_properties_optimized', primaryError);
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
          await logSearchError(fallbackRes.error, { primaryError, payload, fallbackPayload });
          throw fallbackRes.error;
        }
        data = fallbackRes.data || [];
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      const searchResults = data || [];
      const total = searchResults.length > 0 ? Number(searchResults[0].total_count) : 0;

      setResults(searchResults);
      setTotalCount(total);
      setResponseTime(duration);

      // Cache successful results
      searchCache.set(cacheKey, {
        results: searchResults,
        totalCount: total
      });

      // Log analytics
      await logSearchAnalytics(
        debouncedSearchText || '',
        currentFilters,
        total,
        duration,
        false
      );

      // Show performance warning if search is slow
      if (duration > 2000) {
        toast({
          title: "Search Performance",
          description: `Search took ${(duration / 1000).toFixed(1)}s. Consider refining your filters for faster results.`,
          variant: "default",
        });
      }

    } catch (err: any) {
      const duration = Date.now() - startTime;
      setError(err.message || 'Search failed');
      setResults([]);
      setTotalCount(0);
      setResponseTime(duration);
      
      console.error('Property search failed:', err);
      // Log error to admin panel
      await logSearchError(err, { filters: currentFilters, page: currentPage, pageSize });
      
      if (duration > 5000) {
        toast({
          title: "Search Timeout",
          description: "Search is taking longer than expected. Please try refining your search criteria.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, debouncedSearchText, pageSize, logSearchAnalytics, toast]);

  // Auto-search when filters change
  useEffect(() => {
    performSearch(filters, 1);
    setPage(1);
  }, [filters, debouncedSearchText]);

  // Search suggestions (autocomplete)
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const { data: cityData } = await supabase
        .from('properties')
        .select('city')
        .ilike('city', `%${query}%`)
        .limit(5);

      const { data: areaData } = await supabase
        .from('properties')
        .select('area')
        .ilike('area', `%${query}%`)
        .limit(5);

      const cities = cityData?.map(item => item.city).filter(Boolean) || [];
      const areas = areaData?.map(item => item.area).filter(Boolean) || [];
      
      const uniqueSuggestions = [...new Set([...cities, ...areas])];
      setSuggestions(uniqueSuggestions.slice(0, 8));
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Pagination controls
  const goToPage = useCallback((newPage: number) => {
    const totalPages = Math.ceil(totalCount / pageSize);
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      performSearch(filters, newPage);
    }
  }, [totalCount, pageSize, filters, performSearch]);

  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [page, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(page - 1);
  }, [page, goToPage]);

  // Clear cache
  const clearCache = useCallback(() => {
    searchCache.clear();
    toast({
      title: "Cache Cleared",
      description: "Search cache has been cleared for fresh results.",
    });
  }, [toast]);

  // Search response object
  const searchResponse: SearchResponse = {
    results,
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / pageSize),
    isLoading,
    error,
    responseTime,
    cacheHit
  };

  return {
    // Search state
    searchResponse,
    filters,
    suggestions,
    
    // Actions
    updateFilters,
    performSearch: () => performSearch(filters, page),
    fetchSuggestions,
    clearCache,
    
    // Pagination
    goToPage,
    nextPage,
    prevPage,
    
    // Utilities
    hasNextPage: page < Math.ceil(totalCount / pageSize),
    hasPrevPage: page > 1,
    pageSize
  };
};