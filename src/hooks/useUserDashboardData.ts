import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DashboardStats {
  savedProperties: number;
  recentSearches: number;
  messages: number;
  notifications: number;
}

export interface RecentActivity {
  id: string;
  activity_type: string;
  activity_description: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface SavedProperty {
  id: string;
  property_id: string;
  created_at: string;
}

export const useUserDashboardData = () => {
  const { user } = useAuth();

  // Fetch saved properties count
  const { data: savedPropertiesData, isLoading: loadingSaved } = useQuery({
    queryKey: ['user-saved-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return { count: 0, items: [] as SavedProperty[] };
      
      const { data, error, count } = await supabase
        .from('favorites')
        .select('id, property_id, created_at', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching favorites:', error);
        return { count: 0, items: [] as SavedProperty[] };
      }

      return { 
        count: count || 0, 
        items: (data || []) as SavedProperty[]
      };
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: loadingActivity } = useQuery({
    queryKey: ['user-activity', user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as RecentActivity[];
      
      const { data, error } = await supabase
        .from('activity_logs')
        .select('id, activity_type, activity_description, created_at, metadata')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching activity:', error);
        return [] as RecentActivity[];
      }

      return (data || []) as RecentActivity[];
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  // Fetch survey bookings count
  const { data: surveyBookingsCount, isLoading: loadingSurveys } = useQuery({
    queryKey: ['user-survey-bookings-count', user?.id],
    queryFn: async () => {
      if (!user?.id || !user?.email) return 0;
      
      const { count, error } = await supabase
        .from('property_survey_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('customer_email', user.email);

      if (error) {
        console.error('Error fetching survey bookings:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!user?.id && !!user?.email,
    staleTime: 30000,
  });

  const stats: DashboardStats = {
    savedProperties: savedPropertiesData?.count || 0,
    recentSearches: 0,
    messages: surveyBookingsCount || 0,
    notifications: 0,
  };

  return {
    stats,
    savedProperties: savedPropertiesData?.items || [],
    recentActivity: recentActivity || [],
    isLoading: loadingSaved || loadingActivity || loadingSurveys,
  };
};
