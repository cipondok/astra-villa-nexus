
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
  Cpu,
  UserCheck
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

  const quickManagementActions = [
    {
      title: "Upgrade Applications",
      description: `${pendingUpgrades?.total || 0} pending applications to review`,
      icon: UserCheck,
      action: "upgrade-applications",
      priority: pendingUpgrades?.total ? "critical" : "medium",
      color: pendingUpgrades?.total ? "bg-red-500/10 text-red-600" : "bg-green-500/10 text-green-600",
      badge: pendingUpgrades?.total || 0
    },
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
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border/30 p-4 md:p-5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-24 translate-x-24"></div>
        <div className="relative">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-1 bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm">
                Platform overview and system status
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${
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
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Active Users Metric */}
        <Card className="relative overflow-hidden border-border/30 bg-gradient-to-br from-blue-500/5 to-background hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
            <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold mb-1">{systemHealth?.activeUsers || 0}</div>
            <div className="flex items-center gap-1 text-[10px]">
              <div className="flex items-center gap-0.5 text-green-500">
                <ArrowUpRight className="h-2.5 w-2.5" />
                <span>12%</span>
              </div>
              <span className="text-muted-foreground">vs 24h</span>
            </div>
            <Progress value={75} className="mt-2 h-1" />
          </CardContent>
        </Card>

        {/* Database Status Metric */}
        <Card className="relative overflow-hidden border-border/30 bg-gradient-to-br from-green-500/5 to-background hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors"></div>
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
            <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Database
            </CardTitle>
            <Database className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold mb-1">
              {systemHealth?.dbErrors === 0 ? '✓' : systemHealth?.dbErrors}
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <span className={systemHealth?.dbErrors === 0 ? "text-green-500" : "text-orange-500"}>
                {systemHealth?.dbErrors === 0 ? 'Healthy' : 'Issues'}
              </span>
            </div>
            <Progress value={systemHealth?.dbErrors === 0 ? 100 : 60} className="mt-2 h-1" />
          </CardContent>
        </Card>

        {/* Pending Vendors Metric */}
        <Card className="relative overflow-hidden border-border/30 bg-gradient-to-br from-orange-500/5 to-background hover:shadow-md transition-all duration-300 group cursor-pointer"
          onClick={() => handleQuickAction('vendors-hub')}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors"></div>
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
            <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold mb-1">{systemHealth?.pendingVendors || 0}</div>
            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-orange-500">Reviews</span>
            </div>
            <Progress value={30} className="mt-2 h-1" />
          </CardContent>
        </Card>

        {/* System Performance Metric */}
        <Card className="relative overflow-hidden border-border/30 bg-gradient-to-br from-purple-500/5 to-background hover:shadow-md transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
            <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Uptime
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold mb-1">99.9%</div>
            <div className="flex items-center gap-1 text-[10px]">
              <CheckCircle className="h-2.5 w-2.5 text-green-500" />
              <span className="text-muted-foreground">Optimal</span>
            </div>
            <Progress value={99.9} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Recent Alerts */}
        <Card className="lg:col-span-2 border-border/30 bg-background/50 backdrop-blur-sm">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <CardTitle className="text-sm">Recent Alerts</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleQuickAction('admin-alerts')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-2">
              {recentAlerts && recentAlerts.length > 0 ? (
                recentAlerts.slice(0, 4).map((alert) => (
                  <div 
                    key={alert.id}
                    className="flex items-start gap-2 p-2.5 rounded-lg border border-border/30 hover:bg-accent/30 transition-colors cursor-pointer"
                    onClick={() => handleQuickAction('admin-alerts')}
                  >
                    <div className={`p-1.5 rounded-md ${
                      alert.priority === 'high' ? 'bg-destructive/10' :
                      alert.priority === 'medium' ? 'bg-orange-500/10' :
                      'bg-primary/10'
                    }`}>
                      <AlertTriangle className={`h-3 w-3 ${
                        alert.priority === 'high' ? 'text-destructive' :
                        alert.priority === 'medium' ? 'text-orange-500' :
                        'text-primary'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-medium text-xs truncate">{alert.title}</p>
                        <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'} className="ml-1 text-[9px] h-4 px-1.5">
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{alert.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2 opacity-50" />
                  <p className="text-xs text-muted-foreground">No active alerts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Resources */}
        <Card className="border-border/30 bg-background/50 backdrop-blur-sm">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Resources</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-3">
            {/* CPU Usage */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Cpu className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">CPU</span>
                </div>
                <span className="text-[10px] text-muted-foreground">42%</span>
              </div>
              <Progress value={42} className="h-1" />
            </div>

            {/* Memory Usage */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Database className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">Memory</span>
                </div>
                <span className="text-[10px] text-muted-foreground">2.1/4GB</span>
              </div>
              <Progress value={52.5} className="h-1" />
            </div>

            {/* Storage */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Server className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">Storage</span>
                </div>
                <span className="text-[10px] text-muted-foreground">68/100GB</span>
              </div>
              <Progress value={68.4} className="h-1" />
            </div>

            {/* Network */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Activity className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">Network</span>
                </div>
                <span className="text-[10px] text-muted-foreground">↓1.2MB/s</span>
              </div>
              <Progress value={30} className="h-1" />
            </div>

            <Button 
              variant="outline" 
              size="sm"
              className="w-full h-7 text-xs mt-2"
              onClick={() => handleQuickAction('diagnostic')}
            >
              <Activity className="h-3 w-3 mr-1.5" />
              Diagnostics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border/30 bg-background/50 backdrop-blur-sm">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {quickManagementActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.action)}
                className="group relative overflow-hidden rounded-lg border border-border/30 p-3 text-left transition-all hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 bg-gradient-to-br from-background to-accent/5"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
                {action.badge !== undefined && action.badge > 0 && (
                  <div className="absolute top-2 right-2 bg-destructive text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {action.badge}
                  </div>
                )}
                <div className="relative">
                  <div className={`inline-flex p-1.5 rounded-md mb-2 ${action.color}`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-medium text-xs mb-0.5 group-hover:text-primary transition-colors truncate">
                    {action.title}
                  </h3>
                  <p className="text-[9px] text-muted-foreground line-clamp-1">
                    {action.description}
                  </p>
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
