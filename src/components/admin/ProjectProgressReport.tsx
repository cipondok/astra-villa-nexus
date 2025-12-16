import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Database,
  Shield,
  Zap,
  Users,
  FileText,
  BarChart3,
  Target,
  RefreshCw,
  Building,
  Store,
  UserCheck,
  Activity,
  TrendingUp,
  Clock,
  Globe,
  Eye,
  MessageSquare,
  CreditCard
} from 'lucide-react';

interface SystemMetric {
  name: string;
  current: number;
  target: number;
  icon: any;
  color: string;
  description: string;
}

interface ModuleStatus {
  name: string;
  progress: number;
  status: 'operational' | 'partial' | 'issues';
  icon: any;
  metrics: { label: string; value: number | string }[];
}

const ProjectProgressReport = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch actual database statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['project-progress-stats', refreshKey],
    queryFn: async () => {
      const [
        profiles,
        properties,
        vendors,
        agents,
        propertyOwners,
        analytics,
        articles,
        supportTickets,
        adminAlerts,
        activityLogs,
        chatSessions,
        errorLogs,
        vendorServices,
        bookings,
        favorites
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('vendor_business_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('agent_registration_requests').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('property_owner_requests').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('web_analytics').select('*', { count: 'exact', head: true }),
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('customer_support_tickets').select('*', { count: 'exact', head: true }),
        supabase.from('admin_alerts').select('*', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('activity_logs').select('*', { count: 'exact', head: true }),
        supabase.from('live_chat_sessions').select('*', { count: 'exact', head: true }),
        supabase.from('error_logs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('vendor_services').select('*', { count: 'exact', head: true }),
        supabase.from('vendor_bookings').select('*', { count: 'exact', head: true }),
        supabase.from('favorites').select('*', { count: 'exact', head: true })
      ]);

      return {
        users: profiles.count || 0,
        properties: properties.count || 0,
        vendors: vendors.count || 0,
        agents: agents.count || 0,
        propertyOwners: propertyOwners.count || 0,
        pageViews: analytics.count || 0,
        articles: articles.count || 0,
        tickets: supportTickets.count || 0,
        unreadAlerts: adminAlerts.count || 0,
        activities: activityLogs.count || 0,
        chatSessions: chatSessions.count || 0,
        pendingErrors: errorLogs.count || 0,
        services: vendorServices.count || 0,
        bookings: bookings.count || 0,
        favorites: favorites.count || 0
      };
    }
  });

  // Fetch database health
  const { data: dbHealth } = useQuery({
    queryKey: ['db-health-check', refreshKey],
    queryFn: async () => {
      const start = Date.now();
      const { error } = await supabase.from('profiles').select('id').limit(1);
      const responseTime = Date.now() - start;
      
      return {
        isConnected: !error,
        responseTime,
        status: responseTime < 100 ? 'excellent' : responseTime < 300 ? 'good' : 'slow'
      };
    }
  });

  // Fetch recent activity trend
  const { data: activityTrend } = useQuery({
    queryKey: ['activity-trend', refreshKey],
    queryFn: async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: thisWeek } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      
      const { count: lastWeek } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', twoWeeksAgo.toISOString())
        .lt('created_at', weekAgo.toISOString());

      const change = lastWeek ? ((thisWeek || 0) - lastWeek) / lastWeek * 100 : 0;
      return { thisWeek: thisWeek || 0, lastWeek: lastWeek || 0, change };
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  // Calculate module statuses based on real data
  const moduleStatuses: ModuleStatus[] = [
    {
      name: 'User Management',
      progress: stats?.users ? Math.min(100, (stats.users / 100) * 100) : 0,
      status: stats?.users && stats.users > 10 ? 'operational' : stats?.users ? 'partial' : 'issues',
      icon: Users,
      metrics: [
        { label: 'Total Users', value: stats?.users || 0 },
        { label: 'Agents', value: stats?.agents || 0 },
        { label: 'Owners', value: stats?.propertyOwners || 0 }
      ]
    },
    {
      name: 'Property System',
      progress: stats?.properties ? Math.min(100, (stats.properties / 50) * 100) : 0,
      status: stats?.properties && stats.properties > 5 ? 'operational' : stats?.properties ? 'partial' : 'issues',
      icon: Building,
      metrics: [
        { label: 'Properties', value: stats?.properties || 0 },
        { label: 'Favorites', value: stats?.favorites || 0 }
      ]
    },
    {
      name: 'Vendor Marketplace',
      progress: stats?.vendors ? Math.min(100, (stats.vendors / 20) * 100) : 0,
      status: stats?.vendors && stats.vendors > 3 ? 'operational' : stats?.vendors ? 'partial' : 'issues',
      icon: Store,
      metrics: [
        { label: 'Vendors', value: stats?.vendors || 0 },
        { label: 'Services', value: stats?.services || 0 },
        { label: 'Bookings', value: stats?.bookings || 0 }
      ]
    },
    {
      name: 'Analytics & Tracking',
      progress: stats?.pageViews ? Math.min(100, (stats.pageViews / 1000) * 100) : 0,
      status: stats?.pageViews && stats.pageViews > 100 ? 'operational' : stats?.pageViews ? 'partial' : 'issues',
      icon: BarChart3,
      metrics: [
        { label: 'Page Views', value: stats?.pageViews || 0 },
        { label: 'Activities', value: stats?.activities || 0 }
      ]
    },
    {
      name: 'Support System',
      progress: stats?.chatSessions ? Math.min(100, 80) : 50,
      status: stats?.pendingErrors && stats.pendingErrors > 10 ? 'issues' : 'operational',
      icon: MessageSquare,
      metrics: [
        { label: 'Chat Sessions', value: stats?.chatSessions || 0 },
        { label: 'Tickets', value: stats?.tickets || 0 },
        { label: 'Pending Errors', value: stats?.pendingErrors || 0 }
      ]
    },
    {
      name: 'Content Management',
      progress: stats?.articles ? Math.min(100, (stats.articles / 10) * 100) : 0,
      status: stats?.articles && stats.articles > 3 ? 'operational' : 'partial',
      icon: FileText,
      metrics: [
        { label: 'Articles', value: stats?.articles || 0 },
        { label: 'Alerts', value: stats?.unreadAlerts || 0 }
      ]
    }
  ];

  const overallProgress = Math.round(
    moduleStatuses.reduce((sum, mod) => sum + mod.progress, 0) / moduleStatuses.length
  );

  const operationalCount = moduleStatuses.filter(m => m.status === 'operational').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'partial': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'issues': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'operational': return 'Operational';
      case 'partial': return 'Partial';
      case 'issues': return 'Issues';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Project Progress</h1>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-8 text-xs gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Progress Card */}
      <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground">Overall Progress</p>
              <p className="text-3xl font-bold text-primary">{overallProgress}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Modules Status</p>
              <p className="text-sm font-medium text-emerald-600">{operationalCount}/{moduleStatuses.length} Operational</p>
            </div>
          </div>
          <Progress value={overallProgress} className="h-2" multiColor />
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="p-2.5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-lg font-bold">{stats?.users || 0}</p>
              <p className="text-[10px] text-muted-foreground">Users</p>
            </div>
          </div>
        </Card>
        <Card className="p-2.5">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-lg font-bold">{stats?.properties || 0}</p>
              <p className="text-[10px] text-muted-foreground">Properties</p>
            </div>
          </div>
        </Card>
        <Card className="p-2.5">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-lg font-bold">{stats?.vendors || 0}</p>
              <p className="text-[10px] text-muted-foreground">Vendors</p>
            </div>
          </div>
        </Card>
        <Card className="p-2.5">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-cyan-500" />
            <div>
              <p className="text-lg font-bold">{stats?.pageViews || 0}</p>
              <p className="text-[10px] text-muted-foreground">Views</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Database Health */}
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium">Database</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`text-[10px] ${
              dbHealth?.status === 'excellent' ? 'text-emerald-600 border-emerald-500/30' :
              dbHealth?.status === 'good' ? 'text-amber-600 border-amber-500/30' :
              'text-rose-600 border-rose-500/30'
            }`}>
              {dbHealth?.responseTime || 0}ms
            </Badge>
            <Badge className={`text-[10px] ${
              dbHealth?.isConnected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
            }`}>
              {dbHealth?.isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Activity Trend */}
      {activityTrend && (
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Weekly Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{activityTrend.thisWeek}</span>
              <Badge variant="outline" className={`text-[10px] ${
                activityTrend.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                <TrendingUp className={`h-3 w-3 mr-1 ${activityTrend.change < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(activityTrend.change).toFixed(0)}%
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Module Tabs */}
      <Tabs defaultValue="modules" className="w-full">
        <TabsList className="w-full h-8 p-0.5 gap-0.5">
          <TabsTrigger value="modules" className="flex-1 text-xs h-7">Modules</TabsTrigger>
          <TabsTrigger value="metrics" className="flex-1 text-xs h-7">Metrics</TabsTrigger>
          <TabsTrigger value="health" className="flex-1 text-xs h-7">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="mt-3 space-y-2">
          {moduleStatuses.map((module, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <module.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{module.name}</span>
                </div>
                <Badge className={`text-[10px] border ${getStatusColor(module.status)}`}>
                  {getStatusLabel(module.status)}
                </Badge>
              </div>
              <Progress value={module.progress} className="h-1.5 mb-2" />
              <div className="flex flex-wrap gap-2">
                {module.metrics.map((metric, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-[10px]">
                    <span className="text-muted-foreground">{metric.label}:</span>
                    <span className="font-medium">{metric.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="metrics" className="mt-3 space-y-2">
          <Card className="p-3">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Key Performance Indicators
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">User Growth</span>
                <div className="flex items-center gap-2">
                  <Progress value={Math.min(100, (stats?.users || 0) / 100 * 100)} className="w-24 h-1.5" />
                  <span className="text-xs font-medium w-8">{stats?.users || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Properties Listed</span>
                <div className="flex items-center gap-2">
                  <Progress value={Math.min(100, (stats?.properties || 0) / 50 * 100)} className="w-24 h-1.5" />
                  <span className="text-xs font-medium w-8">{stats?.properties || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Vendor Services</span>
                <div className="flex items-center gap-2">
                  <Progress value={Math.min(100, (stats?.services || 0) / 30 * 100)} className="w-24 h-1.5" />
                  <span className="text-xs font-medium w-8">{stats?.services || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Chat Sessions</span>
                <div className="flex items-center gap-2">
                  <Progress value={Math.min(100, (stats?.chatSessions || 0) / 100 * 100)} className="w-24 h-1.5" />
                  <span className="text-xs font-medium w-8">{stats?.chatSessions || 0}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Content Articles</span>
                <div className="flex items-center gap-2">
                  <Progress value={Math.min(100, (stats?.articles || 0) / 20 * 100)} className="w-24 h-1.5" />
                  <span className="text-xs font-medium w-8">{stats?.articles || 0}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Platform Statistics
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-muted/50">
                <p className="text-lg font-bold">{stats?.favorites || 0}</p>
                <p className="text-[10px] text-muted-foreground">Saved Items</p>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <p className="text-lg font-bold">{stats?.bookings || 0}</p>
                <p className="text-[10px] text-muted-foreground">Bookings</p>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <p className="text-lg font-bold">{stats?.agents || 0}</p>
                <p className="text-[10px] text-muted-foreground">Agents</p>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <p className="text-lg font-bold">{stats?.propertyOwners || 0}</p>
                <p className="text-[10px] text-muted-foreground">Owners</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="mt-3 space-y-2">
          <Card className="p-3">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              System Health
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                <div className="flex items-center gap-2">
                  <Database className="h-3.5 w-3.5" />
                  <span className="text-xs">Database Connection</span>
                </div>
                <Badge className={`text-[10px] ${dbHealth?.isConnected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                  {dbHealth?.isConnected ? 'Healthy' : 'Error'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5" />
                  <span className="text-xs">Response Time</span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {dbHealth?.responseTime || 0}ms
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span className="text-xs">Pending Errors</span>
                </div>
                <Badge className={`text-[10px] ${(stats?.pendingErrors || 0) > 5 ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                  {stats?.pendingErrors || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" />
                  <span className="text-xs">Unread Alerts</span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {stats?.unreadAlerts || 0}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Module Status Summary
            </h3>
            <div className="space-y-1.5">
              {moduleStatuses.map((module, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{module.name}</span>
                  <div className="flex items-center gap-1.5">
                    {module.status === 'operational' ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    ) : module.status === 'partial' ? (
                      <Clock className="h-3 w-3 text-amber-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-rose-500" />
                    )}
                    <span className={`text-[10px] ${
                      module.status === 'operational' ? 'text-emerald-600' :
                      module.status === 'partial' ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {module.progress.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectProgressReport;
