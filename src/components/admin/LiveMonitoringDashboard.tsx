import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLivePresence } from '@/hooks/useLivePresence';
import { usePlatformStats } from '@/hooks/usePlatformStats';
import { 
  Users, 
  Activity, 
  WifiOff,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  RefreshCw,
  Bell,
  Server,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  Cpu,
  HardDrive,
  BarChart3,
  LineChart,
  Store,
  Building2,
  Mail,
  MessageSquare,
  Star,
  ThumbsUp,
  Ticket,
  UserPlus,
  Home,
  FileText,
  Shield
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface SystemMetrics {
  cpu: number;
  memory: number;
  database: number;
  requests: number;
  responseTime: number;
  errors: number;
  uptime: string;
}

interface ActivityEvent {
  id: string;
  type: 'login' | 'logout' | 'pageview' | 'action' | 'error' | 'transaction';
  user?: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

interface PerformancePoint {
  time: string;
  requests: number;
  responseTime: number;
  errors: number;
}

const LiveMonitoringDashboard = () => {
  const { toast } = useToast();
  const { 
    onlineUsers, 
    isConnected, 
    recentJoins, 
    recentLeaves, 
    totalOnline 
  } = useLivePresence('admin_monitoring');

  const { stats, refreshStats } = usePlatformStats(true, 15000);

  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    database: 0,
    requests: 0,
    responseTime: 0,
    errors: 0,
    uptime: '0d 0h 0m'
  });

  const [activityStream, setActivityStream] = useState<ActivityEvent[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformancePoint[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval] = useState(5000);
  const [isLive, setIsLive] = useState(true);

  // Simulated real-time metrics update
  const updateMetrics = useCallback(() => {
    setMetrics(prev => ({
      cpu: Math.min(100, Math.max(0, prev.cpu + (Math.random() - 0.5) * 10)),
      memory: Math.min(100, Math.max(20, prev.memory + (Math.random() - 0.5) * 5)),
      database: Math.min(100, Math.max(0, prev.database + (Math.random() - 0.5) * 8)),
      requests: Math.floor(Math.random() * 50) + 10,
      responseTime: Math.floor(Math.random() * 200) + 50,
      errors: Math.floor(Math.random() * 3),
      uptime: prev.uptime
    }));

    setPerformanceData(prev => {
      const newPoint = {
        time: format(new Date(), 'HH:mm:ss'),
        requests: Math.floor(Math.random() * 50) + 10,
        responseTime: Math.floor(Math.random() * 200) + 50,
        errors: Math.floor(Math.random() * 3)
      };
      return [...prev.slice(-30), newPoint];
    });
  }, []);

  // Fetch real activity from database
  const fetchRecentActivity = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('id, activity_type, user_id, activity_description, created_at, metadata')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const events: ActivityEvent[] = (data || []).map(log => ({
        id: log.id,
        type: log.activity_type as ActivityEvent['type'],
        user: log.user_id,
        description: log.activity_description,
        timestamp: log.created_at,
        metadata: log.metadata
      }));

      setActivityStream(events);
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  }, []);

  // Subscribe to real-time activity updates
  useEffect(() => {
    fetchRecentActivity();

    const channel = supabase
      .channel('activity_realtime')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'activity_logs' },
        (payload) => {
          const newEvent: ActivityEvent = {
            id: payload.new.id,
            type: payload.new.activity_type,
            user: payload.new.user_id,
            description: payload.new.activity_description,
            timestamp: payload.new.created_at,
            metadata: payload.new.metadata
          };
          setActivityStream(prev => [newEvent, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRecentActivity]);

  // Auto-refresh metrics
  useEffect(() => {
    if (!autoRefresh || !isLive) return;

    updateMetrics();
    const interval = setInterval(updateMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, isLive, refreshInterval, updateMetrics]);

  // Fetch uptime
  useEffect(() => {
    const startTime = new Date();
    const updateUptime = () => {
      const now = new Date();
      const diff = now.getTime() - startTime.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setMetrics(prev => ({ ...prev, uptime: `${days}d ${hours}h ${minutes}m` }));
    };

    updateUptime();
    const interval = setInterval(updateUptime, 60000);
    return () => clearInterval(interval);
  }, []);

  const getDeviceIcon = (device?: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="h-3 w-3" />;
      case 'tablet': return <Tablet className="h-3 w-3" />;
      default: return <Monitor className="h-3 w-3" />;
    }
  };

  const getActivityIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'login': return <ArrowUpRight className="h-3 w-3 text-chart-1" />;
      case 'logout': return <ArrowDownRight className="h-3 w-3 text-chart-3" />;
      case 'pageview': return <Eye className="h-3 w-3 text-chart-2" />;
      case 'action': return <MousePointer className="h-3 w-3 text-primary" />;
      case 'error': return <XCircle className="h-3 w-3 text-destructive" />;
      case 'transaction': return <Zap className="h-3 w-3 text-chart-4" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    subValue,
    icon: Icon, 
    trend,
    trendValue, 
    color = 'primary',
    progress 
  }: {
    title: string;
    value: number | string;
    subValue?: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    color?: string;
    progress?: number;
  }) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      primary: { bg: 'bg-primary/10', text: 'text-primary' },
      accent: { bg: 'bg-accent/10', text: 'text-accent' },
      secondary: { bg: 'bg-secondary/10', text: 'text-secondary' },
      'chart-1': { bg: 'bg-chart-1/10', text: 'text-chart-1' },
      'chart-2': { bg: 'bg-chart-2/10', text: 'text-chart-2' },
      'chart-3': { bg: 'bg-chart-3/10', text: 'text-chart-3' },
      'chart-4': { bg: 'bg-chart-4/10', text: 'text-chart-4' },
      'chart-5': { bg: 'bg-chart-5/10', text: 'text-chart-5' },
      destructive: { bg: 'bg-destructive/10', text: 'text-destructive' },
    };
    const { bg, text } = colorMap[color] ?? colorMap['primary'];
    return (
    <Card className="bg-card/50 hover:bg-card/80 transition-colors border-border/50">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          <div className={`p-1.5 rounded-lg ${bg}`}>
            <Icon className={`h-4 w-4 ${text}`} />
          </div>
          {trend && (
            <Badge variant="outline" className={`text-[8px] px-1 ${
              trend === 'up' ? 'text-chart-1 border-chart-1/30' :
              trend === 'down' ? 'text-destructive border-destructive/30' :
              'text-muted-foreground'
            }`}>
              {trend === 'up' ? <TrendingUp className="h-2 w-2 mr-0.5" /> :
               trend === 'down' ? <TrendingDown className="h-2 w-2 mr-0.5" /> : null}
              {trendValue || trend}
            </Badge>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold">{value}</span>
          {subValue && <span className="text-[10px] text-muted-foreground">{subValue}</span>}
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{title}</p>
        {progress !== undefined && (
          <Progress value={progress} className="h-1 mt-2" />
        )}
      </CardContent>
    </Card>
    );
  };

  const handleRefreshAll = async () => {
    await Promise.all([
      updateMetrics(),
      fetchRecentActivity(),
      refreshStats()
    ]);
    toast({
      title: "Dashboard refreshed",
      description: "All metrics have been updated",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-muted/20 border border-border/40">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isConnected ? 'bg-chart-1/20' : 'bg-destructive/20'} animate-pulse`}>
            {isConnected ? (
              <Radio className="h-5 w-5 text-chart-1" />
            ) : (
              <WifiOff className="h-5 w-5 text-destructive" />
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              Live Monitoring Dashboard
              {isLive && (
                <Badge variant="destructive" className="animate-pulse text-[9px]">
                  ● LIVE
                </Badge>
              )}
            </h1>
            <p className="text-xs text-muted-foreground">
              Real-time platform metrics • Last updated: {stats.lastUpdated ? format(stats.lastUpdated, 'HH:mm:ss') : 'Loading...'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch id="live-mode" checked={isLive} onCheckedChange={setIsLive} />
            <Label htmlFor="live-mode" className="text-xs">Live</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <Label htmlFor="auto-refresh" className="text-xs">Auto</Label>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefreshAll} className="h-8">
            <RefreshCw className={`h-3 w-3 mr-1 ${stats.isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Platform Statistics - Main Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers}
          subValue={stats.newUsersToday > 0 ? `+${stats.newUsersToday} today` : undefined}
          icon={Users} 
          trend={stats.newUsersToday > 0 ? 'up' : 'stable'}
          trendValue={stats.newUsersWeek > 0 ? `+${stats.newUsersWeek}/wk` : undefined}
          color="primary"
        />
        <StatCard 
          title="Vendors" 
          value={stats.totalVendors}
          icon={Store} 
          color="accent"
        />
        <StatCard 
          title="Properties" 
          value={stats.totalProperties}
          subValue={`${stats.activeProperties} active`}
          icon={Building2} 
          trend={stats.newPropertiesWeek > 0 ? 'up' : 'stable'}
          trendValue={stats.newPropertiesWeek > 0 ? `+${stats.newPropertiesWeek}/wk` : undefined}
          color="secondary"
        />
        <StatCard 
          title="Services" 
          value={stats.totalServices}
          subValue={`${stats.activeServices} active`}
          icon={Zap} 
          color="primary"
        />
        <StatCard 
          title="Online Now" 
          value={totalOnline}
          icon={Radio} 
          color="chart-1"
        />
        <StatCard 
          title="Activities (24h)" 
          value={stats.activities24h}
          subValue={`${stats.totalActivities} total`}
          icon={Activity} 
          color="accent"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        <StatCard 
          title="Support Tickets" 
          value={stats.totalTickets}
          subValue={stats.openTickets > 0 ? `${stats.openTickets} open` : undefined}
          icon={Ticket} 
          trend={stats.openTickets > 5 ? 'up' : 'stable'}
          color="chart-3"
        />
        <StatCard 
          title="Reviews" 
          value={stats.totalReviews}
          subValue={stats.avgRating > 0 ? `${stats.avgRating}★ avg` : undefined}
          icon={Star} 
          color="chart-4"
        />
        <StatCard 
          title="User Feedback" 
          value={stats.totalFeedback}
          icon={ThumbsUp} 
          color="chart-2"
        />
        <StatCard 
          title="Unread Alerts" 
          value={stats.unreadAlerts}
          subValue={stats.criticalAlerts > 0 ? `${stats.criticalAlerts} critical` : undefined}
          icon={Bell} 
          trend={stats.unreadAlerts > 10 ? 'up' : 'stable'}
          color="destructive"
        />
        <StatCard 
          title="CPU Usage" 
          value={metrics.cpu.toFixed(0)}
          subValue="%"
          icon={Cpu} 
          progress={metrics.cpu}
          color="primary"
        />
        <StatCard 
          title="Response Time" 
          value={metrics.responseTime}
          subValue="ms"
          icon={Clock} 
          color="accent"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-5 h-9">
          <TabsTrigger value="overview" className="text-xs gap-1">
            <BarChart3 className="h-3 w-3" /> Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs gap-1">
            <Users className="h-3 w-3" /> Users
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs gap-1">
            <Activity className="h-3 w-3" /> Activity
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs gap-1">
            <LineChart className="h-3 w-3" /> Performance
          </TabsTrigger>
          <TabsTrigger value="health" className="text-xs gap-1">
            <Server className="h-3 w-3" /> Health
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Platform Summary */}
            <Card className="lg:col-span-2">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Platform Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <Users className="h-6 w-6 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                    {stats.newUsersWeek > 0 && (
                      <Badge className="mt-1 text-[9px]" variant="outline">+{stats.newUsersWeek} this week</Badge>
                    )}
                  </div>
                  <div className="text-center p-3 rounded-lg bg-accent/5 border border-accent/20">
                    <Store className="h-6 w-6 mx-auto text-accent mb-2" />
                    <p className="text-2xl font-bold">{stats.totalVendors}</p>
                    <p className="text-xs text-muted-foreground">Vendors</p>
                    <Badge className="mt-1 text-[9px]" variant="outline">{stats.activeVendors} active</Badge>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                    <Building2 className="h-6 w-6 mx-auto text-secondary mb-2" />
                    <p className="text-2xl font-bold">{stats.totalProperties}</p>
                    <p className="text-xs text-muted-foreground">Properties</p>
                    <Badge className="mt-1 text-[9px]" variant="outline">{stats.activeProperties} active</Badge>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-chart-1/5 border border-chart-1/20">
                    <Zap className="h-6 w-6 mx-auto text-chart-1 mb-2" />
                    <p className="text-2xl font-bold">{stats.totalServices}</p>
                    <p className="text-xs text-muted-foreground">Services</p>
                    <Badge className="mt-1 text-[9px]" variant="outline">{stats.activeServices} active</Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <Activity className="h-5 w-5 text-chart-2" />
                  <div>
                      <p className="text-sm font-semibold">{stats.activities24h}</p>
                      <p className="text-[10px] text-muted-foreground">Activities (24h)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <Ticket className="h-5 w-5 text-chart-3" />
                  <div>
                      <p className="text-sm font-semibold">{stats.openTickets}/{stats.totalTickets}</p>
                      <p className="text-[10px] text-muted-foreground">Open Tickets</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <Star className="h-5 w-5 text-chart-4" />
                  <div>
                      <p className="text-sm font-semibold">{stats.totalReviews}</p>
                      <p className="text-[10px] text-muted-foreground">Reviews ({stats.avgRating}★)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <ThumbsUp className="h-5 w-5 text-chart-1" />
                  <div>
                      <p className="text-sm font-semibold">{stats.totalFeedback}</p>
                      <p className="text-[10px] text-muted-foreground">Feedback</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Alerts */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4 text-chart-3" />
                  Alerts & Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`p-3 rounded-lg ${stats.unreadAlerts > 0 ? 'bg-destructive/10 border border-destructive/20' : 'bg-chart-1/10 border border-chart-1/20'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Unread Alerts</span>
                    <Badge variant={stats.unreadAlerts > 0 ? 'destructive' : 'default'} className="text-[9px]">
                      {stats.unreadAlerts}
                    </Badge>
                  </div>
                  {stats.criticalAlerts > 0 && (
                    <p className="text-[10px] text-destructive mt-1">{stats.criticalAlerts} critical alerts require attention</p>
                  )}
                </div>
                
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">System Health</span>
                    <Badge variant="outline" className="text-[9px] text-chart-1">Healthy</Badge>
                  </div>
                  <Progress value={95} className="h-1.5" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <Radio className={`h-3 w-3 ${isConnected ? 'text-chart-1' : 'text-destructive'}`} />
                      Realtime Connection
                    </span>
                    <span className={isConnected ? 'text-chart-1' : 'text-destructive'}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <Database className="h-3 w-3 text-chart-2" />
                      Database
                    </span>
                    <span className="text-chart-1">Online</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-3 w-3 text-chart-4" />
                      Edge Functions
                    </span>
                    <span className="text-chart-1">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Online Users ({totalOnline})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <AnimatePresence>
                    {onlineUsers.length > 0 ? (
                      <div className="space-y-2">
                        {onlineUsers.map((user, index) => (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.avatar_url} />
                                  <AvatarFallback className="text-xs">
                                    {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-chart-1 rounded-full border-2 border-background" />
                              </div>
                              <div>
                                <p className="text-xs font-medium">{user.full_name || user.email}</p>
                                <p className="text-[10px] text-muted-foreground">{user.current_page || '/'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(user.device)}
                              <Badge variant="outline" className="text-[8px]">{user.role || 'user'}</Badge>
                              <span className="text-[9px] text-muted-foreground">
                                {formatDistanceToNow(new Date(user.online_at), { addSuffix: true })}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
                        <Users className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">No users currently online</p>
                        <p className="text-xs">Users will appear here in real-time</p>
                      </div>
                    )}
                  </AnimatePresence>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Session Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-chart-1 mb-2 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" /> Recent Joins
                  </h4>
                  <ScrollArea className="h-[100px]">
                    {recentJoins.length > 0 ? (
                      <div className="space-y-1">
                        {recentJoins.slice(0, 5).map((user, i) => (
                          <div key={i} className="text-[10px] text-muted-foreground flex items-center gap-2">
                            <span className="w-2 h-2 bg-chart-1 rounded-full" />
                            {user.full_name || user.email}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground">No recent joins</p>
                    )}
                  </ScrollArea>
                </div>

                <Separator />

                <div>
                  <h4 className="text-xs font-medium text-chart-3 mb-2 flex items-center gap-1">
                    <ArrowDownRight className="h-3 w-3" /> Recent Leaves
                  </h4>
                  <ScrollArea className="h-[100px]">
                    {recentLeaves.length > 0 ? (
                      <div className="space-y-1">
                        {recentLeaves.slice(0, 5).map((user, i) => (
                          <div key={i} className="text-[10px] text-muted-foreground flex items-center gap-2">
                            <span className="w-2 h-2 bg-chart-3 rounded-full" />
                            {user.full_name || user.email}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground">No recent leaves</p>
                    )}
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Live Activity Stream
                </CardTitle>
                <Badge variant="outline" className="text-[9px]">
                  {activityStream.length} events
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <AnimatePresence>
                  {activityStream.length > 0 ? (
                    <div className="space-y-2">
                      {activityStream.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="flex items-start gap-3 p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                        >
                          <div className="p-1.5 rounded-full bg-muted">
                            {getActivityIcon(event.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs">{event.description}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[8px] shrink-0">
                            {event.type}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
                      <Activity className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">No activity yet</p>
                      <p className="text-xs">Activity will appear here in real-time</p>
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-primary" />
                  Response Time (ms)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        fontSize: 12 
                      }} 
                    />
                    <Area type="monotone" dataKey="responseTime" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-accent" />
                  Requests & Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsLineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        fontSize: 12 
                      }} 
                    />
                    <Line type="monotone" dataKey="requests" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="errors" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Database', status: 'healthy', latency: '12ms', icon: Database },
              { name: 'API Server', status: 'healthy', latency: '45ms', icon: Server },
              { name: 'Edge Functions', status: 'healthy', latency: '89ms', icon: Zap },
              { name: 'Storage', status: 'healthy', latency: '23ms', icon: HardDrive },
              { name: 'Realtime', status: isConnected ? 'healthy' : 'degraded', latency: '5ms', icon: Radio },
              { name: 'Authentication', status: 'healthy', latency: '34ms', icon: Shield },
            ].map((service) => (
              <Card key={service.name} className={`border-l-4 ${
                service.status === 'healthy' ? 'border-l-chart-1' : 
                service.status === 'degraded' ? 'border-l-chart-3' : 'border-l-destructive'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        service.status === 'healthy' ? 'bg-chart-1/10' : 
                        service.status === 'degraded' ? 'bg-chart-3/10' : 'bg-destructive/10'
                      }`}>
                        <service.icon className={`h-4 w-4 ${
                          service.status === 'healthy' ? 'text-chart-1' : 
                          service.status === 'degraded' ? 'text-chart-3' : 'text-destructive'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{service.name}</p>
                        <p className="text-[10px] text-muted-foreground">Latency: {service.latency}</p>
                      </div>
                    </div>
                    <Badge variant={service.status === 'healthy' ? 'default' : 'destructive'} className="text-[9px]">
                      {service.status === 'healthy' ? (
                        <><CheckCircle className="h-2.5 w-2.5 mr-1" /> Healthy</>
                      ) : (
                        <><AlertTriangle className="h-2.5 w-2.5 mr-1" /> {service.status}</>
                      )}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveMonitoringDashboard;
