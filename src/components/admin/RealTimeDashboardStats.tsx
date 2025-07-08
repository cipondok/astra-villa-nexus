
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
      try {
        const [
          usersResult,
          propertiesResult,
          vendorsResult
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('properties').select('*', { count: 'exact', head: true }),
          supabase.from('vendor_business_profiles').select('*', { count: 'exact', head: true })
        ]);

        // Try to get orders and errors with fallback
        let ordersCount = 0;
        let errorsCount = 0;

        try {
          const { count: orderCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });
          ordersCount = orderCount || 0;
        } catch (error) {
          console.log('Orders table not accessible:', error);
        }

        try {
          const { count: errorCount } = await supabase
            .from('system_error_logs')
            .select('*', { count: 'exact', head: true });
          errorsCount = errorCount || 0;
        } catch (error) {
          console.log('System error logs not accessible:', error);
        }

        // Get active users (users who logged in within last 24 hours)
        let uniqueActiveUsers = 0;
        try {
          const { data: activeUsers } = await supabase
            .from('user_activity_logs')
            .select('user_id')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .not('user_id', 'is', null);

          uniqueActiveUsers = new Set(activeUsers?.map(log => log.user_id) || []).size;
        } catch (error) {
          console.log('User activity logs not accessible:', error);
        }

        return {
          totalUsers: usersResult.count || 0,
          activeUsers: uniqueActiveUsers,
          totalProperties: propertiesResult.count || 0,
          totalVendors: vendorsResult.count || 0,
          totalOrders: ordersCount,
          systemErrors: errorsCount,
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
          totalUsers: 0,
          activeUsers: 0,
          totalProperties: 0,
          totalVendors: 0,
          totalOrders: 0,
          systemErrors: 0,
        };
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-800/50 border border-slate-700/30 rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="h-8 w-8 bg-slate-700/50 rounded-lg"></div>
              <div className="h-4 w-12 bg-slate-700/50 rounded-full"></div>
            </div>
            <div className="space-y-1">
              <div className="h-3 bg-slate-700/50 rounded w-20"></div>
              <div className="h-5 bg-slate-700/50 rounded w-12"></div>
              <div className="h-2 bg-slate-700/50 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      status: 'active',
      subtitle: 'Registered'
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: Activity,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      status: 'online',
      subtitle: '24h'
    },
    {
      title: 'Properties',
      value: stats?.totalProperties || 0,
      icon: Building,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      status: 'active',
      subtitle: 'Listed'
    },
    {
      title: 'Vendors',
      value: stats?.totalVendors || 0,
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      status: 'active',
      subtitle: 'Verified'
    },
    {
      title: 'Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      status: 'active',
      subtitle: 'Processing'
    },
    {
      title: 'System Health',
      value: stats?.systemErrors === 0 ? 'Healthy' : 'Issues',
      icon: stats?.systemErrors === 0 ? CheckCircle : AlertTriangle,
      color: stats?.systemErrors === 0 ? 'text-green-400' : 'text-red-400',
      bgColor: stats?.systemErrors === 0 ? 'bg-green-500/20' : 'bg-red-500/20',
      status: stats?.systemErrors === 0 ? 'healthy' : 'warning',
      subtitle: stats?.systemErrors === 0 ? 'All systems operational' : `${stats?.systemErrors} errors`
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className="relative overflow-hidden rounded-xl bg-slate-800/90 border border-slate-700/50 p-3 hover:border-slate-600/50 transition-all duration-200">
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              stat.status === 'healthy' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : stat.status === 'warning' 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : stat.status === 'online'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}>
              {stat.status}
            </span>
          </div>
          
          {/* Icon */}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.bgColor}`}>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </div>
          
          {/* Content */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 leading-tight">{stat.title}</p>
            <p className="text-lg font-bold text-white leading-none">{stat.value}</p>
            {stat.subtitle && (
              <p className="text-xs text-slate-500 leading-none">{stat.subtitle}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RealTimeDashboardStats;
