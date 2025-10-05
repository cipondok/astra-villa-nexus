import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createCacheUtils } from '@/lib/queryClient';

export const usePerformanceOptimization = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch critical data on idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const cacheUtils = createCacheUtils(queryClient);
        cacheUtils.prefetchCriticalData();
      });
    } else {
      setTimeout(() => {
        const cacheUtils = createCacheUtils(queryClient);
        cacheUtils.prefetchCriticalData();
      }, 1000);
    }

    // Clean up stale queries periodically
    const cleanupInterval = setInterval(() => {
      queryClient.getQueryCache().getAll().forEach((query) => {
        if (query.isStale() && query.observers.length === 0) {
          queryClient.removeQueries({ queryKey: query.queryKey });
        }
      });
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, [queryClient]);

  // Request persistent storage for better caching
  useEffect(() => {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      navigator.storage.persist().then((persistent) => {
        if (persistent && process.env.NODE_ENV === 'development') {
          console.log('Storage persisted successfully');
        }
      });
    }
  }, []);
};
