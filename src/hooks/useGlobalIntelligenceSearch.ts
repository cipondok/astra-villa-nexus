import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';

/* ─── Result Types ─── */
export interface PropertyResult {
  id: string;
  title: string;
  state: string;
  city: string;
  area: string | null;
  property_type: string;
  listing_type: string;
  price: number;
  deal_score: number | null;
  demand_score: number | null;
  status: string;
  created_at: string;
  result_type: 'property';
  relevance_boost: number;
}

export interface AlertResult {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  action_required: boolean;
  created_at: string;
  result_type: 'alert';
  relevance_boost: number;
}

export interface SeoPageResult {
  id: string;
  title: string;
  slug: string;
  primary_keyword: string;
  seo_score: number | null;
  organic_traffic: number | null;
  status: string;
  target_location: string | null;
  content_type: string;
  created_at: string;
  result_type: 'seo_page';
  relevance_boost: number;
}

export interface LeadResult {
  id: string;
  agent_name: string;
  email: string | null;
  city: string;
  stage: string;
  priority: string;
  source_channel: string;
  specialization: string | null;
  created_at: string;
  result_type: 'lead';
  relevance_boost: number;
}

export interface GlobalSearchResults {
  properties: PropertyResult[];
  alerts: AlertResult[];
  seo_pages: SeoPageResult[];
  leads: LeadResult[];
}

const EMPTY_RESULTS: GlobalSearchResults = {
  properties: [],
  alerts: [],
  seo_pages: [],
  leads: [],
};

export function useGlobalIntelligenceSearch() {
  const [results, setResults] = useState<GlobalSearchResults>(EMPTY_RESULTS);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef('');

  const search = useCallback(async (query: string) => {
    const trimmed = query.trim();
    lastQueryRef.current = trimmed;

    if (trimmed.length < 2) {
      setResults(EMPTY_RESULTS);
      setIsSearching(false);
      return;
    }

    // Abort previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        'admin_global_search' as any,
        { p_query: trimmed, p_limit: 8 }
      );

      // Stale check
      if (trimmed !== lastQueryRef.current) return;

      if (rpcError) throw rpcError;

      setResults({
        properties: (data as any)?.properties || [],
        alerts: (data as any)?.alerts || [],
        seo_pages: (data as any)?.seo_pages || [],
        leads: (data as any)?.leads || [],
      });
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      console.error('Global search error:', e);
      setError(e?.message || 'Search failed');
    } finally {
      if (trimmed === lastQueryRef.current) {
        setIsSearching(false);
      }
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(EMPTY_RESULTS);
    setError(null);
    setIsSearching(false);
  }, []);

  const totalResults =
    results.properties.length +
    results.alerts.length +
    results.seo_pages.length +
    results.leads.length;

  return {
    results,
    isSearching,
    error,
    totalResults,
    search,
    clearResults,
  };
}
