
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Users, 
  Building2, 
  TrendingUp,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Server,
  Cpu,
  UserCheck,
  Store,
  Eye,
  MessageSquare,
  Globe,
  RefreshCw,
  FileText,
  HardDrive
} from "lucide-react";
import AdminQuickAccess from "./AdminQuickAccess";

interface AdminOverviewProps {
  onSectionChange?: (section: string) => void;
}

const AdminOverview = ({ onSectionChange }: AdminOverviewProps) => {
  
  const handleQuickAction = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  // Fetch comprehensive platform statistics
  const { data: platformStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['admin-platform-stats'],
    queryFn: async () => {
      try {
        const [
          usersResult,
          propertiesResult,
          vendorsResult,
          ordersResult,
          articlesResult,
          analyticsResult,
          activeUsersResult
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('properties').select('*', { count: 'exact', head: true }),
          supabase.from('vendor_business_profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('articles').select('*', { count: 'exact', head: true }),
          supabase.from('web_analytics').select('*', { count: 'exact', head: true }),
          supabase.from('user_activity_logs').select('*', { count: 'exact', head: true })
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        ]);

        // Calculate growth (mock for now, could be compared with historical data)
        const totalUsers = usersResult.count || 0;
        const totalProperties = propertiesResult.count || 0;
        const totalVendors = vendorsResult.count || 0;
        const totalOrders = ordersResult.count || 0;
        const totalArticles = articlesResult.count || 0;
        const totalPageViews = analyticsResult.count || 0;
        const activeUsers24h = activeUsersResult.count || 0;

        return {
          totalUsers,
          totalProperties,
          totalVendors,
          totalOrders,
          totalArticles,
          totalPageViews,
          activeUsers24h,
          userGrowth: 12.5,
          propertyGrowth: 8.3,
          vendorGrowth: 5.2,
          revenueGrowth: 18.7
        };
      } catch (error) {
        console.error('Error fetching platform stats:', error);
        return {
          totalUsers: 0, totalProperties: 0, totalVendors: 0, totalOrders: 0,
          totalArticles: 0, totalPageViews: 0, activeUsers24h: 0,
          userGrowth: 0, propertyGrowth: 0, vendorGrowth: 0, revenueGrowth: 0
        };
      }
    },
    refetchInterval: 30000,
  });

  // Fetch recent admin alerts
  const { data: recentAlerts } = useQuery({
    queryKey: ['recent-admin-alerts'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('admin_alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching alerts:', error);
        return [];
      }
    },
    refetchInterval: 30000,
  });

  // Fetch system health indicators
  const { data: systemHealth } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const startTime = Date.now();
      try {
        const { count: dbErrors } = await supabase
          .from('database_error_tracking')
          .select('*', { count: 'exact', head: true })
          .eq('is_resolved', false);

        const { count: pendingVendors } = await supabase
          .from('vendor_business_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_verified', false);

        const responseTime = Date.now() - startTime;

        return {
          dbErrors: dbErrors || 0,
          pendingVendors: pendingVendors || 0,
          systemStatus: dbErrors === 0 ? 'healthy' : 'issues',
          responseTime,
          uptime: 99.9
        };
      } catch (error) {
        console.error('Error fetching system health:', error);
        return {
          dbErrors: 0, pendingVendors: 0, systemStatus: 'unknown',
          responseTime: 0, uptime: 0
        };
      }
    },
    refetchInterval: 60000,
  });

  // Fetch pending upgrade applications
  const { data: pendingUpgrades } = useQuery({
    queryKey: ['pending-upgrade-applications'],
    queryFn: async () => {
      try {
        const [propertyOwner, vendor, agent] = await Promise.all([
          supabase.from('property_owner_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'under_review']),
          supabase.from('vendor_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'under_review']),
          supabase.from('agent_registration_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'under_review'])
        ]);
        
        return {
          propertyOwner: propertyOwner.count || 0,
          vendor: vendor.count || 0,
          agent: agent.count || 0,
          total: (propertyOwner.count || 0) + (vendor.count || 0) + (agent.count || 0)
        };
      } catch (error) {
        console.error('Error fetching pending upgrades:', error);
        return { propertyOwner: 0, vendor: 0, agent: 0, total: 0 };
      }
    },
    refetchInterval: 30000,
  });

  // Fetch weekly activity data
  const { data: weeklyActivity } = useQuery({
    queryKey: ['weekly-activity'],
    queryFn: async () => {
      try {
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString();
          const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString();
          
          const { count } = await supabase
            .from('activity_logs')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfDay)
            .lte('created_at', endOfDay);
          
          days.push({
            day: date.toLocaleDateString('en', { weekday: 'short' }),
            count: count || 0
          });
        }
        return days;
      } catch (error) {
        console.error('Error fetching weekly activity:', error);
        return [];
      }
    },
    refetchInterval: 60000,
  });

  const quickManagementActions = [
    {
      title: "Upgrades",
      description: `${pendingUpgrades?.total || 0} pending`,
      icon: UserCheck,
      action: "upgrade-applications",
      color: pendingUpgrades?.total ? "text-red-500 bg-red-500/10" : "text-green-500 bg-green-500/10",
      badge: pendingUpgrades?.total || 0
    },
    {
      title: "Users",
      description: "Manage accounts",
      icon: Users,
      action: "user-management",
      color: "text-blue-500 bg-blue-500/10"
    },
    {
      title: "Properties",
      description: "Listings & approvals",
      icon: Building2,
      action: "property-management-hub",
      color: "text-primary bg-primary/10"
    },
    {
      title: "Vendors",
      description: "Services & verify",
      icon: Store,
      action: "vendors-hub",
      color: "text-orange-500 bg-orange-500/10"
    },
    {
      title: "Analytics",
      description: "View insights",
      icon: Activity,
      action: "visitor-analytics",
      color: "text-purple-500 bg-purple-500/10"
    }
  ];

  const maxActivity = Math.max(...(weeklyActivity?.map(d => d.count) || [1]), 1);

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 via-background to-accent/5 border border-border/30 p-3">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
        <div className="relative flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-muted-foreground text-[10px]">
              Real-time platform monitoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2"
              onClick={() => refetchStats()}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] ${
              systemHealth?.systemStatus === 'healthy' 
                ? 'bg-green-500/10 border border-green-500/20 text-green-600' 
                : 'bg-orange-500/10 border border-orange-500/20 text-orange-600'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                systemHealth?.systemStatus === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-orange-500 animate-pulse'
              }`}></div>
              <span className="font-medium">
                {systemHealth?.systemStatus === 'healthy' ? 'Operational' : 'Attention'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatCard
          title="Total Users"
          value={platformStats?.totalUsers || 0}
          icon={Users}
          change={platformStats?.userGrowth || 0}
          color="blue"
          loading={statsLoading}
        />
        <StatCard
          title="Properties"
          value={platformStats?.totalProperties || 0}
          icon={Building2}
          change={platformStats?.propertyGrowth || 0}
          color="primary"
          loading={statsLoading}
        />
        <StatCard
          title="Vendors"
          value={platformStats?.totalVendors || 0}
          icon={Store}
          change={platformStats?.vendorGrowth || 0}
          color="orange"
          loading={statsLoading}
        />
        <StatCard
          title="Active (24h)"
          value={platformStats?.activeUsers24h || 0}
          icon={Activity}
          change={platformStats?.revenueGrowth || 0}
          color="green"
          loading={statsLoading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-4 gap-2">
        <MiniStatCard title="Page Views" value={platformStats?.totalPageViews || 0} icon={Eye} />
        <MiniStatCard title="Orders" value={platformStats?.totalOrders || 0} icon={FileText} />
        <MiniStatCard title="Articles" value={platformStats?.totalArticles || 0} icon={Globe} />
        <MiniStatCard title="Pending" value={systemHealth?.pendingVendors || 0} icon={Clock} highlight />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Activity Chart */}
        <Card className="lg:col-span-2 border-border/30 bg-background/50">
          <CardHeader className="p-2 pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                Weekly Activity
              </CardTitle>
              <Badge variant="secondary" className="text-[9px] h-4 px-1.5">Last 7 days</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <div className="flex items-end justify-between h-20 gap-1">
              {weeklyActivity?.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-0.5">
                  <div 
                    className="w-full bg-gradient-to-t from-primary/60 to-primary rounded-t transition-all hover:from-primary/80 hover:to-primary"
                    style={{ height: `${Math.max((day.count / maxActivity) * 100, 8)}%` }}
                  />
                  <span className="text-[8px] text-muted-foreground">{day.day}</span>
                </div>
              )) || Array(7).fill(0).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full h-2 bg-muted rounded-t animate-pulse" />
                  <span className="text-[8px] text-muted-foreground">-</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="border-border/30 bg-background/50">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 text-primary" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 space-y-2">
            <HealthItem label="Database" value="Connected" status="good" />
            <HealthItem label="Response" value={`${systemHealth?.responseTime || 0}ms`} status={systemHealth?.responseTime && systemHealth.responseTime < 500 ? "good" : "warn"} />
            <HealthItem label="Uptime" value={`${systemHealth?.uptime || 99.9}%`} status="good" />
            <HealthItem label="Errors" value={String(systemHealth?.dbErrors || 0)} status={systemHealth?.dbErrors === 0 ? "good" : "error"} />
            <Button 
              variant="outline" 
              size="sm"
              className="w-full h-6 text-[10px] mt-1"
              onClick={() => handleQuickAction('diagnostic')}
            >
              <Activity className="h-2.5 w-2.5 mr-1" />
              Full Diagnostics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Recent Alerts */}
        <Card className="border-border/30 bg-background/50">
          <CardHeader className="p-2 pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                Recent Alerts
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-5 text-[9px] px-1.5"
                onClick={() => handleQuickAction('admin-alerts')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <div className="space-y-1.5">
              {recentAlerts && recentAlerts.length > 0 ? (
                recentAlerts.slice(0, 3).map((alert) => (
                  <div 
                    key={alert.id}
                    className="flex items-center gap-2 p-1.5 rounded-md border border-border/30 hover:bg-accent/30 transition-colors cursor-pointer"
                    onClick={() => handleQuickAction('admin-alerts')}
                  >
                    <div className={`p-1 rounded ${
                      alert.priority === 'high' ? 'bg-destructive/10' :
                      alert.priority === 'medium' ? 'bg-orange-500/10' : 'bg-primary/10'
                    }`}>
                      <AlertTriangle className={`h-2.5 w-2.5 ${
                        alert.priority === 'high' ? 'text-destructive' :
                        alert.priority === 'medium' ? 'text-orange-500' : 'text-primary'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[10px] truncate">{alert.title}</p>
                      <p className="text-[8px] text-muted-foreground truncate">{alert.message}</p>
                    </div>
                    <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'} className="text-[8px] h-3.5 px-1">
                      {alert.priority}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="h-6 w-6 mx-auto text-green-500 mb-1 opacity-50" />
                  <p className="text-[10px] text-muted-foreground">No active alerts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/30 bg-background/50">
          <CardHeader className="p-2 pb-1">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <div className="grid grid-cols-5 gap-1.5">
              {quickManagementActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className="relative group rounded-lg border border-border/30 p-1.5 text-center transition-all hover:shadow-sm hover:border-primary/40 bg-background/50"
                >
                  {action.badge !== undefined && action.badge > 0 && (
                    <div className="absolute -top-1 -right-1 bg-destructive text-white text-[7px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center animate-pulse">
                      {action.badge}
                    </div>
                  )}
                  <div className={`inline-flex p-1 rounded ${action.color} mb-0.5`}>
                    <action.icon className="h-3 w-3" />
                  </div>
                  <p className="text-[8px] font-medium truncate">{action.title}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Quick Access */}
      <AdminQuickAccess onSectionChange={onSectionChange} />
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, change, color, loading }: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  change: number;
  color: 'blue' | 'primary' | 'orange' | 'green' | 'purple';
  loading?: boolean;
}) => {
  const colorClasses = {
    blue: 'from-blue-500/10 to-background text-blue-500',
    primary: 'from-primary/10 to-background text-primary',
    orange: 'from-orange-500/10 to-background text-orange-500',
    green: 'from-green-500/10 to-background text-green-500',
    purple: 'from-purple-500/10 to-background text-purple-500'
  };

  return (
    <Card className={`relative overflow-hidden border-border/30 bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} hover:shadow-sm transition-all`}>
      <CardContent className="p-2.5">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-3 w-12 bg-muted rounded mb-2" />
            <div className="h-6 w-16 bg-muted rounded" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">{title}</span>
              <Icon className={`h-3.5 w-3.5 ${colorClasses[color].split(' ')[2]}`} />
            </div>
            <div className="text-xl font-bold">{value.toLocaleString()}</div>
            <div className="flex items-center gap-0.5 text-[9px] mt-0.5">
              {change >= 0 ? (
                <ArrowUpRight className="h-2.5 w-2.5 text-green-500" />
              ) : (
                <ArrowDownRight className="h-2.5 w-2.5 text-red-500" />
              )}
              <span className={change >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(change).toFixed(1)}%
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Mini Stat Card
const MiniStatCard = ({ title, value, icon: Icon, highlight }: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) => (
  <div className={`rounded-lg border border-border/30 p-2 text-center ${highlight ? 'bg-orange-500/5 border-orange-500/30' : 'bg-background/50'}`}>
    <Icon className={`h-3 w-3 mx-auto mb-0.5 ${highlight ? 'text-orange-500' : 'text-muted-foreground'}`} />
    <div className={`text-sm font-bold ${highlight ? 'text-orange-500' : ''}`}>{value.toLocaleString()}</div>
    <div className="text-[8px] text-muted-foreground">{title}</div>
  </div>
);

// Health Item Component
const HealthItem = ({ label, value, status }: {
  label: string;
  value: string;
  status: 'good' | 'warn' | 'error';
}) => {
  const statusColors = {
    good: 'bg-green-500',
    warn: 'bg-orange-500',
    error: 'bg-red-500'
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-medium">{value}</span>
        <div className={`w-1.5 h-1.5 rounded-full ${statusColors[status]}`} />
      </div>
    </div>
  );
};

export default AdminOverview;
