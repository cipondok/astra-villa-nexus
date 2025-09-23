import { useState, useCallback, useMemo } from 'react';
import { useOptimizedQuery } from './useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import type { BaseProperty } from '@/types/property';
import type { SearchFilters } from '@/types/search';

interface SearchResult extends BaseProperty {
  relevance_score: number;
  match_reasons: string[];
  price_trend: 'up' | 'down' | 'stable';
  market_position: 'below' | 'at' | 'above';
  rating?: number;
}

interface AdvancedSearchOptions extends SearchFilters {
  useAI?: boolean;
  includePredictions?: boolean;
  personalizeResults?: boolean;
  sortBy?: 'relevance' | 'price' | 'date' | 'popularity';
}

export function useAdvancedPropertySearch() {
  const [searchOptions, setSearchOptions] = useState<AdvancedSearchOptions>({});
  const [isSearching, setIsSearching] = useState(false);

  // Step 1: Basic search with scoring
  const { data: searchResults, isLoading, error, invalidateCache } = useOptimizedQuery({
    queryKey: ['advanced-property-search', JSON.stringify(searchOptions)],
    queryFn: async () => {
      if (!searchOptions.query && !searchOptions.location) return [];
      
      const scoredResults = await scoreAndRankProperties(searchOptions);
      return scoredResults;
    },
    enabled: !!(searchOptions.query || searchOptions.location),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Step 2: AI-Enhanced Search
  const performAISearch = useCallback(async (query: string, filters: SearchFilters) => {
    setIsSearching(true);
    try {
      const { data: aiResults } = await supabase.functions.invoke('ai-property-assistant', {
        body: {
          message: `Find properties: ${query}`,
          searchFilters: filters,
          requestType: 'search'
        }
      });
      
      return aiResults?.properties || [];
    } catch (error) {
      console.error('AI search failed:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Step 3: Search with ML Ranking
  const search = useCallback(async (options: AdvancedSearchOptions) => {
    setSearchOptions(options);
    
    if (options.useAI && options.query) {
      const aiResults = await performAISearch(options.query, options);
      return aiResults;
    }
    
    // Trigger regular search
    invalidateCache();
  }, [performAISearch, invalidateCache]);

  // Step 4: Get personalized recommendations
  const getPersonalizedResults = useCallback(async (userId?: string) => {
    if (!userId || !searchResults?.length) return searchResults;

    try {
      const { data: recommendations } = await supabase.functions.invoke('smart-recommendations', {
        body: {
          userId,
          type: 'properties',
          limit: 10,
          searchContext: searchOptions
        }
      });

      // Merge search results with personalized scoring
      return mergeWithPersonalization(searchResults, recommendations);
    } catch (error) {
      console.error('Personalization failed:', error);
      return searchResults;
    }
  }, [searchResults, searchOptions]);

  return {
    searchResults: searchResults as SearchResult[],
    isLoading: isLoading || isSearching,
    error,
    search,
    getPersonalizedResults,
    currentOptions: searchOptions,
    clearSearch: () => setSearchOptions({})
  };
}

// Step 5: Property Scoring Algorithm
async function scoreAndRankProperties(options: AdvancedSearchOptions): Promise<SearchResult[]> {
  const { data: properties, error } = await supabase
    .rpc('search_properties_optimized', {
      p_search_text: options.query,
      p_property_type: options.propertyType,
      p_listing_type: 'rent', // Default to rent
      p_city: options.city,
      p_min_price: options.priceRange ? parseFloat(options.priceRange.split('-')[0]) : null,
      p_max_price: options.priceRange ? parseFloat(options.priceRange.split('-')[1]) : null,
      p_min_bedrooms: options.bedrooms ? parseInt(options.bedrooms) : null,
      p_limit: 50
    });

  if (error || !properties) return [];

  // Apply ML-based scoring
  const scoredProperties = properties.map((property: any) => {
    const relevanceScore = calculateRelevanceScore(property, options);
    const matchReasons = generateMatchReasons(property, options);
    
    return {
      ...property,
      relevance_score: relevanceScore,
      match_reasons: matchReasons,
      price_trend: 'stable' as const, // Will be enhanced with price prediction
      market_position: 'at' as const
    };
  });

  // Sort by relevance or specified criteria
  return sortSearchResults(scoredProperties, options.sortBy || 'relevance');
}

// Step 6: Relevance Scoring Algorithm
function calculateRelevanceScore(property: any, options: AdvancedSearchOptions): number {
  let score = 0;
  let maxScore = 0;

  // Text relevance (40% weight)
  if (options.query) {
    const textScore = calculateTextRelevance(property, options.query);
    score += textScore * 0.4;
    maxScore += 0.4;
  }

  // Location match (25% weight)
  if (options.location || options.city) {
    const locationScore = calculateLocationMatch(property, options);
    score += locationScore * 0.25;
    maxScore += 0.25;
  }

  // Price relevance (20% weight)
  if (options.priceRange) {
    const priceScore = calculatePriceRelevance(property, options.priceRange);
    score += priceScore * 0.20;
    maxScore += 0.20;
  }

  // Features match (15% weight)
  const featureScore = calculateFeatureMatch(property, options);
  score += featureScore * 0.15;
  maxScore += 0.15;

  return maxScore > 0 ? (score / maxScore) * 100 : 50; // Default neutral score
}

function calculateTextRelevance(property: any, query: string): number {
  const searchTerms = query.toLowerCase().split(' ');
  const propertyText = `${property.title} ${property.description} ${property.location}`.toLowerCase();
  
  let matches = 0;
  searchTerms.forEach(term => {
    if (propertyText.includes(term)) {
      matches++;
    }
  });
  
  return searchTerms.length > 0 ? matches / searchTerms.length : 0;
}

function calculateLocationMatch(property: any, options: AdvancedSearchOptions): number {
  const targetLocation = (options.location || options.city || '').toLowerCase();
  const propertyLocation = `${property.location} ${property.city} ${property.area}`.toLowerCase();
  
  if (propertyLocation.includes(targetLocation)) return 1;
  
  // Partial matches
  const locationTerms = targetLocation.split(' ');
  let matches = 0;
  locationTerms.forEach(term => {
    if (propertyLocation.includes(term)) matches++;
  });
  
  return locationTerms.length > 0 ? matches / locationTerms.length : 0;
}

function calculatePriceRelevance(property: any, priceRange: string): number {
  const [minPrice, maxPrice] = priceRange.split('-').map(p => parseFloat(p));
  const price = property.price;
  
  if (price >= minPrice && price <= maxPrice) return 1;
  
  // Penalty for being outside range
  if (price < minPrice) return Math.max(0, 1 - (minPrice - price) / minPrice);
  if (price > maxPrice) return Math.max(0, 1 - (price - maxPrice) / maxPrice);
  
  return 0;
}

function calculateFeatureMatch(property: any, options: AdvancedSearchOptions): number {
  let matches = 0;
  let totalChecks = 0;

  if (options.bedrooms) {
    totalChecks++;
    if (property.bedrooms >= parseInt(options.bedrooms)) matches++;
  }

  if (options.bathrooms) {
    totalChecks++;
    if (property.bathrooms >= parseInt(options.bathrooms)) matches++;
  }

  if (options.has3D) {
    totalChecks++;
    if (property.three_d_model_url) matches++;
  }

  return totalChecks > 0 ? matches / totalChecks : 1;
}

function generateMatchReasons(property: any, options: AdvancedSearchOptions): string[] {
  const reasons: string[] = [];

  if (options.query && calculateTextRelevance(property, options.query) > 0.7) {
    reasons.push('High text relevance');
  }

  if (options.location && calculateLocationMatch(property, options) > 0.8) {
    reasons.push('Perfect location match');
  }

  if (options.priceRange && calculatePriceRelevance(property, options.priceRange) === 1) {
    reasons.push('Within budget');
  }

  if (property.three_d_model_url) {
    reasons.push('3D model available');
  }

  return reasons;
}

function sortSearchResults(results: SearchResult[], sortBy: string): SearchResult[] {
  switch (sortBy) {
    case 'price':
      return results.sort((a, b) => a.price - b.price);
    case 'date':
      return results.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    case 'popularity':
      return results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'relevance':
    default:
      return results.sort((a, b) => b.relevance_score - a.relevance_score);
  }
}

function mergeWithPersonalization(searchResults: SearchResult[], recommendations: any[]): SearchResult[] {
  if (!recommendations?.length) return searchResults;

  const recommendedIds = new Set(recommendations.map(r => r.id));
  
  return searchResults.map(result => ({
    ...result,
    relevance_score: recommendedIds.has(result.id) 
      ? result.relevance_score * 1.2 // Boost personalized results
      : result.relevance_score
  }));
}