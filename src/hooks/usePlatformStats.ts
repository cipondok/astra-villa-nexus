import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformStats {
  // User metrics
  totalUsers: number;
  activeUsers24h: number;
  newUsersToday: number;
  newUsersWeek: number;
  
  // Vendor metrics
  totalVendors: number;
  activeVendors: number;
  pendingVendors: number;
  
  // Property metrics
  totalProperties: number;
  activeProperties: number;
  newPropertiesWeek: number;
  
  // Service metrics
  totalServices: number;
  activeServices: number;
  
  // Activity metrics
  totalActivities: number;
  activities24h: number;
  activitiesWeek: number;
  
  // Support metrics
  totalTickets: number;
  openTickets: number;
  pendingTickets: number;
  
  // Engagement metrics
  totalReviews: number;
  totalFeedback: number;
  avgRating: number;
  
  // Alerts
  unreadAlerts: number;
  criticalAlerts: number;
  
  // Loading state
  isLoading: boolean;
  lastUpdated: Date | null;
}

const defaultStats: PlatformStats = {
  totalUsers: 0,
  activeUsers24h: 0,
  newUsersToday: 0,
  newUsersWeek: 0,
  totalVendors: 0,
  activeVendors: 0,
  pendingVendors: 0,
  totalProperties: 0,
  activeProperties: 0,
  newPropertiesWeek: 0,
  totalServices: 0,
  activeServices: 0,
  totalActivities: 0,
  activities24h: 0,
  activitiesWeek: 0,
  totalTickets: 0,
  openTickets: 0,
  pendingTickets: 0,
  totalReviews: 0,
  totalFeedback: 0,
  avgRating: 0,
  unreadAlerts: 0,
  criticalAlerts: 0,
  isLoading: true,
  lastUpdated: null,
};

export const usePlatformStats = (autoRefresh = true, refreshInterval = 30000) => {
  const [stats, setStats] = useState<PlatformStats>(defaultStats);

  const fetchStats = useCallback(async () => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

      // Parallel fetch all stats
      const [
        usersResult,
        newUsersToday,
        newUsersWeek,
        vendorsResult,
        propertiesResult,
        activeProperties,
        newPropertiesWeek,
        servicesResult,
        activeServices,
        activitiesResult,
        activities24h,
        activitiesWeek,
        ticketsResult,
        openTickets,
        reviewsResult,
        feedbackResult,
        alertsResult,
        criticalAlerts,
      ] = await Promise.all([
        // Users
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
        
        // Vendors
        supabase.from('vendor_business_profiles').select('*', { count: 'exact', head: true }),
        
        // Properties
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('properties').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
        
        // Services
        supabase.from('vendor_services').select('*', { count: 'exact', head: true }),
        supabase.from('vendor_services').select('*', { count: 'exact', head: true }).eq('is_active', true),
        
        // Activities
        supabase.from('activity_logs').select('*', { count: 'exact', head: true }),
        supabase.from('activity_logs').select('*', { count: 'exact', head: true }).gte('created_at', dayAgo),
        supabase.from('activity_logs').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
        
        // Support tickets
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
        
        // Reviews
        supabase.from('vendor_reviews').select('*', { count: 'exact', head: true }),
        
        // Feedback
        supabase.from('user_feedback').select('*', { count: 'exact', head: true }),
        
        // Alerts
        supabase.from('admin_alerts').select('*', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('admin_alerts').select('*', { count: 'exact', head: true }).eq('priority', 'critical').eq('is_read', false),
      ]);

      // Fetch average rating
      const { data: ratingData } = await supabase
        .from('vendor_reviews')
        .select('rating');
      
      const avgRating = ratingData && ratingData.length > 0
        ? ratingData.reduce((sum, r) => sum + (r.rating || 0), 0) / ratingData.length
        : 0;

      setStats({
        totalUsers: usersResult.count || 0,
        activeUsers24h: activities24h.count || 0, // Users who had activity
        newUsersToday: newUsersToday.count || 0,
        newUsersWeek: newUsersWeek.count || 0,
        totalVendors: vendorsResult.count || 0,
        activeVendors: vendorsResult.count || 0,
        pendingVendors: 0,
        totalProperties: propertiesResult.count || 0,
        activeProperties: activeProperties.count || 0,
        newPropertiesWeek: newPropertiesWeek.count || 0,
        totalServices: servicesResult.count || 0,
        activeServices: activeServices.count || 0,
        totalActivities: activitiesResult.count || 0,
        activities24h: activities24h.count || 0,
        activitiesWeek: activitiesWeek.count || 0,
        totalTickets: ticketsResult.count || 0,
        openTickets: openTickets.count || 0,
        pendingTickets: openTickets.count || 0,
        totalReviews: reviewsResult.count || 0,
        totalFeedback: feedbackResult.count || 0,
        avgRating: Math.round(avgRating * 10) / 10,
        unreadAlerts: alertsResult.count || 0,
        criticalAlerts: criticalAlerts.count || 0,
        isLoading: false,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStats, autoRefresh, refreshInterval]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channels = [
      supabase.channel('stats-profiles').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchStats),
      supabase.channel('stats-vendors').on('postgres_changes', { event: '*', schema: 'public', table: 'vendor_business_profiles' }, fetchStats),
      supabase.channel('stats-properties').on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, fetchStats),
      supabase.channel('stats-activities').on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, fetchStats),
    ];

    channels.forEach(ch => ch.subscribe());

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [fetchStats]);

  return { stats, refreshStats: fetchStats };
};

export default usePlatformStats;
