import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAICommandCenterData } from "@/hooks/useAICommandCenterData";
import { useRelativeTime } from "@/hooks/useRelativeTime";

// ── Sparkline trends (7-day cumulative counts) ─────────────────
function useSparkTrends() {
  return useQuery({
    queryKey: ['admin-spark-trends-7d'],
    queryFn: async () => {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return d;
      });

      const [usersRes, propsRes, vendorsRes, viewsRes, activeRes] = await Promise.all([
        Promise.all(days.map(d =>
          supabase.from('profiles').select('id', { count: 'exact', head: true })
            .lte('created_at', new Date(d.getTime() + 86400000).toISOString())
            .then(r => r.count || 0)
        )),
        Promise.all(days.map(d =>
          supabase.from('properties').select('id', { count: 'exact', head: true })
            .lte('created_at', new Date(d.getTime() + 86400000).toISOString())
            .then(r => r.count || 0)
        )),
        Promise.all(days.map(d =>
          supabase.from('vendor_business_profiles').select('id', { count: 'exact', head: true })
            .eq('is_verified', true)
            .lte('created_at', new Date(d.getTime() + 86400000).toISOString())
            .then(r => r.count || 0)
        )),
        Promise.all(days.map(d =>
          supabase.from('web_analytics').select('id', { count: 'exact', head: true })
            .gte('created_at', d.toISOString())
            .lt('created_at', new Date(d.getTime() + 86400000).toISOString())
            .then(r => r.count || 0)
        )),
        Promise.all(days.map(d =>
          supabase.from('user_activity_logs').select('id', { count: 'exact', head: true })
            .gte('created_at', d.toISOString())
            .lt('created_at', new Date(d.getTime() + 86400000).toISOString())
            .then(r => r.count || 0)
        )),
      ]);

      return { users: usersRes, properties: propsRes, vendors: vendorsRes, views: viewsRes, active: activeRes };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// ── Platform stats ──────────────────────────────────────────────
function usePlatformStats() {
  return useQuery({
    queryKey: ['admin-platform-stats'],
    queryFn: async () => {
      try {
        const { data: rpcData } = await supabase.rpc('get_platform_stats');
        const statsData = (rpcData as Array<{
          total_users: number;
          total_properties: number;
          total_bookings: number;
          total_vendors: number;
          active_sessions: number;
        }> | null)?.[0];

        const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const [usersResult, propertiesResult, vendorsResult, ordersResult, activeSessionsResult, activeUsers24hResult] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('properties').select('id', { count: 'exact', head: true }),
          supabase.from('vendor_business_profiles').select('id', { count: 'exact', head: true }).eq('is_verified', true),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase.from('user_sessions').select('user_id', { count: 'exact', head: true }).gte('last_activity_at', thirtyMinAgo),
          supabase.from('user_sessions').select('user_id', { count: 'exact', head: true }).gte('last_activity_at', twentyFourHoursAgo),
        ]);

        return {
          totalUsers: (usersResult.count ?? Number(statsData?.total_users)) || 0,
          totalProperties: (propertiesResult.count ?? Number(statsData?.total_properties)) || 0,
          totalVendors: vendorsResult.count || 0,
          totalOrders: ordersResult.count || 0,
          totalPageViews: 0,
          activeUsers24h: activeUsers24hResult.count || 0,
          activeSessions: (activeSessionsResult.count ?? Number(statsData?.active_sessions)) || 0,
        };
      } catch {
        return { totalUsers: 0, totalProperties: 0, totalVendors: 0, totalOrders: 0, totalPageViews: 0, activeUsers24h: 0, activeSessions: 0 };
      }
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 60000,
  });
}

// ── System health ───────────────────────────────────────────────
function useSystemHealth() {
  return useQuery({
    queryKey: ['system-health-overview'],
    queryFn: async () => {
      const startTime = Date.now();
      try {
        const [dbErrorsRes, jobsRunning, jobsFailed, jobsPending, seoRes, valuationsRes] = await Promise.all([
          supabase.from('database_error_tracking').select('*', { count: 'exact', head: true }).eq('is_resolved', false),
          supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'running'),
          supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
          supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('property_seo_analysis').select('seo_score').not('seo_score', 'is', null).limit(100),
          supabase.from('property_valuations').select('id', { count: 'exact', head: true }),
        ]);

        const seoScores = (seoRes.data || []) as { seo_score: number }[];
        const avgSeo = seoScores.length > 0
          ? Math.round(seoScores.reduce((s, p) => s + (p.seo_score || 0), 0) / seoScores.length)
          : 0;

        return {
          dbErrors: dbErrorsRes.count || 0,
          responseTime: Date.now() - startTime,
          uptime: 99.97,
          status: (dbErrorsRes.count || 0) === 0 ? 'healthy' : 'warning',
          aiSystems: {
            jobsRunning: jobsRunning.count || 0,
            jobsFailed: jobsFailed.count || 0,
            jobsPending: jobsPending.count || 0,
            avgSeoScore: avgSeo,
            totalValuations: valuationsRes.count || 0,
            seoStatus: avgSeo >= 50 ? 'operational' as const : avgSeo > 0 ? 'degraded' as const : 'unknown' as const,
            jobStatus: (jobsFailed.count || 0) > 5 ? 'degraded' as const : 'operational' as const,
            valuationStatus: (valuationsRes.count || 0) > 0 ? 'operational' as const : 'unknown' as const,
          },
        };
      } catch {
        return {
          dbErrors: 0, responseTime: 0, uptime: 0, status: 'error',
          aiSystems: { jobsRunning: 0, jobsFailed: 0, jobsPending: 0, avgSeoScore: 0, totalValuations: 0, seoStatus: 'unknown' as const, jobStatus: 'unknown' as const, valuationStatus: 'unknown' as const },
        };
      }
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 60000,
  });
}

// ── Activity log type ───────────────────────────────────────────
export interface ActivityLogEntry {
  id: string;
  activity_type: string;
  activity_description: string;
  created_at: string;
}

// ── Recent activity ─────────────────────────────────────────────
function useRecentActivity() {
  return useQuery<ActivityLogEntry[]>({
    queryKey: ['recent-activity-logs'],
    queryFn: async () => {
      try {
        const { data } = await supabase
          .from('activity_logs')
          .select('id, activity_type, activity_description, created_at')
          .order('created_at', { ascending: false })
          .limit(8);
        return (data || []) as ActivityLogEntry[];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
    refetchInterval: 60000,
  });
}

// ── Pending items ───────────────────────────────────────────────
function usePendingItems() {
  return useQuery({
    queryKey: ['pending-items-overview'],
    queryFn: async () => {
      try {
        const [propertyOwner, vendor, agent, alerts] = await Promise.all([
          supabase.from('property_owner_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'under_review']),
          supabase.from('vendor_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'under_review']),
          supabase.from('agent_registration_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'under_review']),
          supabase.from('admin_alerts').select('*', { count: 'exact', head: true }).eq('is_read', false),
        ]);
        return {
          upgrades: (propertyOwner.count || 0) + (vendor.count || 0) + (agent.count || 0),
          alerts: alerts.count || 0,
        };
      } catch {
        return { upgrades: 0, alerts: 0 };
      }
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 60000,
  });
}

// ── Hourly traffic ──────────────────────────────────────────────
function useHourlyTraffic() {
  return useQuery({
    queryKey: ['hourly-traffic'],
    queryFn: async () => {
      try {
        const since = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
        const { data } = await supabase
          .from('activity_logs')
          .select('created_at')
          .gte('created_at', since)
          .order('created_at', { ascending: true });

        const hourBuckets: Record<string, number> = {};
        for (let i = 11; i >= 0; i--) {
          const d = new Date();
          d.setHours(d.getHours() - i, 0, 0, 0);
          hourBuckets[d.toLocaleTimeString('en', { hour: '2-digit', hour12: false })] = 0;
        }
        (data || []).forEach(row => {
          const label = new Date(row.created_at).toLocaleTimeString('en', { hour: '2-digit', hour12: false });
          if (label in hourBuckets) hourBuckets[label]++;
        });

        return Object.entries(hourBuckets).map(([hour, count]) => ({ hour, count }));
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// ── Composite hook ──────────────────────────────────────────────
export function useAdminOverviewData() {
  const { data: sparkTrends } = useSparkTrends();
  const { data: platformStats, isLoading: statsLoading, refetch: refetchStats, dataUpdatedAt: statsUpdatedAt } = usePlatformStats();
  const { data: systemHealth, dataUpdatedAt: healthUpdatedAt } = useSystemHealth();
  const { data: recentActivity, dataUpdatedAt: activityUpdatedAt } = useRecentActivity();
  const { data: pendingItems } = usePendingItems();
  const { data: hourlyTraffic, dataUpdatedAt: trafficUpdatedAt } = useHourlyTraffic();
  const { data: aiData, dataUpdatedAt: aiUpdatedAt, isLoading: aiLoading } = useAICommandCenterData();

  const maxTraffic = useMemo(
    () => Math.max(...(hourlyTraffic?.map(h => h.count) || [1]), 1),
    [hourlyTraffic],
  );

  const statsAgo = useRelativeTime(statsUpdatedAt);
  const healthAgo = useRelativeTime(healthUpdatedAt);
  const activityAgo = useRelativeTime(activityUpdatedAt);
  const trafficAgo = useRelativeTime(trafficUpdatedAt);
  const aiAgo = useRelativeTime(aiUpdatedAt);

  return {
    sparkTrends,
    platformStats,
    statsLoading,
    refetchStats,
    systemHealth,
    recentActivity,
    pendingItems,
    hourlyTraffic,
    maxTraffic,
    aiData,
    aiLoading,
    statsAgo,
    healthAgo,
    activityAgo,
    trafficAgo,
    aiAgo,
  };
}
