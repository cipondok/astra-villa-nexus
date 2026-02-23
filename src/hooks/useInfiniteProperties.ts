import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useIntersectionObserver } from './useIntersectionObserver';

interface UseInfinitePropertiesOptions {
  listingType?: string;
  developmentStatus?: string[];
  pageSize?: number;
  enabled?: boolean;
}

export function useInfiniteProperties(options: UseInfinitePropertiesOptions = {}) {
  const { listingType, developmentStatus, pageSize = 12, enabled = true } = options;
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const isFetchingRef = useRef(false);

  const [sentinelRef, isSentinelVisible] = useIntersectionObserver({
    rootMargin: '400px',
    freezeOnceVisible: false,
  });

  const fetchBatch = useCallback(async (offset: number, isInitial: boolean) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (isInitial) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .not('title', 'is', null)
        .gt('price', 0);

      if (listingType) {
        query = query.eq('listing_type', listingType);
      }

      if (developmentStatus && developmentStatus.length > 0) {
        query = query.in('development_status', developmentStatus);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        console.error('Error fetching properties:', error);
        setHasMore(false);
        return;
      }

      const batch = (data || []).filter((p: any) => p.title?.trim() && p.price > 0);

      if (isInitial) {
        setProperties(batch);
      } else {
        setProperties(prev => [...prev, ...batch]);
      }

      // If we got fewer than pageSize, no more data
      if (!data || data.length < pageSize) {
        setHasMore(false);
      }

      offsetRef.current = offset + (data?.length || 0);
    } catch (e) {
      console.error('Error in fetchBatch:', e);
      setHasMore(false);
    } finally {
      if (isInitial) setIsLoading(false);
      else setIsFetchingMore(false);
      isFetchingRef.current = false;
    }
  }, [listingType, developmentStatus, pageSize]);

  // Initial fetch
  useEffect(() => {
    if (!enabled) return;
    offsetRef.current = 0;
    setHasMore(true);
    setProperties([]);
    fetchBatch(0, true);
  }, [enabled, listingType, JSON.stringify(developmentStatus), fetchBatch]);

  // Load more when sentinel visible
  useEffect(() => {
    if (isSentinelVisible && hasMore && !isLoading && !isFetchingMore && enabled) {
      fetchBatch(offsetRef.current, false);
    }
  }, [isSentinelVisible, hasMore, isLoading, isFetchingMore, enabled, fetchBatch]);

  const loadMore = useCallback(() => {
    if (hasMore && !isFetchingMore && !isLoading) {
      fetchBatch(offsetRef.current, false);
    }
  }, [hasMore, isFetchingMore, isLoading, fetchBatch]);

  const reset = useCallback(() => {
    offsetRef.current = 0;
    setHasMore(true);
    setProperties([]);
    fetchBatch(0, true);
  }, [fetchBatch]);

  return {
    properties,
    isLoading,
    isFetchingMore,
    hasMore,
    loadMore,
    reset,
    sentinelRef,
  };
}
