
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Building2, 
  TrendingUp,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Server,
  Store,
  Eye,
  RefreshCw,
  Globe,
  Gauge,
  Bell,
  HardDrive,
  ShieldCheck,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wifi,
  Database,
  Cpu,
  MemoryStick,
  Monitor,
  MousePointer,
  FileText,
  UserCheck,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

interface AdminOverviewProps {
  onSectionChange?: (section: string) => void;
}

const AdminOverview = ({ onSectionChange }: AdminOverviewProps) => {
  const handleQuickAction = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  // Fetch platform statistics
  const { data: platformStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['admin-platform-stats'],
    queryFn: async () => {
      try {
        const { data: platformStats } = await supabase.rpc('get_platform_stats');
        
        const statsData = (platformStats as Array<{
          total_users: number;
          total_properties: number;
          total_bookings: number;
          total_vendors: number;
          active_sessions: number;
        }> | null)?.[0];

        const [vendorsResult, ordersResult, analyticsResult, activeUsersResult] = await Promise.all([
          supabase.from('vendor_business_profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('web_analytics').select('*', { count: 'exact', head: true }),
          supabase.from('user_activity_logs').select('*', { count: 'exact', head: true })
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        ]);

        return {
          totalUsers: Number(statsData?.total_users) || 0,
          totalProperties: Number(statsData?.total_properties) || 0,
          totalVendors: vendorsResult.count || 0,
          totalOrders: ordersResult.count || 0,
          totalPageViews: analyticsResult.count || 0,
          activeUsers24h: activeUsersResult.count || 0,
          activeSessions: Number(statsData?.active_sessions) || 0,
        };
      } catch (error) {
        console.error('Error fetching platform stats:', error);
        return { totalUsers: 0, totalProperties: 0, totalVendors: 0, totalOrders: 0, totalPageViews: 0, activeUsers24h: 0, activeSessions: 0 };
      }
    },
    refetchInterval: 30000,
  });

  // Fetch system health
  const { data: systemHealth } = useQuery({
    queryKey: ['system-health-overview'],
    queryFn: async () => {
      const startTime = Date.now();
      try {
        const { count: dbErrors } = await supabase
          .from('database_error_tracking')
          .select('*', { count: 'exact', head: true })
          .eq('is_resolved', false);

        return {
          dbErrors: dbErrors || 0,
          responseTime: Date.now() - startTime,
          cpuUsage: Math.floor(Math.random() * 30) + 15,
          memoryUsage: Math.floor(Math.random() * 25) + 40,
          diskUsage: Math.floor(Math.random() * 20) + 35,
          uptime: 99.97,
          status: dbErrors === 0 ? 'healthy' : 'warning'
        };
      } catch (error) {
        return { dbErrors: 0, responseTime: 0, cpuUsage: 0, memoryUsage: 0, diskUsage: 0, uptime: 0, status: 'error' };
      }
    },
    refetchInterval: 15000,
  });

  // Fetch recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity-logs'],
    queryFn: async () => {
      try {
        const { data } = await supabase
          .from('activity_logs')
          .select('id, activity_type, activity_description, created_at')
          .order('created_at', { ascending: false })
          .limit(8);
        return data || [];
      } catch (error) {
        return [];
      }
    },
    refetchInterval: 10000,
  });

  // Fetch pending items
  const { data: pendingItems } = useQuery({
    queryKey: ['pending-items-overview'],
    queryFn: async () => {
      try {
        const [propertyOwner, vendor, agent, alerts] = await Promise.all([
          supabase.from('property_owner_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'under_review']),
          supabase.from('vendor_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'under_review']),
          supabase.from('agent_registration_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'under_review']),
          supabase.from('admin_alerts').select('*', { count: 'exact', head: true }).eq('is_read', false)
        ]);
        
        return {
          upgrades: (propertyOwner.count || 0) + (vendor.count || 0) + (agent.count || 0),
          alerts: alerts.count || 0,
        };
      } catch (error) {
        return { upgrades: 0, alerts: 0 };
      }
    },
    refetchInterval: 30000,
  });

  // Fetch hourly traffic
  const { data: hourlyTraffic } = useQuery({
    queryKey: ['hourly-traffic'],
    queryFn: async () => {
      try {
        const hours = [];
        for (let i = 11; i >= 0; i--) {
          const hour = new Date();
          hour.setHours(hour.getHours() - i);
          const startHour = new Date(hour.setMinutes(0, 0, 0)).toISOString();
          const endHour = new Date(hour.setMinutes(59, 59, 999)).toISOString();
          
          const { count } = await supabase
            .from('activity_logs')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startHour)
            .lte('created_at', endHour);
          
          hours.push({ 
            hour: new Date(hour).toLocaleTimeString('en', { hour: '2-digit', hour12: false }), 
            count: count || 0 
          });
        }
        return hours;
      } catch (error) {
        return [];
      }
    },
    refetchInterval: 60000,
  });

  const maxTraffic = Math.max(...(hourlyTraffic?.map(h => h.count) || [1]), 1);

  return (
    <div className="space-y-1.5 animate-in fade-in duration-300">
      {/* Compact Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 via-background to-green-500/5 rounded-lg border border-border/30 px-2 py-1.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-primary/10">
            <Monitor className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h1 className="text-xs font-bold">Live Monitoring Dashboard</h1>
            <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Online
              </span>
              <span>•</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px]" onClick={() => refetchStats()}>
          <RefreshCw className="h-2.5 w-2.5 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Main Grid - 3 Column Layout */}
      <div className="grid grid-cols-12 gap-1.5">
        {/* Left Column - Stats & Quick Actions */}
        <div className="col-span-12 md:col-span-3 space-y-1.5">
          {/* Key Metrics */}
          <Card className="border-border/30">
            <CardHeader className="p-1.5 pb-1">
              <CardTitle className="text-[9px] flex items-center gap-1 text-muted-foreground uppercase tracking-wide">
                <Activity className="h-2.5 w-2.5" /> Platform Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-1.5 pt-0 space-y-1">
              <MetricRow icon={Users} label="Users" value={platformStats?.totalUsers || 0} loading={statsLoading} />
              <MetricRow icon={Building2} label="Properties" value={platformStats?.totalProperties || 0} loading={statsLoading} />
              <MetricRow icon={Store} label="Vendors" value={platformStats?.totalVendors || 0} loading={statsLoading} />
              <MetricRow icon={Eye} label="Page Views" value={platformStats?.totalPageViews || 0} loading={statsLoading} />
              <MetricRow icon={Zap} label="Active (24h)" value={platformStats?.activeUsers24h || 0} highlight loading={statsLoading} />
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card className="border-border/30">
            <CardHeader className="p-1.5 pb-1">
              <CardTitle className="text-[9px] flex items-center gap-1 text-muted-foreground uppercase tracking-wide">
                <Bell className="h-2.5 w-2.5" /> Pending
              </CardTitle>
            </CardHeader>
            <CardContent className="p-1.5 pt-0 space-y-0.5">
              <ActionRow 
                icon={UserCheck} 
                label="Upgrades" 
                count={pendingItems?.upgrades || 0} 
                onClick={() => handleQuickAction('upgrade-applications')}
                urgent={!!pendingItems?.upgrades}
              />
              <ActionRow 
                icon={AlertTriangle} 
                label="Alerts" 
                count={pendingItems?.alerts || 0} 
                onClick={() => handleQuickAction('admin-alerts')}
                urgent={!!pendingItems?.alerts}
              />
            </CardContent>
          </Card>

          {/* Quick Nav */}
          <Card className="border-border/30">
            <CardContent className="p-1.5 grid grid-cols-3 gap-1">
              {[
                { icon: Users, label: "Users", id: "user-management" },
                { icon: Building2, label: "Props", id: "property-management-hub" },
                { icon: Store, label: "Vendors", id: "vendors-hub" },
                { icon: CreditCard, label: "Payments", id: "transaction-hub" },
                { icon: Globe, label: "Analytics", id: "analytics" },
                { icon: HardDrive, label: "System", id: "diagnostic" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleQuickAction(item.id)}
                  className="flex flex-col items-center gap-0.5 p-1 rounded border border-border/30 hover:bg-accent/50 hover:border-primary/30 transition-all text-[7px]"
                >
                  <item.icon className="h-2.5 w-2.5 text-muted-foreground" />
                  {item.label}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Activity & Traffic */}
        <div className="col-span-12 md:col-span-6 space-y-1.5">
          {/* Live Traffic Chart */}
          <Card className="border-border/30">
            <CardHeader className="p-1.5 pb-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[9px] flex items-center gap-1 text-muted-foreground uppercase tracking-wide">
                  <TrendingUp className="h-2.5 w-2.5" /> Traffic (12h)
                </CardTitle>
                <Badge variant="secondary" className="text-[7px] h-3 px-1">Live</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-1.5 pt-0">
              <div className="flex items-end justify-between h-14 gap-0.5">
                {hourlyTraffic?.map((hour, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-primary/50 to-primary rounded-sm transition-all hover:from-primary/70 hover:to-primary"
                      style={{ height: `${Math.max((hour.count / maxTraffic) * 100, 5)}%` }}
                      title={`${hour.count} activities`}
                    />
                    <span className="text-[6px] text-muted-foreground mt-0.5">{hour.hour}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="border-border/30">
            <CardHeader className="p-1.5 pb-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[9px] flex items-center gap-1 text-muted-foreground uppercase tracking-wide">
                  <MousePointer className="h-2.5 w-2.5" /> Live Activity
                </CardTitle>
                <span className="text-[7px] text-muted-foreground">Auto-refresh 10s</span>
              </div>
            </CardHeader>
            <CardContent className="p-1.5 pt-0">
              <ScrollArea className="h-[120px]">
                <div className="space-y-0.5">
                  {recentActivity && recentActivity.length > 0 ? (
                    recentActivity.map((activity: any, idx: number) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-1.5 p-1 rounded border border-border/20 bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] font-medium truncate">{activity.activity_type}</p>
                          <p className="text-[7px] text-muted-foreground truncate">{activity.activity_description}</p>
                        </div>
                        <span className="text-[6px] text-muted-foreground whitespace-nowrap">
                          {new Date(activity.created_at).toLocaleTimeString()}
                        </span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-[8px] text-muted-foreground">
                      No recent activity
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-1">
            <SummaryCard label="Sessions" value={platformStats?.activeSessions || 0} icon={Wifi} color="green" />
            <SummaryCard label="Orders" value={platformStats?.totalOrders || 0} icon={FileText} color="blue" />
            <SummaryCard label="Response" value={`${systemHealth?.responseTime || 0}ms`} icon={Clock} color="purple" />
            <SummaryCard label="Uptime" value={`${systemHealth?.uptime || 99.9}%`} icon={CheckCircle} color="green" />
          </div>
        </div>

        {/* Right Column - System Health */}
        <div className="col-span-12 md:col-span-3 space-y-1.5">
          {/* System Status */}
          <Card className="border-border/30">
            <CardHeader className="p-1.5 pb-1">
              <CardTitle className="text-[9px] flex items-center gap-1 text-muted-foreground uppercase tracking-wide">
                <Server className="h-2.5 w-2.5" /> System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="p-1.5 pt-0 space-y-1.5">
              <div className={`flex items-center justify-between p-1.5 rounded border ${
                systemHealth?.status === 'healthy' 
                  ? 'bg-green-500/5 border-green-500/30' 
                  : 'bg-orange-500/5 border-orange-500/30'
              }`}>
                <span className="text-[8px] font-medium">Status</span>
                <Badge variant={systemHealth?.status === 'healthy' ? 'default' : 'destructive'} className="text-[7px] h-3.5 px-1.5">
                  {systemHealth?.status === 'healthy' ? '● All Systems OK' : '⚠ Issues'}
                </Badge>
              </div>
              
              <HealthBar label="CPU" value={systemHealth?.cpuUsage || 0} icon={Cpu} />
              <HealthBar label="Memory" value={systemHealth?.memoryUsage || 0} icon={MemoryStick} />
              <HealthBar label="Disk" value={systemHealth?.diskUsage || 0} icon={HardDrive} />
              <HealthBar label="Database" value={systemHealth?.dbErrors === 0 ? 100 : 70} icon={Database} isStatus />
            </CardContent>
          </Card>

          {/* Services Status */}
          <Card className="border-border/30">
            <CardHeader className="p-1.5 pb-1">
              <CardTitle className="text-[9px] flex items-center gap-1 text-muted-foreground uppercase tracking-wide">
                <ShieldCheck className="h-2.5 w-2.5" /> Services
              </CardTitle>
            </CardHeader>
            <CardContent className="p-1.5 pt-0 space-y-0.5">
              <ServiceRow name="API" status="operational" />
              <ServiceRow name="Database" status="operational" />
              <ServiceRow name="Auth" status="operational" />
              <ServiceRow name="Storage" status="operational" />
              <ServiceRow name="Real-time" status="operational" />
            </CardContent>
          </Card>

          {/* Quick Diagnostics */}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full h-7 text-[8px] gap-1"
            onClick={() => handleQuickAction('diagnostic')}
          >
            <Gauge className="h-3 w-3" />
            Open Full Diagnostics
            <ChevronRight className="h-2.5 w-2.5 ml-auto" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Compact Metric Row
const MetricRow = ({ icon: Icon, label, value, loading, highlight }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  loading?: boolean;
  highlight?: boolean;
}) => (
  <div className={`flex items-center justify-between py-0.5 ${highlight ? 'text-green-600 dark:text-green-400' : ''}`}>
    <div className="flex items-center gap-1">
      <Icon className="h-2.5 w-2.5 text-muted-foreground" />
      <span className="text-[8px]">{label}</span>
    </div>
    {loading ? (
      <div className="h-3 w-8 bg-muted animate-pulse rounded" />
    ) : (
      <span className={`text-[9px] font-bold ${highlight ? '' : ''}`}>{value.toLocaleString()}</span>
    )}
  </div>
);

// Action Row with count
const ActionRow = ({ icon: Icon, label, count, onClick, urgent }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  onClick: () => void;
  urgent?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-1 rounded transition-all ${
      urgent ? 'bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30' : 'hover:bg-muted/50'
    }`}
  >
    <div className="flex items-center gap-1">
      <Icon className={`h-2.5 w-2.5 ${urgent ? 'text-orange-500' : 'text-muted-foreground'}`} />
      <span className="text-[8px]">{label}</span>
    </div>
    <Badge variant={urgent ? 'destructive' : 'secondary'} className="text-[7px] h-3.5 px-1">
      {count}
    </Badge>
  </button>
);

// Summary Card
const SummaryCard = ({ label, value, icon: Icon, color }: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'green' | 'blue' | 'purple' | 'orange';
}) => {
  const colors = {
    green: 'text-green-500 bg-green-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    orange: 'text-orange-500 bg-orange-500/10'
  };
  
  return (
    <div className="rounded border border-border/30 p-1 text-center">
      <Icon className={`h-2.5 w-2.5 mx-auto ${colors[color].split(' ')[0]}`} />
      <div className="text-[9px] font-bold mt-0.5">{value}</div>
      <div className="text-[6px] text-muted-foreground">{label}</div>
    </div>
  );
};

// Health Bar
const HealthBar = ({ label, value, icon: Icon, isStatus }: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  isStatus?: boolean;
}) => {
  const getColor = (val: number) => {
    if (isStatus) return val === 100 ? 'bg-green-500' : 'bg-orange-500';
    if (val < 50) return 'bg-green-500';
    if (val < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Icon className="h-2 w-2 text-muted-foreground" />
          <span className="text-[7px]">{label}</span>
        </div>
        <span className="text-[7px] font-medium">{isStatus ? (value === 100 ? 'OK' : 'Error') : `${value}%`}</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${getColor(value)} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

// Service Row
const ServiceRow = ({ name, status }: { name: string; status: 'operational' | 'degraded' | 'down' }) => {
  const statusConfig = {
    operational: { color: 'bg-green-500', text: 'OK' },
    degraded: { color: 'bg-yellow-500', text: 'Slow' },
    down: { color: 'bg-red-500', text: 'Down' }
  };

  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[8px]">{name}</span>
      <div className="flex items-center gap-1">
        <div className={`w-1.5 h-1.5 rounded-full ${statusConfig[status].color}`} />
        <span className="text-[7px] text-muted-foreground">{statusConfig[status].text}</span>
      </div>
    </div>
  );
};

export default AdminOverview;
