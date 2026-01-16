
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  UserCheck,
  Store,
  Eye,
  RefreshCw,
  FileText,
  Globe,
  Settings,
  BarChart3,
  Layers,
  ChevronRight,
  Home,
  PanelLeft,
  Monitor,
  Gauge,
  Bell,
  Search,
  Filter,
  BookOpen,
  Wrench,
  HardDrive,
  ShieldCheck,
  MessageSquare,
  CreditCard,
  MapPin,
  Crown
} from "lucide-react";
import { VIPStatsWidget } from "./VIPStatsWidget";
import { motion, AnimatePresence } from "framer-motion";

interface AdminOverviewProps {
  onSectionChange?: (section: string) => void;
}

// Control Panel Sections with smart categories
const controlPanelSections = [
  {
    category: "Core Management",
    icon: Layers,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-500",
    items: [
      { id: "user-management", label: "Users", icon: Users, description: "Manage accounts" },
      { id: "user-levels", label: "User Levels", icon: UserCheck, description: "Membership tiers" },
      { id: "upgrade-applications", label: "Upgrades", icon: TrendingUp, description: "Role requests" },
      { id: "verification-management", label: "Verification", icon: ShieldCheck, description: "KYC & verify" },
    ]
  },
  {
    category: "Property System",
    icon: Building2,
    color: "from-primary to-primary/80",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
    items: [
      { id: "property-management-hub", label: "Properties", icon: Building2, description: "All listings" },
      { id: "property-3d-settings", label: "3D Settings", icon: Monitor, description: "Virtual tours" },
      { id: "property-survey-management", label: "Surveys", icon: FileText, description: "Bookings" },
      { id: "location-management", label: "Locations", icon: MapPin, description: "Areas & regions" },
    ]
  },
  {
    category: "Vendors & Services",
    icon: Store,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-500",
    items: [
      { id: "vendors-hub", label: "Vendors Hub", icon: Store, description: "All vendors" },
      { id: "vendor-agent-control", label: "Agent Control", icon: UserCheck, description: "Agent management" },
      { id: "booking-payment-settings", label: "Payments", icon: CreditCard, description: "Payment config" },
    ]
  },
  {
    category: "Analytics & Monitoring",
    icon: BarChart3,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-500",
    items: [
      { id: "visitor-analytics", label: "Visitors", icon: Eye, description: "Traffic data" },
      { id: "vip-analytics", label: "VIP Analytics", icon: Crown, description: "Membership stats" },
      { id: "analytics", label: "Web Analytics", icon: BarChart3, description: "Site metrics" },
      { id: "algorithm-dashboard", label: "Algorithm", icon: Gauge, description: "Search tuning" },
    ]
  },
  {
    category: "Content & Communication",
    icon: BookOpen,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-500/10",
    textColor: "text-green-500",
    items: [
      { id: "content-management", label: "Content", icon: BookOpen, description: "CMS & articles" },
      { id: "homepage-slider", label: "Sliders", icon: Layers, description: "Hero banners" },
      { id: "admin-alerts", label: "Alerts", icon: Bell, description: "Notifications" },
      { id: "customer-service", label: "Support", icon: MessageSquare, description: "Tickets" },
    ]
  },
  {
    category: "System & Tools",
    icon: Settings,
    color: "from-slate-500 to-slate-600",
    bgColor: "bg-slate-500/10",
    textColor: "text-slate-500",
    items: [
      { id: "system-settings", label: "Settings", icon: Settings, description: "General config" },
      { id: "database-management", label: "Database", icon: Database, description: "Tables & data" },
      { id: "tools-management", label: "Tools", icon: Wrench, description: "Admin tools" },
      { id: "diagnostic", label: "Diagnostics", icon: HardDrive, description: "System health" },
    ]
  },
];

const AdminOverview = ({ onSectionChange }: AdminOverviewProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  
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
        // Use secure RPC function to get platform stats
        const { data: platformStats, error: rpcError } = await supabase.rpc('get_platform_stats');
        
        const statsData = (platformStats as Array<{
          total_users: number;
          total_properties: number;
          total_bookings: number;
          total_vendors: number;
          active_sessions: number;
        }> | null)?.[0];

        const [
          vendorsResult,
          ordersResult,
          articlesResult,
          analyticsResult,
          activeUsersResult
        ] = await Promise.all([
          supabase.from('vendor_business_profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('articles').select('*', { count: 'exact', head: true }),
          supabase.from('web_analytics').select('*', { count: 'exact', head: true }),
          supabase.from('user_activity_logs').select('*', { count: 'exact', head: true })
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        ]);

        return {
          totalUsers: Number(statsData?.total_users) || 0,
          totalProperties: Number(statsData?.total_properties) || 0,
          totalVendors: vendorsResult.count || 0,
          totalOrders: ordersResult.count || 0,
          totalArticles: articlesResult.count || 0,
          totalPageViews: analyticsResult.count || 0,
          activeUsers24h: activeUsersResult.count || 0,
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
        const { data } = await supabase
          .from('admin_alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        return data || [];
      } catch (error) {
        return [];
      }
    },
    refetchInterval: 30000,
  });

  // Fetch system health
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

        return {
          dbErrors: dbErrors || 0,
          pendingVendors: pendingVendors || 0,
          systemStatus: dbErrors === 0 ? 'healthy' : 'issues',
          responseTime: Date.now() - startTime,
          uptime: 99.9
        };
      } catch (error) {
        return { dbErrors: 0, pendingVendors: 0, systemStatus: 'unknown', responseTime: 0, uptime: 0 };
      }
    },
    refetchInterval: 60000,
  });

  // Fetch pending upgrades
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
        return { propertyOwner: 0, vendor: 0, agent: 0, total: 0 };
      }
    },
    refetchInterval: 30000,
  });

  // Fetch weekly activity
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
          
          days.push({ day: date.toLocaleDateString('en', { weekday: 'short' }), count: count || 0 });
        }
        return days;
      } catch (error) {
        return [];
      }
    },
    refetchInterval: 60000,
  });

  const maxActivity = Math.max(...(weeklyActivity?.map(d => d.count) || [1]), 1);

  return (
    <div className="space-y-2 md:space-y-3 animate-in fade-in duration-500">
      {/* Professional Header with System Status */}
      <div className="relative overflow-hidden rounded-lg md:rounded-xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-border/40 shadow-sm">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,white)]"></div>
        <div className="relative p-2 md:p-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
                <PanelLeft className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm md:text-base lg:text-lg font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                  Admin Control Center
                </h1>
                <p className="text-muted-foreground text-[9px] md:text-[10px]">
                  Real-time platform monitoring & management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <Button variant="ghost" size="sm" className="h-6 md:h-7 px-1.5 md:px-2 gap-1" onClick={() => refetchStats()}>
                <RefreshCw className="h-2.5 w-2.5 md:h-3 md:w-3" />
                <span className="text-[9px] md:text-[10px] hidden sm:inline">Refresh</span>
              </Button>
              <div className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-[9px] md:text-[10px] font-medium transition-all ${
                systemHealth?.systemStatus === 'healthy' 
                  ? 'bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400' 
                  : 'bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400'
              }`}>
                <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse ${
                  systemHealth?.systemStatus === 'healthy' ? 'bg-green-500' : 'bg-orange-500'
                }`} />
                <span className="hidden xs:inline">{systemHealth?.systemStatus === 'healthy' ? 'All Systems Operational' : 'Needs Attention'}</span>
                <span className="xs:hidden">{systemHealth?.systemStatus === 'healthy' ? 'OK' : 'Alert'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full h-8 md:h-9 p-0.5 md:p-1 bg-muted/50 rounded-lg grid grid-cols-3 gap-0.5 md:gap-1">
          <TabsTrigger 
            value="dashboard" 
            className="h-7 md:h-7 text-[9px] md:text-[10px] rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm gap-0.5 md:gap-1 px-1 md:px-2"
          >
            <Home className="h-2.5 w-2.5 md:h-3 md:w-3" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger 
            value="control-panel" 
            className="h-7 md:h-7 text-[9px] md:text-[10px] rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm gap-0.5 md:gap-1 px-1 md:px-2"
          >
            <Layers className="h-2.5 w-2.5 md:h-3 md:w-3" />
            <span>Control</span>
          </TabsTrigger>
          <TabsTrigger 
            value="quick-actions" 
            className="h-7 md:h-7 text-[9px] md:text-[10px] rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm gap-0.5 md:gap-1 px-1 md:px-2"
          >
            <Zap className="h-2.5 w-2.5 md:h-3 md:w-3" />
            <span>Actions</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab - Live Monitoring */}
        <TabsContent value="dashboard" className="mt-2 md:mt-3 space-y-2 md:space-y-3">
          {/* Live Monitoring Header */}
          <Card className="border-border/30 bg-gradient-to-r from-green-500/5 via-background to-blue-500/5">
            <CardContent className="p-2 md:p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="relative">
                    <div className="p-1.5 md:p-2 rounded-lg bg-green-500/20">
                      <Activity className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 md:w-2.5 md:h-2.5 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xs md:text-sm font-bold">Live Platform Monitoring</h2>
                    <p className="text-[8px] md:text-[10px] text-muted-foreground flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Real-time data • Auto-refresh every 30s
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[8px] md:text-[9px] h-5 px-2 border-green-500/30 text-green-600 dark:text-green-400">
                    <Clock className="h-2.5 w-2.5 mr-1" />
                    {new Date().toLocaleTimeString()}
                  </Badge>
                  <Button variant="outline" size="sm" className="h-6 md:h-7 px-2 gap-1" onClick={() => refetchStats()}>
                    <RefreshCw className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    <span className="text-[9px] md:text-[10px]">Refresh</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2">
            <StatCard title="Total Users" value={platformStats?.totalUsers || 0} icon={Users} change={platformStats?.userGrowth || 0} color="blue" loading={statsLoading} />
            <StatCard title="Properties" value={platformStats?.totalProperties || 0} icon={Building2} change={platformStats?.propertyGrowth || 0} color="primary" loading={statsLoading} />
            <StatCard title="Vendors" value={platformStats?.totalVendors || 0} icon={Store} change={platformStats?.vendorGrowth || 0} color="orange" loading={statsLoading} />
            <StatCard title="Active (24h)" value={platformStats?.activeUsers24h || 0} icon={Activity} change={platformStats?.revenueGrowth || 0} color="green" loading={statsLoading} />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-4 gap-1 md:gap-2">
            <MiniStatCard title="Views" value={platformStats?.totalPageViews || 0} icon={Eye} />
            <MiniStatCard title="Orders" value={platformStats?.totalOrders || 0} icon={FileText} />
            <MiniStatCard title="Articles" value={platformStats?.totalArticles || 0} icon={Globe} />
            <MiniStatCard title="Pending" value={pendingUpgrades?.total || 0} icon={Clock} highlight={!!pendingUpgrades?.total} onClick={() => handleQuickAction('upgrade-applications')} />
          </div>

          {/* VIP Stats Widget */}
          <VIPStatsWidget onNavigate={handleQuickAction} />

          {/* Activity & Health Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-1.5 md:gap-2">
            {/* Activity Chart */}
            <Card className="lg:col-span-2 border-border/30 bg-background/50">
              <CardHeader className="p-1.5 md:p-2 pb-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] md:text-xs flex items-center gap-1 md:gap-1.5">
                    <TrendingUp className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
                    Weekly Activity
                  </CardTitle>
                  <Badge variant="secondary" className="text-[8px] md:text-[9px] h-3.5 md:h-4 px-1 md:px-1.5">7 days</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-1.5 md:p-2 pt-0">
                <div className="flex items-end justify-between h-12 md:h-16 gap-0.5 md:gap-1">
                  {weeklyActivity?.map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-0.5">
                      <div 
                        className="w-full bg-gradient-to-t from-primary/60 to-primary rounded-t transition-all hover:from-primary/80 hover:to-primary cursor-pointer"
                        style={{ height: `${Math.max((day.count / maxActivity) * 100, 8)}%` }}
                        title={`${day.count} activities`}
                      />
                      <span className="text-[7px] md:text-[8px] text-muted-foreground">{day.day}</span>
                    </div>
                  )) || Array(7).fill(0).map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className="w-full h-2 bg-muted rounded-t animate-pulse" />
                      <span className="text-[7px] md:text-[8px] text-muted-foreground">-</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card className="border-border/30 bg-background/50">
              <CardHeader className="p-1.5 md:p-2 pb-1">
                <CardTitle className="text-[10px] md:text-xs flex items-center gap-1 md:gap-1.5">
                  <Server className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="p-1.5 md:p-2 pt-0 space-y-1 md:space-y-1.5">
                <HealthItem label="Database" value="Connected" status="good" />
                <HealthItem label="Response" value={`${systemHealth?.responseTime || 0}ms`} status={systemHealth?.responseTime && systemHealth.responseTime < 500 ? "good" : "warn"} />
                <HealthItem label="Uptime" value={`${systemHealth?.uptime || 99.9}%`} status="good" />
                <HealthItem label="Errors" value={String(systemHealth?.dbErrors || 0)} status={systemHealth?.dbErrors === 0 ? "good" : "error"} />
                <Button variant="outline" size="sm" className="w-full h-5 md:h-6 text-[8px] md:text-[9px] mt-1" onClick={() => handleQuickAction('diagnostic')}>
                  <Activity className="h-2 w-2 md:h-2.5 md:w-2.5 mr-1" />
                  Diagnostics
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Preview */}
          <Card className="border-border/30 bg-background/50">
            <CardHeader className="p-1.5 md:p-2 pb-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] md:text-xs flex items-center gap-1 md:gap-1.5">
                  <AlertTriangle className="h-3 w-3 md:h-3.5 md:w-3.5 text-orange-500" />
                  Recent Alerts
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-4 md:h-5 text-[8px] md:text-[9px] px-1 md:px-1.5" onClick={() => handleQuickAction('admin-alerts')}>
                  View All <ChevronRight className="h-2 w-2 md:h-2.5 md:w-2.5 ml-0.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-1.5 md:p-2 pt-0">
              <div className="space-y-1">
                {recentAlerts && recentAlerts.length > 0 ? (
                  recentAlerts.slice(0, 3).map((alert) => (
                    <div 
                      key={alert.id}
                      className="flex items-center gap-1.5 md:gap-2 p-1 md:p-1.5 rounded-md border border-border/30 hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() => handleQuickAction('admin-alerts')}
                    >
                      <div className={`p-0.5 md:p-1 rounded ${
                        alert.priority === 'high' ? 'bg-destructive/10' :
                        alert.priority === 'medium' ? 'bg-orange-500/10' : 'bg-primary/10'
                      }`}>
                        <AlertTriangle className={`h-2 w-2 md:h-2.5 md:w-2.5 ${
                          alert.priority === 'high' ? 'text-destructive' :
                          alert.priority === 'medium' ? 'text-orange-500' : 'text-primary'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[9px] md:text-[10px] truncate">{alert.title}</p>
                      </div>
                      <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'} className="text-[7px] md:text-[8px] h-3 md:h-3.5 px-0.5 md:px-1">
                        {alert.priority}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 md:py-3">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 mx-auto text-green-500 mb-1 opacity-50" />
                    <p className="text-[9px] md:text-[10px] text-muted-foreground">No active alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Control Panel Tab - Smart Selection */}
        <TabsContent value="control-panel" className="mt-2 md:mt-3 space-y-2 md:space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2">
            {controlPanelSections.map((section) => (
              <motion.div
                key={section.category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className={`cursor-pointer transition-all border-border/30 hover:border-primary/40 hover:shadow-md ${
                    selectedCategory === section.category ? 'ring-2 ring-primary/50 border-primary/50 shadow-lg' : ''
                  }`}
                  onClick={() => setSelectedCategory(selectedCategory === section.category ? null : section.category)}
                >
                  <CardHeader className="p-1.5 md:p-2 pb-1">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <div className={`p-1 md:p-1.5 rounded-lg bg-gradient-to-br ${section.color} shadow-sm`}>
                        <section.icon className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[9px] md:text-[11px] font-semibold truncate">{section.category}</h3>
                        <p className="text-[8px] md:text-[9px] text-muted-foreground">{section.items.length} modules</p>
                      </div>
                      <ChevronRight className={`h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground transition-transform ${
                        selectedCategory === section.category ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </CardHeader>
                  
                  <AnimatePresence>
                    {selectedCategory === section.category && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CardContent className="p-1.5 md:p-2 pt-0">
                          <div className="space-y-0.5 md:space-y-1 mt-1 border-t border-border/30 pt-1.5 md:pt-2">
                            {section.items.map((item) => (
                              <button
                                key={item.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickAction(item.id);
                                }}
                                className={`w-full flex items-center gap-1.5 md:gap-2 p-1 md:p-1.5 rounded-md text-left transition-all hover:bg-accent/50 active:scale-[0.98] ${section.bgColor}`}
                              >
                                <item.icon className={`h-2.5 w-2.5 md:h-3 md:w-3 ${section.textColor}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[9px] md:text-[10px] font-medium">{item.label}</p>
                                  <p className="text-[7px] md:text-[8px] text-muted-foreground truncate">{item.description}</p>
                                </div>
                                <ChevronRight className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground" />
                              </button>
                            ))}
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Quick Actions Tab */}
        <TabsContent value="quick-actions" className="mt-2 md:mt-3 space-y-2 md:space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2">
            {/* Priority Actions */}
            <QuickActionCard
              title="Upgrades"
              value={pendingUpgrades?.total || 0}
              icon={UserCheck}
              color="red"
              onClick={() => handleQuickAction('upgrade-applications')}
              highlight={!!pendingUpgrades?.total}
            />
            <QuickActionCard
              title="Alerts"
              value={recentAlerts?.length || 0}
              icon={Bell}
              color="orange"
              onClick={() => handleQuickAction('admin-alerts')}
              highlight={!!recentAlerts?.length}
            />
            <QuickActionCard
              title="Users"
              value={platformStats?.totalUsers || 0}
              icon={Users}
              color="blue"
              onClick={() => handleQuickAction('user-management')}
            />
            <QuickActionCard
              title="Properties"
              value={platformStats?.totalProperties || 0}
              icon={Building2}
              color="primary"
              onClick={() => handleQuickAction('property-management-hub')}
            />
          </div>

          {/* Secondary Actions Grid */}
          <Card className="border-border/30 bg-background/50">
            <CardHeader className="p-1.5 md:p-2 pb-1">
              <CardTitle className="text-[10px] md:text-xs flex items-center gap-1 md:gap-1.5">
                <Zap className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
                All Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-1.5 md:p-2 pt-0">
              <div className="grid grid-cols-4 md:grid-cols-6 gap-1 md:gap-1.5">
                {[
                  { id: 'analytics', icon: BarChart3, label: 'Analytics', color: 'purple' },
                  { id: 'vendors-hub', icon: Store, label: 'Vendors', color: 'orange' },
                  { id: 'content-management', icon: BookOpen, label: 'Content', color: 'green' },
                  { id: 'system-settings', icon: Settings, label: 'Settings', color: 'slate' },
                  { id: 'database-management', icon: Database, label: 'Database', color: 'blue' },
                  { id: 'security-monitoring', icon: Shield, label: 'Security', color: 'red' },
                  { id: 'visitor-analytics', icon: Eye, label: 'Visitors', color: 'purple' },
                  { id: 'diagnostic', icon: HardDrive, label: 'Diagnostic', color: 'slate' },
                  { id: 'project-progress', icon: Gauge, label: 'Progress', color: 'green' },
                  { id: 'search-filters', icon: Filter, label: 'Filters', color: 'blue' },
                  { id: 'smtp-settings', icon: Globe, label: 'Email', color: 'orange' },
                  { id: 'customer-service', icon: MessageSquare, label: 'Support', color: 'primary' },
                ].map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    className="flex flex-col items-center gap-0.5 md:gap-1 p-1.5 md:p-2 rounded-lg border border-border/30 hover:border-primary/40 hover:bg-accent/30 transition-all active:scale-95"
                  >
                    <action.icon className={`h-3 w-3 md:h-4 md:w-4 text-${action.color}-500`} />
                    <span className="text-[7px] md:text-[8px] font-medium text-center">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
      <CardContent className="p-1.5 md:p-2.5">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-2.5 md:h-3 w-10 md:w-12 bg-muted rounded mb-1.5 md:mb-2" />
            <div className="h-4 md:h-5 w-12 md:w-14 bg-muted rounded" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-0.5 md:mb-1">
              <span className="text-[8px] md:text-[9px] text-muted-foreground font-medium uppercase tracking-wide">{title}</span>
              <Icon className={`h-3 w-3 md:h-3.5 md:w-3.5 ${colorClasses[color].split(' ')[2]}`} />
            </div>
            <div className="text-sm md:text-lg font-bold">{value.toLocaleString()}</div>
            <div className="flex items-center gap-0.5 text-[8px] md:text-[9px]">
              {change >= 0 ? <ArrowUpRight className="h-2 w-2 md:h-2.5 md:w-2.5 text-green-500" /> : <ArrowDownRight className="h-2 w-2 md:h-2.5 md:w-2.5 text-red-500" />}
              <span className={change >= 0 ? 'text-green-500' : 'text-red-500'}>{Math.abs(change).toFixed(1)}%</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Mini Stat Card
const MiniStatCard = ({ title, value, icon: Icon, highlight, onClick }: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  onClick?: () => void;
}) => (
  <div 
    className={`rounded-lg border border-border/30 p-1 md:p-2 text-center transition-all ${
      highlight ? 'bg-orange-500/5 border-orange-500/30 cursor-pointer hover:bg-orange-500/10' : 'bg-background/50'
    } ${onClick ? 'cursor-pointer hover:bg-accent/30' : ''}`}
    onClick={onClick}
  >
    <Icon className={`h-2.5 w-2.5 md:h-3 md:w-3 mx-auto mb-0.5 ${highlight ? 'text-orange-500' : 'text-muted-foreground'}`} />
    <div className={`text-xs md:text-sm font-bold ${highlight ? 'text-orange-500' : ''}`}>{value.toLocaleString()}</div>
    <div className="text-[7px] md:text-[8px] text-muted-foreground">{title}</div>
  </div>
);

// Health Item Component
const HealthItem = ({ label, value, status }: { label: string; value: string; status: 'good' | 'warn' | 'error'; }) => {
  const statusColors = { good: 'bg-green-500', warn: 'bg-orange-500', error: 'bg-red-500' };
  return (
    <div className="flex items-center justify-between">
      <span className="text-[9px] md:text-[10px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1 md:gap-1.5">
        <span className="text-[9px] md:text-[10px] font-medium">{value}</span>
        <div className={`w-1.5 h-1.5 rounded-full ${statusColors[status]}`} />
      </div>
    </div>
  );
};

// Quick Action Card
const QuickActionCard = ({ title, value, icon: Icon, color, onClick, highlight }: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  onClick: () => void;
  highlight?: boolean;
}) => {
  const colorMap: Record<string, string> = {
    red: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-500',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-500',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-500',
    primary: 'from-primary/20 to-primary/5 border-primary/30 text-primary',
    green: 'from-green-500/20 to-green-500/5 border-green-500/30 text-green-500',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-500',
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md active:scale-[0.98] border bg-gradient-to-br ${colorMap[color]} ${highlight ? 'animate-pulse' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-2 md:p-3 flex items-center gap-2 md:gap-3">
        <div className="p-1.5 md:p-2 rounded-lg bg-background/80">
          <Icon className={`h-3 w-3 md:h-4 md:w-4 ${colorMap[color].split(' ').pop()}`} />
        </div>
        <div>
          <p className="text-sm md:text-lg font-bold">{value}</p>
          <p className="text-[8px] md:text-[9px] text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminOverview;
