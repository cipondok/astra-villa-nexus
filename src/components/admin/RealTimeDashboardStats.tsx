
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, Building, Activity, ShoppingCart, AlertTriangle, CheckCircle } from 'lucide-react';

const RealTimeDashboardStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const [
        usersResult,
        propertiesResult,
        vendorsResult,
        ordersResult,
        errorsResult
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('vendor_business_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('system_error_logs').select('*', { count: 'exact', head: true })
      ]);

      // Get active users (users who logged in within last 24 hours)
      const { data: activeUsers } = await supabase
        .from('user_activity_logs')
        .select('user_id')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .not('user_id', 'is', null);

      const uniqueActiveUsers = new Set(activeUsers?.map(log => log.user_id) || []).size;

      return {
        totalUsers: usersResult.count || 0,
        activeUsers: uniqueActiveUsers,
        totalProperties: propertiesResult.count || 0,
        totalVendors: vendorsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        systemErrors: errorsResult.count || 0,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      status: 'active'
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      status: 'online',
      subtitle: '24h'
    },
    {
      title: 'Properties',
      value: stats?.totalProperties || 0,
      icon: Building,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      status: 'active'
    },
    {
      title: 'Vendors',
      value: stats?.totalVendors || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      status: 'active'
    },
    {
      title: 'Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      status: 'active'
    },
    {
      title: 'System Health',
      value: stats?.systemErrors === 0 ? 'Healthy' : 'Issues',
      icon: stats?.systemErrors === 0 ? CheckCircle : AlertTriangle,
      color: stats?.systemErrors === 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats?.systemErrors === 0 ? 'bg-green-50' : 'bg-red-50',
      status: stats?.systemErrors === 0 ? 'healthy' : 'warning',
      subtitle: stats?.systemErrors === 0 ? 'All systems operational' : `${stats?.systemErrors} errors`
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <Badge 
                variant={stat.status === 'healthy' ? 'default' : stat.status === 'warning' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {stat.status}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
              {stat.subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.subtitle}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RealTimeDashboardStats;
