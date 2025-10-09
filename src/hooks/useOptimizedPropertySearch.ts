import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

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
      
      const { data, error: searchError } = await supabase.rpc('search_properties_advanced', {
        p_search_text: debouncedSearchText || null,
        p_property_type: currentFilters.propertyType || null,
        p_listing_type: currentFilters.listingType || null,
        p_development_status: null,
        p_state: null,
        p_city: currentFilters.city || null,
        p_location: null,
        p_min_price: currentFilters.minPrice || null,
        p_max_price: currentFilters.maxPrice || null,
        p_min_bedrooms: currentFilters.minBedrooms || null,
        p_max_bedrooms: currentFilters.maxBedrooms || null,
        p_min_bathrooms: currentFilters.minBathrooms || null,
        p_max_bathrooms: currentFilters.maxBathrooms || null,
        p_min_area: currentFilters.minArea || null,
        p_max_area: currentFilters.maxArea || null,
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
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (searchError) {
        throw searchError;
      }

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