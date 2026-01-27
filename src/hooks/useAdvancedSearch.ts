/**
 * Advanced Search Hook with Typesense-like features
 * - Faceted filtering
 * - Geo-search
 * - Autocomplete with typo tolerance
 * - Real-time search suggestions
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import searchService, { 
  AdvancedSearchParams, 
  SearchResult, 
  SearchFacet, 
  PropertyHit,
  GeoSearchParams 
} from '@/services/search/TypesenseSearchService';

export interface UseAdvancedSearchOptions {
  initialQuery?: string;
  initialFilters?: Record<string, any>;
  perPage?: number;
  facetFields?: string[];
  enableAutocomplete?: boolean;
  enableGeoSearch?: boolean;
  defaultLocation?: GeoSearchParams;
}

export interface SearchState {
  query: string;
  filters: Record<string, any>;
  page: number;
  sortBy: string;
  geoSearch?: GeoSearchParams;
}

export function useAdvancedSearch(options: UseAdvancedSearchOptions = {}) {
  const {
    initialQuery = '',
    initialFilters = {},
    perPage = 20,
    facetFields = ['property_type', 'listing_type', 'city', 'bedrooms'],
    enableAutocomplete = true,
    enableGeoSearch = false,
    defaultLocation
  } = options;

  const queryClient = useQueryClient();
  
  const [searchState, setSearchState] = useState<SearchState>({
    query: initialQuery,
    filters: initialFilters,
    page: 1,
    sortBy: 'created_at:desc',
    geoSearch: defaultLocation
  });

  const [autocompleteQuery, setAutocompleteQuery] = useState('');
  const debouncedAutocomplete = useDebounce(autocompleteQuery, 200);

  // Main search query
  const { 
    data: searchResult, 
    isLoading: isSearching, 
    error: searchError,
    refetch: refetchSearch
  } = useQuery({
    queryKey: ['advanced-search', searchState],
    queryFn: async () => {
      const params: AdvancedSearchParams = {
        query: searchState.query,
        filters: searchState.filters,
        facetBy: facetFields,
        sortBy: searchState.sortBy,
        page: searchState.page,
        perPage,
        geoSearch: searchState.geoSearch
      };
      return searchService.search(params);
    },
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    enabled: true
  });

  // Autocomplete query
  const { 
    data: autocompleteResult, 
    isLoading: isAutocompleting 
  } = useQuery({
    queryKey: ['autocomplete', debouncedAutocomplete],
    queryFn: () => searchService.autocomplete(debouncedAutocomplete),
    enabled: enableAutocomplete && debouncedAutocomplete.length >= 2,
    staleTime: 60000
  });

  // Geo-search nearby
  const { mutateAsync: searchNearby, isPending: isSearchingNearby } = useMutation({
    mutationFn: async (params: GeoSearchParams & { filters?: Record<string, any> }) => {
      return searchService.geoSearch(params);
    }
  });

  // Actions
  const setQuery = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query, page: 1 }));
    if (enableAutocomplete) {
      setAutocompleteQuery(query);
    }
  }, [enableAutocomplete]);

  const setFilter = useCallback((key: string, value: any) => {
    setSearchState(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
      page: 1
    }));
  }, []);

  const setFilters = useCallback((filters: Record<string, any>) => {
    setSearchState(prev => ({
      ...prev,
      filters,
      page: 1
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      filters: {},
      page: 1
    }));
  }, []);

  const setSortBy = useCallback((sortBy: string) => {
    setSearchState(prev => ({ ...prev, sortBy, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setSearchState(prev => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback(() => {
    if (searchResult && searchState.page < searchResult.totalPages) {
      setPage(searchState.page + 1);
    }
  }, [searchResult, searchState.page, setPage]);

  const prevPage = useCallback(() => {
    if (searchState.page > 1) {
      setPage(searchState.page - 1);
    }
  }, [searchState.page, setPage]);

  const setGeoSearch = useCallback((geoSearch?: GeoSearchParams) => {
    setSearchState(prev => ({ ...prev, geoSearch, page: 1 }));
  }, []);

  const searchByLocation = useCallback(async (lat: number, lng: number, radiusKm = 10) => {
    setGeoSearch({ lat, lng, radiusKm });
  }, [setGeoSearch]);

  const clearGeoSearch = useCallback(() => {
    setGeoSearch(undefined);
  }, [setGeoSearch]);

  // Use current location
  const searchNearMe = useCallback(async (radiusKm = 10) => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }

    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          searchByLocation(
            position.coords.latitude,
            position.coords.longitude,
            radiusKm
          );
          resolve();
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, [searchByLocation]);

  // Clear cache for fresh results
  const invalidateCache = useCallback(() => {
    searchService.clearCache();
    queryClient.invalidateQueries({ queryKey: ['advanced-search'] });
  }, [queryClient]);

  // Computed values
  const hits = useMemo(() => searchResult?.hits || [], [searchResult]);
  const facets = useMemo(() => searchResult?.facetCounts || [], [searchResult]);
  const totalResults = searchResult?.found || 0;
  const totalPages = searchResult?.totalPages || 1;
  const searchTimeMs = searchResult?.searchTimeMs || 0;

  const activeFilterCount = useMemo(() => {
    return Object.entries(searchState.filters)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '' && value !== 'all')
      .length;
  }, [searchState.filters]);

  // Get facet options for a specific field
  const getFacetOptions = useCallback((field: string): { value: string; count: number; label: string }[] => {
    const facet = facets.find(f => f.field === field);
    if (!facet) return [];
    
    return facet.counts.map(c => ({
      value: c.value,
      count: c.count,
      label: `${c.value} (${c.count})`
    }));
  }, [facets]);

  return {
    // State
    query: searchState.query,
    filters: searchState.filters,
    page: searchState.page,
    sortBy: searchState.sortBy,
    geoSearch: searchState.geoSearch,

    // Results
    hits,
    facets,
    totalResults,
    totalPages,
    searchTimeMs,
    activeFilterCount,

    // Loading states
    isSearching,
    isAutocompleting,
    isSearchingNearby,
    searchError,

    // Autocomplete
    autocompleteSuggestions: autocompleteResult?.suggestions || [],
    autocompleteProperties: autocompleteResult?.properties || [],

    // Actions
    setQuery,
    setFilter,
    setFilters,
    clearFilters,
    setSortBy,
    setPage,
    nextPage,
    prevPage,
    refetchSearch,
    invalidateCache,

    // Geo search
    setGeoSearch,
    searchByLocation,
    clearGeoSearch,
    searchNearMe,
    searchNearby,

    // Helpers
    getFacetOptions,
    hasNextPage: searchState.page < totalPages,
    hasPrevPage: searchState.page > 1
  };
}

export default useAdvancedSearch;
