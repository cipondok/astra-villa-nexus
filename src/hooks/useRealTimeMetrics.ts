
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealTimeMetrics {
  totalUsers: number;
  totalProperties: number;
  activeUsers: number;
  pendingAlerts: number;
  systemHealth: number;
  lastUpdated: Date;
  isLoading: boolean;
}

export const useRealTimeMetrics = () => {
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    totalUsers: 0,
    totalProperties: 0,
    activeUsers: 0,
    pendingAlerts: 0,
    systemHealth: 100,
    lastUpdated: new Date(),
    isLoading: true
  });

  const fetchMetrics = async () => {
    try {
      // Use secure RPC function to get platform stats (bypasses RLS safely for admins)
      const { data: stats, error: statsError } = await supabase.rpc('get_platform_stats');
      
      const [alertsResult] = await Promise.all([
        supabase.from('admin_alerts').select('*', { count: 'exact', head: true }).eq('is_read', false)
      ]);

      if (statsError) {
        console.error('Error fetching platform stats:', statsError);
      }

      // Type assertion for the stats result
      const platformStats = (stats as Array<{
        total_users: number;
        total_properties: number;
        total_bookings: number;
        total_vendors: number;
        active_sessions: number;
      }> | null)?.[0];
      
      setMetrics({
        totalUsers: Number(platformStats?.total_users) || 0,
        totalProperties: Number(platformStats?.total_properties) || 0,
        activeUsers: Number(platformStats?.active_sessions) || 0,
        pendingAlerts: alertsResult.count || 0,
        systemHealth: Math.floor(Math.random() * 10) + 90, // Simulated health score
        lastUpdated: new Date(),
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      setMetrics(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMetrics();

    // Set up real-time subscriptions
    const alertsChannel = supabase
      .channel('admin-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_alerts' }, fetchMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, fetchMetrics)
      .subscribe();

    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);

    return () => {
      supabase.removeChannel(alertsChannel);
      clearInterval(interval);
    };
  }, []);

  return { metrics, refreshMetrics: fetchMetrics };
};
