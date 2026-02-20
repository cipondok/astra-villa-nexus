
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, Building, Activity, ShoppingCart, AlertTriangle, CheckCircle } from 'lucide-react';

const RealTimeDashboardStats = React.memo(function RealTimeDashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      try {
        const [
          platformResult,
          vendorBizResult,
          vendorRolesResult,
          ordersResult,
          errorsResult,
          activeUsersResult,
        ] = await Promise.allSettled([
          supabase.rpc('get_platform_stats'),
          supabase.from('vendor_business_profiles').select('*', { count: 'exact', head: true }),
          supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'vendor').eq('is_active', true),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('system_error_logs').select('*', { count: 'exact', head: true }),
          supabase.from('user_activity_logs').select('user_id').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).not('user_id', 'is', null),
        ]);

        const statsData = (platformResult.status === 'fulfilled'
          ? (platformResult.value.data as Array<{ total_users: number; total_properties: number; total_bookings: number; total_vendors: number; active_sessions: number }> | null)?.[0]
          : null);

        const vendorBizCount = vendorBizResult.status === 'fulfilled' ? (vendorBizResult.value.count ?? 0) : 0;
        const vendorRolesCount = vendorRolesResult.status === 'fulfilled' ? (vendorRolesResult.value.count ?? 0) : 0;
        const ordersCount = ordersResult.status === 'fulfilled' ? (ordersResult.value.count ?? 0) : 0;
        const errorsCount = errorsResult.status === 'fulfilled' ? (errorsResult.value.count ?? 0) : 0;
        const activeUsersData = activeUsersResult.status === 'fulfilled' ? activeUsersResult.value.data : null;
        const uniqueActiveUsers = new Set(activeUsersData?.map(log => log.user_id) || []).size;
        const totalVendors = Math.max(vendorRolesCount, vendorBizCount);

        return {
          totalUsers: Number(statsData?.total_users) || 0,
          activeUsers: uniqueActiveUsers,
          totalProperties: Number(statsData?.total_properties) || 0,
          totalVendors,
          totalOrders: ordersCount,
          systemErrors: errorsCount,
        };
      } catch {
        return { totalUsers: 0, activeUsers: 0, totalProperties: 0, totalVendors: 0, totalOrders: 0, systemErrors: 0 };
      }
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 60000,
  });

  // Memoize statCards — must be before early return to follow hooks rules
  const statCards = useMemo(() => [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-chart-2', bgColor: 'bg-chart-2/20', status: 'active', subtitle: 'Registered' },
    { title: 'Active Users', value: stats?.activeUsers || 0, icon: Activity, color: 'text-chart-1', bgColor: 'bg-chart-1/20', status: 'online', subtitle: '24h' },
    { title: 'Properties', value: stats?.totalProperties || 0, icon: Building, color: 'text-primary', bgColor: 'bg-primary/20', status: 'active', subtitle: 'Listed' },
    { title: 'Vendors', value: stats?.totalVendors || 0, icon: Users, color: 'text-chart-4', bgColor: 'bg-chart-4/20', status: 'active', subtitle: 'Vendors' },
    { title: 'Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'text-chart-3', bgColor: 'bg-chart-3/20', status: 'active', subtitle: 'Processing' },
    {
      title: 'System Health',
      value: stats?.systemErrors === 0 ? 'Healthy' : 'Issues',
      icon: stats?.systemErrors === 0 ? CheckCircle : AlertTriangle,
      color: stats?.systemErrors === 0 ? 'text-chart-1' : 'text-destructive',
      bgColor: stats?.systemErrors === 0 ? 'bg-chart-1/20' : 'bg-destructive/20',
      status: stats?.systemErrors === 0 ? 'healthy' : 'warning',
      subtitle: stats?.systemErrors === 0 ? 'All systems operational' : `${stats?.systemErrors} errors`
    }
  ], [stats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-1 mb-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted/50 border border-border/30 rounded-full p-3 aspect-square flex items-center justify-center w-20 h-20">
            <div className="text-center space-y-1">
              <div className="h-4 w-4 bg-muted rounded-full mx-auto"></div>
              <div className="h-2 bg-muted rounded w-8"></div>
              <div className="h-1.5 bg-muted rounded w-6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-1 mb-3 sm:mb-2">
      {statCards.map((stat, index) => (
        <div 
          key={index} 
          className="relative overflow-hidden rounded-full bg-card border border-border p-4 sm:p-3 hover:border-primary/50 transition-all duration-200 w-24 h-24 sm:w-20 sm:h-20 flex flex-col items-center justify-center group cursor-pointer touch-manipulation"
          title={`${stat.title}: ${stat.value} ${stat.subtitle ? `(${stat.subtitle})` : ''}`}
        >
          <div className="absolute top-1 right-1">
            <div className={`w-2 h-2 rounded-full ${
              stat.status === 'healthy' ? 'bg-chart-1 animate-pulse' :
              stat.status === 'warning' ? 'bg-destructive animate-pulse' :
              stat.status === 'online' ? 'bg-chart-2 animate-pulse' :
              'bg-muted-foreground'
            }`}></div>
          </div>
          <div className="absolute inset-1.5 rounded-full border border-border/50"></div>
          <div className={`absolute inset-1.5 rounded-full border border-transparent ${
            stat.status === 'healthy' ? 'border-t-chart-1 border-r-chart-1' :
            stat.status === 'online' ? 'border-t-chart-2 border-r-chart-2' :
            stat.status === 'warning' ? 'border-t-destructive border-r-destructive' :
            'border-t-muted-foreground border-r-muted-foreground'
          } animate-spin`} style={{ animationDuration: '3s' }}></div>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center mb-1 ${stat.bgColor}`}>
            <stat.icon className={`h-2.5 w-2.5 ${stat.color}`} />
          </div>
          <div className="text-center">
            <p className="text-base sm:text-sm font-bold text-foreground leading-none">{stat.value}</p>
          </div>
          <div className="absolute inset-0 bg-popover/95 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-200 p-3 sm:p-2">
            <p className="text-sm sm:text-xs font-semibold text-foreground text-center leading-tight">{stat.title}</p>
            <p className="text-xl sm:text-lg font-bold text-foreground">{stat.value}</p>
            {stat.subtitle && (
              <p className="text-sm sm:text-xs text-muted-foreground text-center leading-tight">{stat.subtitle}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

export default RealTimeDashboardStats;
