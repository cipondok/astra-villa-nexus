import { QueryClient } from '@tanstack/react-query';

// Cache management utilities that work with any QueryClient instance
export const createCacheUtils = (queryClient: QueryClient) => ({
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
});