
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
          vendorsBusinessProfilesResult
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('properties').select('*', { count: 'exact', head: true }),
          supabase.from('vendor_business_profiles').select('*', { count: 'exact', head: true })
        ]);

        // Get vendor count from user_roles table
        const { count: vendorRolesCount } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'vendor')
          .eq('is_active', true);

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

        const totalVendors = Math.max(
          vendorRolesCount || 0,
          typeof vendorsBusinessProfilesResult.count === 'number' ? vendorsBusinessProfilesResult.count : 0
        );

        return {
          totalUsers: usersResult.count || 0,
          activeUsers: uniqueActiveUsers,
          totalProperties: propertiesResult.count || 0,
          totalVendors,
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
          <div key={i} className="animate-pulse bg-slate-800/50 border border-slate-700/30 rounded-full p-3 aspect-square flex items-center justify-center w-20 h-20">
            <div className="text-center space-y-1">
              <div className="h-4 w-4 bg-slate-700/50 rounded-full mx-auto"></div>
              <div className="h-2 bg-slate-700/50 rounded w-8"></div>
              <div className="h-1.5 bg-slate-700/50 rounded w-6"></div>
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
      subtitle: 'Vendors'
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-1 mb-3 sm:mb-2">
      {statCards.map((stat, index) => (
        <div 
          key={index} 
          className="relative overflow-hidden rounded-full bg-slate-800/90 border border-slate-700/50 p-4 sm:p-3 hover:border-slate-600/50 transition-all duration-200 w-24 h-24 sm:w-20 sm:h-20 flex flex-col items-center justify-center group cursor-pointer touch-manipulation"
          title={`${stat.title}: ${stat.value} ${stat.subtitle ? `(${stat.subtitle})` : ''}`}
        >
          {/* Status Badge */}
          <div className="absolute top-1 right-1">
            <div className={`w-2 h-2 rounded-full ${
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
          <div className="absolute inset-1.5 rounded-full border border-slate-600/30"></div>
          
          {/* Circular Progress (animated) */}
          <div className={`absolute inset-1.5 rounded-full border border-transparent ${
            stat.status === 'healthy' ? 'border-t-green-400 border-r-green-400' :
            stat.status === 'online' ? 'border-t-blue-400 border-r-blue-400' :
            stat.status === 'warning' ? 'border-t-red-400 border-r-red-400' :
            'border-t-gray-400 border-r-gray-400'
          } animate-spin`} style={{ animationDuration: '3s' }}></div>
          
          {/* Icon */}
          <div className={`w-5 h-5 rounded-full flex items-center justify-center mb-1 ${stat.bgColor}`}>
            <stat.icon className={`h-2.5 w-2.5 ${stat.color}`} />
          </div>
          
          {/* Content - Only Number */}
          <div className="text-center">
            <p className="text-base sm:text-sm font-bold text-white leading-none">{stat.value}</p>
          </div>

          {/* Hover/Touch Tooltip - Show All Text */}
          <div className="absolute inset-0 bg-slate-900/95 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-200 p-3 sm:p-2">
            <p className="text-sm sm:text-xs font-semibold text-white text-center leading-tight">{stat.title}</p>
            <p className="text-xl sm:text-lg font-bold text-white">{stat.value}</p>
            {stat.subtitle && (
              <p className="text-sm sm:text-xs text-slate-300 text-center leading-tight">{stat.subtitle}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RealTimeDashboardStats;
