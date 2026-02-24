import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformStats {
  totalUsers: number;
  activeUsers24h: number;
  newUsersToday: number;
  newUsersWeek: number;
  totalVendors: number;
  activeVendors: number;
  pendingVendors: number;
  totalProperties: number;
  activeProperties: number;
  newPropertiesWeek: number;
  totalServices: number;
  activeServices: number;
  totalActivities: number;
  activities24h: number;
  activitiesWeek: number;
  totalTickets: number;
  openTickets: number;
  pendingTickets: number;
  totalReviews: number;
  totalFeedback: number;
  avgRating: number;
  unreadAlerts: number;
  criticalAlerts: number;
  isLoading: boolean;
  lastUpdated: Date | null;
}

const defaultStats: PlatformStats = {
  totalUsers: 0, activeUsers24h: 0, newUsersToday: 0, newUsersWeek: 0,
  totalVendors: 0, activeVendors: 0, pendingVendors: 0,
  totalProperties: 0, activeProperties: 0, newPropertiesWeek: 0,
  totalServices: 0, activeServices: 0,
  totalActivities: 0, activities24h: 0, activitiesWeek: 0,
  totalTickets: 0, openTickets: 0, pendingTickets: 0,
  totalReviews: 0, totalFeedback: 0, avgRating: 0,
  unreadAlerts: 0, criticalAlerts: 0,
  isLoading: true, lastUpdated: null,
};

export const usePlatformStats = (autoRefresh = true, refreshInterval = 30000) => {
  const [stats, setStats] = useState<PlatformStats>(defaultStats);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

      // All queries in parallel, including avg rating
      const [
        usersResult, newUsersToday, newUsersWeek,
        vendorsResult,
        propertiesResult, activeProperties, newPropertiesWeek,
        servicesResult, activeServices,
        activitiesResult, activities24h, activitiesWeek,
        ticketsResult, openTickets,
        reviewsResult, ratingResult,
        feedbackResult,
        alertsResult, criticalAlerts,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
        supabase.from('vendor_business_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('properties').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
        supabase.from('vendor_services').select('id', { count: 'exact', head: true }),
        supabase.from('vendor_services').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('activity_logs').select('id', { count: 'exact', head: true }),
        supabase.from('activity_logs').select('id', { count: 'exact', head: true }).gte('created_at', dayAgo),
        supabase.from('activity_logs').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
        supabase.from('vendor_reviews').select('id', { count: 'exact', head: true }),
        supabase.from('vendor_reviews').select('rating').limit(500),
        supabase.from('user_feedback').select('id', { count: 'exact', head: true }),
        supabase.from('admin_alerts').select('id', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('admin_alerts').select('id', { count: 'exact', head: true }).eq('priority', 'critical').eq('is_read', false),
      ]);

      const ratingData = ratingResult.data;
      const avgRating = ratingData && ratingData.length > 0
        ? ratingData.reduce((sum, r) => sum + (r.rating || 0), 0) / ratingData.length
        : 0;

      setStats({
        totalUsers: usersResult.count || 0,
        activeUsers24h: activities24h.count || 0,
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

  // Debounced fetch for real-time callbacks
  const debouncedFetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchStats, 500);
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStats, autoRefresh, refreshInterval]);

  // Single consolidated real-time channel with debounced callback
  useEffect(() => {
    const channel = supabase.channel('stats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, debouncedFetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendor_business_profiles' }, debouncedFetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, debouncedFetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, debouncedFetch)
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [debouncedFetch]);

  return { stats, refreshStats: fetchStats };
};

export default usePlatformStats;
