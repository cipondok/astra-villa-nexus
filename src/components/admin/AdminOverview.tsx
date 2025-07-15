
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Wrench, 
  Database, 
  Settings, 
  Users, 
  Building2, 
  TrendingUp,
  Activity,
  MessageSquare,
  BarChart3,
  Zap,
  Eye,
  Globe,
  Search,
  MousePointer
} from "lucide-react";
import AdminQuickActions from "./AdminQuickActions";
import WebTrafficAnalytics from "./WebTrafficAnalytics";
import ASTRATokenAnalytics from "./ASTRATokenAnalytics";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";

interface AdminOverviewProps {
  onSectionChange?: (section: string) => void;
}

const AdminOverview = ({ onSectionChange }: AdminOverviewProps) => {
  
  const handleQuickAction = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

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
      try {
        // Check recent database errors
        const { count: dbErrors } = await supabase
          .from('database_error_tracking')
          .select('*', { count: 'exact', head: true })
          .eq('is_resolved', false);

        // Check recent user activity (last 24h)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: activeUsers } = await supabase
          .from('user_activity_logs')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', yesterday);

        // Check pending vendor applications
        const { count: pendingVendors } = await supabase
          .from('vendor_business_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_verified', false);

        return {
          dbErrors: dbErrors || 0,
          activeUsers: activeUsers || 0,
          pendingVendors: pendingVendors || 0,
          systemStatus: dbErrors === 0 ? 'healthy' : 'issues'
        };
      } catch (error) {
        console.error('Error fetching system health:', error);
        return {
          dbErrors: 0,
          activeUsers: 0,
          pendingVendors: 0,
          systemStatus: 'unknown'
        };
      }
    },
    refetchInterval: 60000,
  });

  // Fetch analytics data for overview
  const { data: analyticsData } = useQuery({
    queryKey: ['overview-analytics'],
    queryFn: async () => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        // Get daily analytics
        const { data: dailyStats } = await supabase
          .from('daily_analytics')
          .select('*')
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])
          .order('date', { ascending: true });

        // Get vendor bookings
        const { data: bookings } = await supabase
          .from('vendor_bookings')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        // Get recent searches
        const { data: searches } = await supabase
          .from('search_analytics')
          .select('search_query')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        const totalVisitors = dailyStats?.reduce((sum, day) => sum + (day.total_visitors || 0), 0) || 0;
        const totalPageViews = dailyStats?.reduce((sum, day) => sum + (day.total_page_views || 0), 0) || 0;
        const totalSearches = searches?.length || 0;
        const totalBookings = bookings?.length || 0;

        return {
          dailyStats: dailyStats || [],
          totalVisitors,
          totalPageViews,
          totalSearches,
          totalBookings,
          bookings: bookings || []
        };
      } catch (error) {
        console.error('Error fetching analytics:', error);
        return {
          dailyStats: [],
          totalVisitors: 0,
          totalPageViews: 0,
          totalSearches: 0,
          totalBookings: 0,
          bookings: []
        };
      }
    },
    refetchInterval: 300000, // 5 minutes
  });

  const quickManagementActions = [
    {
      title: "User Management",
      description: "Manage user accounts, roles, and permissions",
      icon: Users,
      action: "user-management",
      priority: "high",
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Property Hub",
      description: "Oversee property listings and approvals",
      icon: Building2,
      action: "property-management-hub",
      priority: "high",
      color: "bg-accent/10 text-accent"
    },
    {
      title: "Vendor Control",
      description: "Monitor vendor services and verification",
      icon: Shield,
      action: "vendors-hub",
      priority: "medium",
      color: "bg-secondary/10 text-secondary"
    },
    {
      title: "System Monitor",
      description: "Check system health and diagnostics",
      icon: Activity,
      action: "diagnostic",
      priority: "critical",
      color: "bg-orange-500/10 text-orange-600"
    }
  ];

  return (
    <div className="space-y-6 hud-grid min-h-screen p-4">
      {/* HUD Header */}
      <div className="hud-border p-6 relative overflow-hidden">
        <div className="data-stream"></div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-green-500 rounded-full pulse-dot"></div>
            <h1 className="text-3xl font-bold hud-text">ADMIN CONTROL INTERFACE</h1>
          </div>
          <div className="text-right">
            <div className="hud-accent text-sm">SYSTEM STATUS</div>
            <div className="hud-text text-lg font-mono">ONLINE</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="hud-border p-3">
            <div className="hud-accent text-xs">UPTIME</div>
            <div className="hud-text font-mono text-lg">99.9%</div>
          </div>
          <div className="hud-border p-3">
            <div className="hud-accent text-xs">PROCESSES</div>
            <div className="hud-text font-mono text-lg">{systemHealth?.activeUsers || 0}</div>
          </div>
          <div className="hud-border p-3">
            <div className="hud-accent text-xs">MEMORY</div>
            <div className="hud-text font-mono text-lg">2.1GB</div>
          </div>
          <div className="hud-border p-3">
            <div className="hud-accent text-xs">LOAD</div>
            <div className="hud-text font-mono text-lg">0.42</div>
          </div>
        </div>
      </div>

      {/* System Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health Matrix */}
        <div className="lg:col-span-2">
          <div className="hud-border p-6 hud-glow">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-6 w-6 hud-text" />
              <h3 className="text-xl font-bold hud-text">SYSTEM MATRIX</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="hud-border p-4 bg-gradient-to-br from-green-900/20 to-green-700/20">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-xs hud-accent">OPERATIONAL</span>
                </div>
                <div className="text-2xl font-bold text-green-400">{systemHealth?.activeUsers || 0}</div>
                <div className="text-xs text-green-300">Active Users</div>
              </div>
              <div className="hud-border p-4 bg-gradient-to-br from-blue-900/20 to-blue-700/20">
                <div className="flex items-center justify-between mb-2">
                  <Database className="h-5 w-5 text-blue-400" />
                  <span className="text-xs hud-accent">STABLE</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">{systemHealth?.dbErrors === 0 ? 'OK' : 'ERR'}</div>
                <div className="text-xs text-blue-300">Database Status</div>
              </div>
              <div className="hud-border p-4 bg-gradient-to-br from-orange-900/20 to-orange-700/20">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-5 w-5 text-orange-400" />
                  <span className="text-xs hud-accent">PENDING</span>
                </div>
                <div className="text-2xl font-bold text-orange-400">{systemHealth?.pendingVendors || 0}</div>
                <div className="text-xs text-orange-300">Vendor Reviews</div>
              </div>
              <div className="hud-border p-4 bg-gradient-to-br from-purple-900/20 to-purple-700/20">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  <span className="text-xs hud-accent">ANALYTICS</span>
                </div>
                <div className="text-2xl font-bold text-purple-400">2.4K</div>
                <div className="text-xs text-purple-300">Daily Events</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Stream */}
        <div className="hud-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 hud-accent" />
            <h3 className="text-xl font-bold hud-text">ALERT STREAM</h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentAlerts && recentAlerts.length > 0 ? (
              recentAlerts.slice(0, 4).map((alert, index) => (
                <div key={alert.id} className="hud-border p-3 bg-gradient-to-r from-red-900/20 to-transparent">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full pulse-dot"></div>
                    <span className="text-sm hud-text font-mono">{alert.title}</span>
                  </div>
                  <div className="text-xs text-red-300 ml-4">{alert.message}</div>
                  <div className="text-xs hud-accent mt-1 ml-4">
                    {new Date(alert.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-green-400">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">ALL SYSTEMS NOMINAL</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Command Panel */}
      <div className="hud-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-6 w-6 hud-text" />
          <h3 className="text-xl font-bold hud-text">COMMAND INTERFACE</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickManagementActions.map((action, index) => (
            <div 
              key={index}
              className="hud-border p-4 cursor-pointer hover:hud-glow transition-all duration-300 group rounded-full aspect-square flex flex-col items-center justify-center relative"
              onClick={() => handleQuickAction(action.action)}
            >
              {/* Circular Background Animation */}
              <div className="absolute inset-2 rounded-full border-2 border-cyan-900/30"></div>
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-cyan-400/50 group-hover:border-t-cyan-400 transition-colors"></div>
              
              <div className="text-center z-10">
                <div className="p-3 rounded-full bg-gradient-to-br from-cyan-900/40 to-blue-900/40 mb-2">
                  <action.icon className="h-6 w-6 hud-text" />
                </div>
                <p className="font-medium hud-text group-hover:hud-accent transition-colors text-sm">
                  {action.title}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                  action.priority === 'critical' ? 'bg-red-900/40 text-red-300' :
                  action.priority === 'high' ? 'bg-orange-900/40 text-orange-300' :
                  'bg-blue-900/40 text-blue-300'
                }`}>
                  {action.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="lg:col-span-1">
          <div className="hud-border p-6 hud-glow">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-6 w-6 hud-text" />
              <h3 className="text-xl font-bold hud-text">ANALYTICS OVERVIEW</h3>
            </div>
            <div className="space-y-4">
              <div className="hud-border p-4 bg-gradient-to-br from-blue-900/20 to-blue-700/20">
                <div className="flex items-center justify-between mb-2">
                  <Globe className="h-5 w-5 text-blue-400" />
                  <span className="text-xs hud-accent">7D TOTAL</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">{analyticsData?.totalVisitors || 0}</div>
                <div className="text-xs text-blue-300">Website Visitors</div>
              </div>
              <div className="hud-border p-4 bg-gradient-to-br from-green-900/20 to-green-700/20">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-5 w-5 text-green-400" />
                  <span className="text-xs hud-accent">PAGE VIEWS</span>
                </div>
                <div className="text-2xl font-bold text-green-400">{analyticsData?.totalPageViews || 0}</div>
                <div className="text-xs text-green-300">Total Views</div>
              </div>
              <div className="hud-border p-4 bg-gradient-to-br from-purple-900/20 to-purple-700/20">
                <div className="flex items-center justify-between mb-2">
                  <Search className="h-5 w-5 text-purple-400" />
                  <span className="text-xs hud-accent">SEARCHES</span>
                </div>
                <div className="text-2xl font-bold text-purple-400">{analyticsData?.totalSearches || 0}</div>
                <div className="text-xs text-purple-300">User Searches</div>
              </div>
              <div className="hud-border p-4 bg-gradient-to-br from-orange-900/20 to-orange-700/20">
                <div className="flex items-center justify-between mb-2">
                  <MessageSquare className="h-5 w-5 text-orange-400" />
                  <span className="text-xs hud-accent">BOOKINGS</span>
                </div>
                <div className="text-2xl font-bold text-orange-400">{analyticsData?.totalBookings || 0}</div>
                <div className="text-xs text-orange-300">New Bookings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Traffic Trend Chart */}
        <div className="lg:col-span-2">
          <div className="hud-border p-6 hud-glow">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 hud-text" />
              <h3 className="text-xl font-bold hud-text">TRAFFIC TRENDS</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData?.dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total_visitors" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                    name="Visitors"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total_page_views" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                    name="Page Views"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Analytics Actions */}
      <div className="hud-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="h-6 w-6 hud-text" />
          <h3 className="text-xl font-bold hud-text">ANALYTICS MODULES</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="hud-border p-4 h-auto flex flex-col items-center gap-2 hover:hud-glow"
            onClick={() => handleQuickAction('analytics')}
          >
            <Globe className="h-8 w-8 text-blue-400" />
            <span className="hud-text">Web Analytics</span>
            <span className="text-xs hud-accent">Traffic & Behavior</span>
          </Button>
          <Button 
            variant="outline" 
            className="hud-border p-4 h-auto flex flex-col items-center gap-2 hover:hud-glow"
            onClick={() => handleQuickAction('astra-token-hub')}
          >
            <Zap className="h-8 w-8 text-yellow-400" />
            <span className="hud-text">ASTRA Tokens</span>
            <span className="text-xs hud-accent">Token Analytics</span>
          </Button>
          <Button 
            variant="outline" 
            className="hud-border p-4 h-auto flex flex-col items-center gap-2 hover:hud-glow"
            onClick={() => handleQuickAction('vendors-hub')}
          >
            <Building2 className="h-8 w-8 text-green-400" />
            <span className="hud-text">Vendor Analytics</span>
            <span className="text-xs hud-accent">Service Metrics</span>
          </Button>
          <Button 
            variant="outline" 
            className="hud-border p-4 h-auto flex flex-col items-center gap-2 hover:hud-glow"
            onClick={() => handleQuickAction('system-reports')}
          >
            <BarChart3 className="h-8 w-8 text-purple-400" />
            <span className="hud-text">System Reports</span>
            <span className="text-xs hud-accent">Performance Data</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
