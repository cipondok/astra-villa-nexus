
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
  ArrowUpRight,
  ArrowDownRight,
  Server,
  Cpu
} from "lucide-react";
import AdminQuickActions from "./AdminQuickActions";
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border/50 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Welcome back! Here's what's happening with your platform.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                systemHealth?.systemStatus === 'healthy' 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : 'bg-orange-500/10 border border-orange-500/20'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  systemHealth?.systemStatus === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-orange-500 animate-pulse'
                }`}></div>
                <span className="text-sm font-medium">
                  {systemHealth?.systemStatus === 'healthy' ? 'All Systems Operational' : 'Needs Attention'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Users Metric */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-blue-500/5 to-background hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{systemHealth?.activeUsers || 0}</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-green-500">
                <ArrowUpRight className="h-3 w-3" />
                <span>12%</span>
              </div>
              <span className="text-muted-foreground">vs last 24h</span>
            </div>
            <Progress value={75} className="mt-3 h-1" />
          </CardContent>
        </Card>

        {/* Database Status Metric */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-green-500/5 to-background hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Database Health
            </CardTitle>
            <Database className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {systemHealth?.dbErrors === 0 ? 'Healthy' : `${systemHealth?.dbErrors} Issues`}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={systemHealth?.dbErrors === 0 ? "text-green-500" : "text-orange-500"}>
                {systemHealth?.dbErrors === 0 ? '✓ No errors detected' : '⚠ Requires attention'}
              </span>
            </div>
            <Progress value={systemHealth?.dbErrors === 0 ? 100 : 60} className="mt-3 h-1" />
          </CardContent>
        </Card>

        {/* Pending Vendors Metric */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-orange-500/5 to-background hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Reviews
            </CardTitle>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{systemHealth?.pendingVendors || 0}</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-orange-500">Vendor applications</span>
            </div>
            {systemHealth?.pendingVendors && systemHealth.pendingVendors > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-3 w-full text-xs"
                onClick={() => handleQuickAction('vendors-hub')}
              >
                Review Now →
              </Button>
            )}
          </CardContent>
        </Card>

        {/* System Performance Metric */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-purple-500/5 to-background hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              System Load
            </CardTitle>
            <Activity className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">99.9%</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-green-500">
                <CheckCircle className="h-3 w-3" />
                <span>Optimal</span>
              </div>
              <span className="text-muted-foreground">uptime</span>
            </div>
            <Progress value={99.9} className="mt-3 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <CardTitle>Recent Alerts</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleQuickAction('admin-alerts')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts && recentAlerts.length > 0 ? (
                recentAlerts.slice(0, 5).map((alert) => (
                  <div 
                    key={alert.id}
                    className="flex items-start gap-3 p-4 rounded-lg border border-border/50 hover:bg-accent/5 transition-colors cursor-pointer"
                    onClick={() => handleQuickAction('admin-alerts')}
                  >
                    <div className={`p-2 rounded-lg ${
                      alert.priority === 'high' ? 'bg-red-500/10' :
                      alert.priority === 'medium' ? 'bg-orange-500/10' :
                      'bg-blue-500/10'
                    }`}>
                      <AlertTriangle className={`h-4 w-4 ${
                        alert.priority === 'high' ? 'text-red-500' :
                        alert.priority === 'medium' ? 'text-orange-500' :
                        'text-blue-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm truncate">{alert.title}</p>
                        <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'} className="ml-2">
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3 opacity-50" />
                  <p className="text-muted-foreground">No active alerts</p>
                  <p className="text-sm text-muted-foreground mt-1">All systems operating normally</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Resources */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <CardTitle>System Resources</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* CPU Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">CPU Usage</span>
                </div>
                <span className="text-sm text-muted-foreground">42%</span>
              </div>
              <Progress value={42} className="h-2" />
            </div>

            {/* Memory Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Memory</span>
                </div>
                <span className="text-sm text-muted-foreground">2.1 / 4.0 GB</span>
              </div>
              <Progress value={52.5} className="h-2" />
            </div>

            {/* Storage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Storage</span>
                </div>
                <span className="text-sm text-muted-foreground">68.4 / 100 GB</span>
              </div>
              <Progress value={68.4} className="h-2" />
            </div>

            {/* Network */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Network</span>
                </div>
                <span className="text-sm text-muted-foreground">↓ 1.2 MB/s</span>
              </div>
              <Progress value={30} className="h-2" />
            </div>

            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => handleQuickAction('diagnostic')}
            >
              <Activity className="h-4 w-4 mr-2" />
              Full Diagnostics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Panel */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickManagementActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.action)}
                className="group relative overflow-hidden rounded-xl border border-border/50 p-6 text-left transition-all hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 bg-gradient-to-br from-background to-accent/5"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                <div className="relative">
                  <div className={`inline-flex p-3 rounded-lg mb-4 ${action.color}`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {action.description}
                  </p>
                  <Badge 
                    variant={action.priority === 'critical' ? 'destructive' : 'secondary'}
                    className="mt-3"
                  >
                    {action.priority}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Quick Access */}
      <AdminQuickAccess onSectionChange={onSectionChange} />
    </div>
  );
};

export default AdminOverview;
