import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PropertyOwnerStats {
  totalProperties: number;
  activeListings: number;
  totalViews: number;
  totalInquiries: number;
  pendingApprovals: number;
  savedCount: number;
}

export interface PropertyOwnerProperty {
  id: string;
  title: string;
  price: number;
  property_type: string;
  listing_type: string;
  status: string;
  approval_status: string;
  city: string;
  state: string;
  images: string[];
  thumbnail_url: string;
  created_at: string;
}

export const usePropertyOwnerData = () => {
  const { user } = useAuth();

  const propertiesQuery = useQuery({
    queryKey: ['property-owner-properties', user?.id],
    queryFn: async (): Promise<PropertyOwnerProperty[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('properties')
        .select('id, title, price, property_type, listing_type, status, approval_status, city, state, images, thumbnail_url, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        return [];
      }

      return (data as unknown as PropertyOwnerProperty[]) || [];
    },
    enabled: !!user?.id,
  });

  const statsQuery = useQuery({
    queryKey: ['property-owner-stats', user?.id],
    queryFn: async (): Promise<PropertyOwnerStats> => {
      if (!user?.id) {
        return {
          totalProperties: 0,
          activeListings: 0,
          totalViews: 0,
          totalInquiries: 0,
          pendingApprovals: 0,
          savedCount: 0,
        };
      }

      // Get properties count
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id, status, approval_status')
        .eq('owner_id', user.id);

      if (propError) {
        console.error('Error fetching property stats:', propError);
      }

      const propList = (properties as any[]) || [];
      const totalProperties = propList.length;
      const activeListings = propList.filter(p => p.status === 'active' && p.approval_status === 'approved').length;
      const pendingApprovals = propList.filter(p => p.approval_status === 'pending').length;

      // Get property IDs for related queries
      const propertyIds = propList.map(p => p.id);
      
      // Get favorites count (how many times user's properties were saved)
      let savedCount = 0;
      if (propertyIds.length > 0) {
        const { count } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .in('property_id', propertyIds);
        savedCount = count || 0;
      }

      return {
        totalProperties,
        activeListings,
        totalViews: 0, // Can be added later if views tracking exists
        totalInquiries: 0, // Can be added later
        pendingApprovals,
        savedCount,
      };
    },
    enabled: !!user?.id,
  });

  const recentActivityQuery = useQuery({
    queryKey: ['property-owner-activity', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching activity:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  return {
    properties: propertiesQuery.data || [],
    stats: statsQuery.data || {
      totalProperties: 0,
      activeListings: 0,
      totalViews: 0,
      totalInquiries: 0,
      pendingApprovals: 0,
      savedCount: 0,
    },
    recentActivity: recentActivityQuery.data || [],
    isLoading: propertiesQuery.isLoading || statsQuery.isLoading,
    isError: propertiesQuery.isError || statsQuery.isError,
  };
};
