import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default stale time - data considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Default cache time - data stays in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
      // Don't retry failed requests automatically
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Cache management utilities
export const cacheUtils = {
  // Clear all cached data
  clearAll: () => queryClient.clear(),
  
  // Clear specific cache by key pattern
  clearByPattern: (pattern: string) => {
    queryClient.invalidateQueries({
      predicate: (query) => 
        query.queryKey.some(key => 
          typeof key === 'string' && key.includes(pattern)
        ),
    });
  },
  
  // Prefetch critical data
  prefetchCriticalData: async () => {
    // Prefetch common data that users frequently access
    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: ['properties', 'featured'],
        queryFn: async () => {
          const { supabase } = await import('@/integrations/supabase/client');
          const { data } = await supabase
            .from('properties')
            .select('*')
            .eq('status', 'available')
            .limit(6);
          return data;
        },
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['vendor-categories'],
        queryFn: async () => {
          const { supabase } = await import('@/integrations/supabase/client');
          const { data } = await supabase
            .from('vendor_subcategories')
            .select('*')
            .eq('is_active', true);
          return data;
        },
        staleTime: 15 * 60 * 1000, // Categories change less frequently
      }),
    ]);
  },
  
  // Get cache statistics
  getCacheStats: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      staleCaches: queries.filter(q => q.isStale()).length,
      activeCaches: queries.filter(q => q.observers.length > 0).length,
      errorCaches: queries.filter(q => q.state.status === 'error').length,
    };
  },
};