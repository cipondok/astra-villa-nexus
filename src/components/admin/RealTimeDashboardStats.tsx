
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
          <Card key={i} className="animate-pulse bg-card border">
            <CardContent className="p-3">
              <div className="h-3 bg-muted rounded mb-2"></div>
              <div className="h-5 bg-muted rounded mb-1"></div>
              <div className="h-2 bg-muted rounded"></div>
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
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      status: 'active'
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-600/10',
      status: 'online',
      subtitle: '24h'
    },
    {
      title: 'Properties',
      value: stats?.totalProperties || 0,
      icon: Building,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      status: 'active'
    },
    {
      title: 'Vendors',
      value: stats?.totalVendors || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600/10',
      status: 'active'
    },
    {
      title: 'Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-600/10',
      status: 'active'
    },
    {
      title: 'System Health',
      value: stats?.systemErrors === 0 ? 'Healthy' : 'Issues',
      icon: stats?.systemErrors === 0 ? CheckCircle : AlertTriangle,
      color: stats?.systemErrors === 0 ? 'text-green-600' : 'text-destructive',
      bgColor: stats?.systemErrors === 0 ? 'bg-green-600/10' : 'bg-destructive/10',
      status: stats?.systemErrors === 0 ? 'healthy' : 'warning',
      subtitle: stats?.systemErrors === 0 ? 'All systems operational' : `${stats?.systemErrors} errors`
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="border shadow-sm hover:shadow-md transition-all duration-200 bg-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 rounded-md ${stat.bgColor}`}>
                <stat.icon className={`h-3 w-3 ${stat.color}`} />
              </div>
              <Badge 
                variant={stat.status === 'healthy' ? 'default' : stat.status === 'warning' ? 'destructive' : 'secondary'}
                className={`text-xs px-1.5 py-0.5 h-5 ${
                  stat.status === 'healthy' 
                    ? 'bg-green-600/10 text-green-600 border-green-600/20' 
                    : stat.status === 'warning' 
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : 'bg-muted text-muted-foreground border'
                }`}
              >
                {stat.status}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground leading-tight">{stat.title}</p>
              <p className="text-lg font-bold text-foreground leading-none">{stat.value}</p>
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground leading-none">{stat.subtitle}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RealTimeDashboardStats;
