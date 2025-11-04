import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useCallback } from 'react';
import { isValidUUID } from '@/utils/uuid-validation';
import { validateUUIDWithLogging } from '@/utils/uuid-validation-logger';

export interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  cacheTime?: number;
  background?: boolean;
  dependencies?: any[];
}

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000, // 5 minutes default
  cacheTime = 10 * 60 * 1000, // 10 minutes default
  background = true,
  dependencies = [],
  ...options
}: OptimizedQueryOptions<T>) {
  const queryClient = useQueryClient();

  // Invalidate cache when dependencies change
  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  // Prefetch data for better UX
  const prefetchData = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime,
    });
  }, [queryClient, queryKey, queryFn, staleTime]);

  const result = useQuery({
    queryKey: [...queryKey, ...dependencies],
    queryFn,
    staleTime,
    gcTime: cacheTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: background,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });

  return {
    ...result,
    invalidateCache,
    prefetchData,
  };
}

// Specialized hooks for common queries
export function usePropertiesQuery(filters?: any) {
  return useOptimizedQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'available');
      
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for properties
    dependencies: [filters],
  });
}

export function useVendorsQuery() {
  return useOptimizedQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('vendor_business_profiles')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for vendors
  });
}

export function useUserProfileQuery(userId?: string) {
  return useOptimizedQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      if (!validateUUIDWithLogging(userId, 'useUserProfileQuery', {
        operation: 'query_user_profile',
        userId
      })) {
        throw new Error('Invalid user ID format');
      }
      
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId && isValidUUID(userId),
    staleTime: 10 * 60 * 1000, // 10 minutes for user profile
    dependencies: [userId],
  });
}