import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';

export interface NLPFilters {
  location?: string;
  state?: string;
  city?: string;
  property_type?: string;
  listing_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_area?: number;
  max_area?: number;
  amenities?: string[];
  features?: string[];
  furnishing?: string;
  sort_by?: string;
  investment_intent?: boolean;
  intent_summary?: string;
}

export function useNLPSearch() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedFilters, setExtractedFilters] = useState<NLPFilters | null>(null);
  const [intentSummary, setIntentSummary] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const trackQuery = useCallback(async (queryText: string, filters: NLPFilters | null, source: string = 'search_page') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('ai_property_queries' as any).insert({
        user_id: user.id,
        query_text: queryText,
        parsed_filters: filters || {},
        intent_summary: filters?.intent_summary || null,
        source,
      });
    } catch { /* silent */ }
  }, []);

  const processNaturalLanguage = useCallback(async (query: string, source: string = 'search_page') => {
    if (!query.trim()) return null;

    setIsProcessing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-assistant', {
        body: { mode: 'nlp_search', payload: { query: query.trim() } },
      });

      if (fnError) throw fnError;
      throwIfEdgeFunctionReturnedError(data);

      const filters: NLPFilters = data.filters;
      setExtractedFilters(filters);
      setIntentSummary(filters.intent_summary || '');
      
      // Track query for analytics
      trackQuery(query.trim(), filters, source);
      
      return filters;
    } catch (e: any) {
      const msg = e?.message || 'Failed to process search query';
      setError(msg);
      toast({ title: 'AI Search Error', description: msg, variant: 'destructive' });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast, trackQuery]);

  /** Convert NLP filters to the format usePropertySearch.searchProperties expects */
  const toSearchParams = useCallback((filters: NLPFilters) => {
    return {
      query: '',
      state: filters.state || filters.location || '',
      city: filters.city || '',
      propertyType: filters.property_type || '',
      listingType: filters.listing_type || '',
      minPrice: filters.min_price,
      maxPrice: filters.max_price,
      bedrooms: filters.bedrooms ? String(filters.bedrooms) : '',
      bathrooms: filters.bathrooms ? String(filters.bathrooms) : '',
      minArea: filters.min_area,
      maxArea: filters.max_area,
      amenities: filters.amenities || [],
      features: filters.features || [],
      furnishing: filters.furnishing || '',
      sortBy: filters.sort_by || '',
    };
  }, []);

  const clearNLP = useCallback(() => {
    setExtractedFilters(null);
    setIntentSummary('');
    setError(null);
  }, []);

  return {
    isProcessing,
    extractedFilters,
    intentSummary,
    error,
    processNaturalLanguage,
    toSearchParams,
    clearNLP,
  };
}
