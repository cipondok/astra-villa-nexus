import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserMembership } from '@/hooks/useUserMembership';

interface VIPLimitsData {
  currentProperties: number;
  currentListings: number;
  maxProperties: number;
  maxListings: number;
  canAddProperty: boolean;
  canAddListing: boolean;
  canFeatureListings: boolean;
  prioritySupport: boolean;
  remainingProperties: number;
  remainingListings: number;
  membershipLevel: string;
  isLoading: boolean;
  error: Error | null;
}

export function useVIPLimits(): VIPLimitsData {
  const { user } = useAuth();
  const { 
    maxProperties, 
    maxListings, 
    canFeatureListings, 
    prioritySupport,
    membershipLevel,
    isLoading: membershipLoading 
  } = useUserMembership();

  // Fetch current property count
  const { data: propertyCount, isLoading: propertiesLoading, error } = useQuery({
    queryKey: ['user-property-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { count, error } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch current active listings count
  const { data: listingCount, isLoading: listingsLoading } = useQuery({
    queryKey: ['user-listing-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { count, error } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .eq('status', 'active');

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });

  const currentProperties = propertyCount || 0;
  const currentListings = listingCount || 0;
  const remainingProperties = Math.max(0, maxProperties - currentProperties);
  const remainingListings = Math.max(0, maxListings - currentListings);

  return {
    currentProperties,
    currentListings,
    maxProperties,
    maxListings,
    canAddProperty: currentProperties < maxProperties,
    canAddListing: currentListings < maxListings,
    canFeatureListings,
    prioritySupport,
    remainingProperties,
    remainingListings,
    membershipLevel,
    isLoading: membershipLoading || propertiesLoading || listingsLoading,
    error: error as Error | null
  };
}

export default useVIPLimits;
