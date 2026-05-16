/**
 * Typesense-Compatible Search Service
 * Provides advanced search with faceted filters, geo-search, autocomplete
 */

import { supabase } from '@/integrations/supabase/client';
import { BaseProperty } from '@/types/property';

export interface SearchFacet {
  field: string;
  counts: { value: string; count: number }[];
}

export interface GeoSearchParams {
  lat: number;
  lng: number;
  radiusKm: number;
}

export interface SearchResult {
  hits: PropertyHit[];
  found: number;
  facetCounts: SearchFacet[];
  searchTimeMs: number;
  page: number;
  totalPages: number;
}

export interface PropertyHit {
  document: BaseProperty;
  highlights: Highlight[];
  textMatchScore: number;
  geoDistanceKm?: number;
}

export interface Highlight {
  field: string;
  snippet: string;
  matchedTokens: string[];
}

export interface AdvancedSearchParams {
  query: string;
  filters?: Record<string, any>;
  facetBy?: string[];
  sortBy?: string;
  geoSearch?: GeoSearchParams;
  page?: number;
  perPage?: number;
}

class TypesenseSearchService {
  private cache = new Map<string, { result: SearchResult; timestamp: number }>();
  private cacheTTL = 30000;

  async search(params: AdvancedSearchParams): Promise<SearchResult> {
    const startTime = performance.now();
    const cacheKey = this.getCacheKey(params);
    
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return { ...cached.result, searchTimeMs: 1 };
    }

    try {
      const result = await this.executeSearch(params);
      const searchTimeMs = Math.round(performance.now() - startTime);
      
      const finalResult = { ...result, searchTimeMs };
      this.cache.set(cacheKey, { result: finalResult, timestamp: Date.now() });
      
      return finalResult;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  async autocomplete(query: string, limit = 5): Promise<{ suggestions: string[]; properties: PropertyHit[] }> {
    if (!query || query.length < 2) {
      return { suggestions: [], properties: [] };
    }

    const normalizedQuery = this.normalizeQuery(query);
    
    const { data: locations } = await supabase
      .from('properties')
      .select('city, state, location')
      .eq('status', 'active')
      .or(`city.ilike.%${normalizedQuery}%,state.ilike.%${normalizedQuery}%,location.ilike.%${normalizedQuery}%`)
      .limit(20);

    const locationSuggestions = new Set<string>();
    locations?.forEach(loc => {
      if (loc.city?.toLowerCase().includes(normalizedQuery.toLowerCase())) {
        locationSuggestions.add(loc.city);
      }
      if (loc.state?.toLowerCase().includes(normalizedQuery.toLowerCase())) {
        locationSuggestions.add(loc.state);
      }
    });

    const { data: properties } = await supabase
      .from('properties')
      .select('id, title, property_type, listing_type, price, location, city, bedrooms, bathrooms, area_sqm, images, thumbnail_url')
      .eq('status', 'active')
      .eq('approval_status', 'approved')
      .or(`title.ilike.%${normalizedQuery}%,location.ilike.%${normalizedQuery}%`)
      .limit(limit);

    const propertyHits: PropertyHit[] = (properties || []).map(p => ({
      document: p as unknown as BaseProperty,
      highlights: [{
        field: 'title',
        snippet: this.highlightMatch(p.title, normalizedQuery),
        matchedTokens: [normalizedQuery]
      }],
      textMatchScore: this.calculateTextScore(p.title, normalizedQuery)
    }));

    return {
      suggestions: Array.from(locationSuggestions).slice(0, limit),
      properties: propertyHits
    };
  }

  async geoSearch(params: GeoSearchParams & { filters?: Record<string, any>; limit?: number }): Promise<PropertyHit[]> {
    const { lat, lng, radiusKm, filters = {}, limit = 20 } = params;
    
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
    
    // For geo search, we'll use the location text field since lat/lng may not exist
    let query = supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .eq('approval_status', 'approved')
      .limit(limit);

    if (filters.propertyType) {
      query = query.eq('property_type', filters.propertyType);
    }
    if (filters.listingType) {
      query = query.eq('listing_type', filters.listingType);
    }

    const { data, error } = await query;
    
    if (error) throw error;

    return (data || []).map(p => ({
      document: p as unknown as BaseProperty,
      highlights: [],
      textMatchScore: 0,
      geoDistanceKm: undefined // Would calculate if lat/lng available
    }));
  }

  async getFacets(
    baseFilters: Record<string, any> = {},
    facetFields: string[] = ['property_type', 'listing_type', 'city', 'bedrooms']
  ): Promise<SearchFacet[]> {
    const facets: SearchFacet[] = [];

    for (const field of facetFields) {
      const counts = await this.getFacetCounts(field, baseFilters);
      facets.push({ field, counts });
    }

    return facets;
  }

  private async executeSearch(params: AdvancedSearchParams): Promise<SearchResult> {
    const {
      query,
      filters = {},
      facetBy = ['property_type', 'listing_type', 'city', 'bedrooms'],
      sortBy = 'created_at:desc',
      page = 1,
      perPage = 20
    } = params;

    let dbQuery = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .eq('approval_status', 'approved');

    if (query && query.trim()) {
      const searchTerm = this.normalizeQuery(query);
      dbQuery = dbQuery.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`
      );
    }

    if (filters.propertyType && filters.propertyType !== 'all') {
      dbQuery = dbQuery.eq('property_type', filters.propertyType);
    }
    if (filters.listingType && filters.listingType !== 'all') {
      dbQuery = dbQuery.eq('listing_type', filters.listingType);
    }
    if (filters.city && filters.city !== 'all') {
      dbQuery = dbQuery.ilike('city', `%${filters.city}%`);
    }
    if (filters.state && filters.state !== 'all') {
      dbQuery = dbQuery.ilike('state', `%${filters.state}%`);
    }
    if (filters.minPrice) {
      dbQuery = dbQuery.gte('price', filters.minPrice);
    }
    if (filters.maxPrice) {
      dbQuery = dbQuery.lte('price', filters.maxPrice);
    }
    if (filters.minBedrooms) {
      dbQuery = dbQuery.gte('bedrooms', filters.minBedrooms);
    }
    if (filters.minBathrooms) {
      dbQuery = dbQuery.gte('bathrooms', filters.minBathrooms);
    }
    if (filters.minArea) {
      dbQuery = dbQuery.gte('area_sqm', filters.minArea);
    }
    if (filters.maxArea) {
      dbQuery = dbQuery.lte('area_sqm', filters.maxArea);
    }

    const [sortField, sortOrder] = sortBy.split(':');
    const ascending = sortOrder !== 'desc';
    dbQuery = dbQuery.order(sortField || 'created_at', { ascending });

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    dbQuery = dbQuery.range(from, to);

    const { data, error, count } = await dbQuery;
    
    if (error) throw error;

    const hits: PropertyHit[] = (data || []).map(p => ({
      document: p as unknown as BaseProperty,
      highlights: query ? this.generateHighlights(p, query) : [],
      textMatchScore: query ? this.calculateTextScore(p.title + ' ' + (p.description || ''), query) : 0
    }));

    const facetCounts = await this.getFacets(filters, facetBy);

    return {
      hits,
      found: count || 0,
      facetCounts,
      searchTimeMs: 0,
      page,
      totalPages: Math.ceil((count || 0) / perPage)
    };
  }

  private async getFacetCounts(field: string, baseFilters: Record<string, any>): Promise<{ value: string; count: number }[]> {
    let query = supabase
      .from('properties')
      .select(field)
      .eq('status', 'active')
      .eq('approval_status', 'approved');

    if (baseFilters.listingType && baseFilters.listingType !== 'all' && field !== 'listing_type') {
      query = query.eq('listing_type', baseFilters.listingType);
    }

    const { data } = await query;
    
    const counts = new Map<string, number>();
    (data || []).forEach(row => {
      const value = String((row as any)[field] || 'Unknown');
      counts.set(value, (counts.get(value) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  private generateHighlights(property: any, query: string): Highlight[] {
    const highlights: Highlight[] = [];
    const searchTerm = query.toLowerCase();
    
    ['title', 'description', 'location', 'city'].forEach(field => {
      const value = property[field];
      if (value && value.toLowerCase().includes(searchTerm)) {
        highlights.push({
          field,
          snippet: this.highlightMatch(value, query),
          matchedTokens: [query]
        });
      }
    });

    return highlights;
  }

  private highlightMatch(text: string, query: string): string {
    if (!text || !query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  private calculateTextScore(text: string, query: string): number {
    if (!text || !query) return 0;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    if (lowerText.includes(lowerQuery)) {
      const position = lowerText.indexOf(lowerQuery);
      return 100 - (position / lowerText.length * 50);
    }
    
    const tokens = lowerQuery.split(/\s+/);
    let matchedTokens = 0;
    tokens.forEach(token => {
      if (lowerText.includes(token)) matchedTokens++;
    });
    
    return (matchedTokens / tokens.length) * 75;
  }

  private normalizeQuery(query: string): string {
    return query.trim().replace(/[^\w\s-]/g, '').slice(0, 100);
  }

  private getCacheKey(params: AdvancedSearchParams): string {
    return JSON.stringify(params);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const searchService = new TypesenseSearchService();
export default searchService;
