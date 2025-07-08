
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
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-1 mb-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-800/50 border border-slate-700/30 rounded-full p-2 aspect-square flex items-center justify-center w-16 h-16">
            <div className="text-center space-y-0.5">
              <div className="h-3 w-3 bg-slate-700/50 rounded-full mx-auto"></div>
              <div className="h-1.5 bg-slate-700/50 rounded w-6"></div>
              <div className="h-1 bg-slate-700/50 rounded w-4"></div>
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
    <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-1 mb-2">
      {statCards.map((stat, index) => (
        <div key={index} className="relative overflow-hidden rounded-full bg-slate-800/90 border border-slate-700/50 p-2 hover:border-slate-600/50 transition-all duration-200 w-16 h-16 flex flex-col items-center justify-center">
          {/* Status Badge */}
          <div className="absolute top-0.5 right-0.5">
            <div className={`w-1.5 h-1.5 rounded-full ${
              stat.status === 'healthy' 
                ? 'bg-green-400 animate-pulse' 
                : stat.status === 'warning' 
                ? 'bg-red-400 animate-pulse'
                : stat.status === 'online'
                ? 'bg-blue-400 animate-pulse'
                : 'bg-gray-400'
            }`}></div>
          </div>
          
          {/* Circular Progress Background */}
          <div className="absolute inset-1 rounded-full border border-slate-600/30"></div>
          
          {/* Circular Progress (animated) */}
          <div className={`absolute inset-1 rounded-full border border-transparent ${
            stat.status === 'healthy' ? 'border-t-green-400 border-r-green-400' :
            stat.status === 'online' ? 'border-t-blue-400 border-r-blue-400' :
            stat.status === 'warning' ? 'border-t-red-400 border-r-red-400' :
            'border-t-gray-400 border-r-gray-400'
          } animate-spin`} style={{ animationDuration: '3s' }}></div>
          
          {/* Icon */}
          <div className={`w-4 h-4 rounded-full flex items-center justify-center mb-0.5 ${stat.bgColor}`}>
            <stat.icon className={`h-2 w-2 ${stat.color}`} />
          </div>
          
          {/* Content */}
          <div className="text-center space-y-0">
            <p className="text-xs font-bold text-white leading-none">{stat.value}</p>
            <p className="text-xs font-medium text-slate-400 leading-tight truncate max-w-12">{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RealTimeDashboardStats;
