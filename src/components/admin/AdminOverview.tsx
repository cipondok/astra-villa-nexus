
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
  Eye
} from "lucide-react";
import AdminQuickActions from "./AdminQuickActions";

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
    <div className="space-y-6">
      {/* Quick Actions Component */}
      <AdminQuickActions onTabChange={handleQuickAction} />
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Administrative Overview</h2>
          <p className="text-muted-foreground">
            Executive dashboard with system insights and critical alerts
          </p>
        </div>
      </div>

      {/* System Health & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="admin-card gold-glow-hover border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5 text-primary" />
              System Health Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                {systemHealth?.systemStatus === 'healthy' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
                <div>
                  <p className="font-medium text-foreground">Database Status</p>
                  <p className="text-xs text-muted-foreground">
                    {systemHealth?.dbErrors === 0 ? 'All systems operational' : `${systemHealth?.dbErrors} errors detected`}
                  </p>
                </div>
              </div>
              <Badge variant={systemHealth?.systemStatus === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth?.systemStatus === 'healthy' ? 'Healthy' : 'Issues'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-primary/5 border">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">Active Users</p>
                </div>
                <p className="text-xl font-bold text-primary">{systemHealth?.activeUsers || 0}</p>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </div>

              <div className="p-3 rounded-lg bg-orange-500/5 border">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <p className="text-sm font-medium text-foreground">Pending Reviews</p>
                </div>
                <p className="text-xl font-bold text-orange-600">{systemHealth?.pendingVendors || 0}</p>
                <p className="text-xs text-muted-foreground">Vendor applications</p>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full gold-glow-hover" 
              onClick={() => handleQuickAction('diagnostic')}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Run System Diagnostics
            </Button>
          </CardContent>
        </Card>

        <Card className="admin-card gold-glow-hover border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts && recentAlerts.length > 0 ? (
              recentAlerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className={`p-1 rounded-full ${
                    alert.priority === 'high' ? 'bg-destructive/20' :
                    alert.priority === 'medium' ? 'bg-orange-500/20' :
                    'bg-primary/20'
                  }`}>
                    {alert.priority === 'high' ? (
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent alerts</p>
              </div>
            )}
            
            <Button 
              variant="outline" 
              className="w-full mt-4" 
              onClick={() => handleQuickAction('admin-alerts')}
            >
              <Eye className="h-4 w-4 mr-2" />
              View All Alerts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Management Actions */}
      <Card className="admin-card gold-glow-hover border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5 text-primary" />
            Quick Management Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickManagementActions.map((action, index) => (
              <Card 
                key={index}
                className="admin-card gold-glow-hover border-border/30 hover:border-border transition-colors cursor-pointer group"
                onClick={() => handleQuickAction(action.action)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {action.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {action.description}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`mt-2 text-xs ${
                          action.priority === 'critical' ? 'border-destructive text-destructive' :
                          action.priority === 'high' ? 'border-orange-600 text-orange-600' :
                          'border-primary text-primary'
                        }`}
                      >
                        {action.priority}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
