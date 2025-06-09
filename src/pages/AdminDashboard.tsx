import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AdminNavigation from "@/components/admin/AdminNavigation";
import UserManagement from "@/components/admin/UserManagement";
import PropertyManagement from "@/components/admin/PropertyManagement";
import SystemSettings from "@/components/admin/SystemSettings";
import SystemReports from "@/components/admin/SystemReports";
import WebsiteDesignSettings from "@/components/admin/WebsiteDesignSettings";
import VendorManagement from "@/components/admin/VendorManagement";
import DatabaseUserManagement from "@/components/admin/DatabaseUserManagement";
import DatabaseTableManagement from "@/components/admin/DatabaseTableManagement";
import ErrorReportingSystem from "@/components/admin/ErrorReportingSystem";
import UserRolesManagement from "@/components/admin/UserRolesManagement";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  Building, 
  Settings, 
  BarChart3, 
  Shield, 
  Bell, 
  TrendingUp,
  Palette,
  Store,
  Database,
  Bug,
  UserCheck,
  Activity,
  Globe,
  Lock
} from "lucide-react";
import SMTPSettings from "@/components/admin/SMTPSettings";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, profile } = useAuth();

  // Direct check for super admin using email
  const isSuperAdmin = user?.email === 'mycode103@gmail.com';

  // Fetch real statistics from database
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      console.log('Fetching admin statistics...');
      
      // Get user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get property count
      const { count: propertyCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Get active listings count
      const { count: activeListings } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Get pending approvals count
      const { count: pendingApprovals } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'pending');

      // Get vendor requests count
      const { count: vendorRequests } = await supabase
        .from('vendor_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get system error count
      const { count: errorCount } = await supabase
        .from('system_error_logs')
        .select('*', { count: 'exact', head: true })
        .eq('is_resolved', false);

      console.log('Admin stats fetched:', {
        userCount,
        propertyCount,
        activeListings,
        pendingApprovals,
        vendorRequests,
        errorCount
      });

      return {
        totalUsers: userCount || 0,
        totalProperties: propertyCount || 0,
        totalRevenue: 0,
        activeListings: activeListings || 0,
        pendingApprovals: (pendingApprovals || 0) + (vendorRequests || 0),
        systemHealth: errorCount === 0 ? 99.5 : Math.max(85, 99.5 - (errorCount * 2)),
        unresolvedErrors: errorCount || 0
      };
    },
    refetchInterval: 30000,
  });

  // Sample admin data for navigation
  const adminData = {
    totalUsers: stats?.totalUsers || 0,
    totalProperties: stats?.totalProperties || 0,
    totalRevenue: stats?.totalRevenue || 0,
    systemHealth: stats?.systemHealth || 0,
    recentActivities: [
      { id: 1, action: "New user registered", timestamp: "2 minutes ago" },
      { id: 2, action: "Property listing approved", timestamp: "5 minutes ago" },
      { id: 3, action: "System backup completed", timestamp: "1 hour ago" }
    ]
  };

  const quickActions = [
    { label: "User Roles", action: () => setActiveTab("user-roles"), icon: UserCheck, variant: "ios" as const },
    { label: "System Monitor", action: () => setActiveTab("system-monitor"), icon: Activity, variant: "ios-green" as const },
    { label: "Security Settings", action: () => setActiveTab("security"), icon: Lock, variant: "ios-red" as const },
    { label: "Database Users", action: () => setActiveTab("database"), icon: Database, variant: "default" as const },
    { label: "Database Tables", action: () => setActiveTab("database-tables"), icon: Database, variant: "ios-purple" as const },
    { label: "Error Reports", action: () => setActiveTab("error-reports"), icon: Bug, variant: "ios-red" as const },
    { label: "Manage Vendors", action: () => setActiveTab("vendors"), icon: Store, variant: "ios-purple" as const },
    { label: "Analytics", action: () => setActiveTab("reports"), icon: BarChart3, variant: "ios-orange" as const }
  ];

  return (
    <div className="min-h-screen bg-background/60 backdrop-blur-xl">
      <AdminNavigation user={user} adminData={adminData} />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          
          {/* Super Admin Status Indicator */}
          {isSuperAdmin && (
            <Card className="glass-ios border-red-500/20 bg-red-50/50 dark:bg-red-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-100">Super Administrator Access</h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      You have full system control and elevated privileges. Email: mycode103@gmail.com
                    </p>
                  </div>
                  <Badge variant="destructive" className="ml-auto">
                    SUPER ADMIN
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-13 glass-ios">
              <TabsTrigger value="overview" className="flex items-center gap-2 text-xs">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2 text-xs">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="user-roles" className="flex items-center gap-2 text-xs">
                <UserCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Roles</span>
              </TabsTrigger>
              <TabsTrigger value="properties" className="flex items-center gap-2 text-xs">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">Properties</span>
              </TabsTrigger>
              <TabsTrigger value="vendors" className="flex items-center gap-2 text-xs">
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">Vendors</span>
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center gap-2 text-xs">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">DB Users</span>
              </TabsTrigger>
              <TabsTrigger value="database-tables" className="flex items-center gap-2 text-xs">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">DB Tables</span>
              </TabsTrigger>
              <TabsTrigger value="error-reports" className="flex items-center gap-2 text-xs">
                <Bug className="h-4 w-4" />
                <span className="hidden sm:inline">Errors</span>
              </TabsTrigger>
              <TabsTrigger value="system-monitor" className="flex items-center gap-2 text-xs">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Monitor</span>
              </TabsTrigger>
              <TabsTrigger value="smtp" className="flex items-center gap-2 text-xs">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">SMTP</span>
              </TabsTrigger>
              <TabsTrigger value="design" className="flex items-center gap-2 text-xs">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Design</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 text-xs">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2 text-xs">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Actions */}
              <Card className="glass-ios">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    {isSuperAdmin ? "Super Admin Controls" : "Quick Actions"}
                  </CardTitle>
                  {isSuperAdmin && (
                    <CardDescription className="text-red-600 font-medium">
                      Full system access granted for mycode103@gmail.com
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant}
                        onClick={action.action}
                        className="h-16 flex flex-col items-center justify-center gap-2 glass-ios"
                      >
                        <action.icon className="h-5 w-5" />
                        <span className="text-xs">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <Card className="glass-ios">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Real registered users
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-ios">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Properties</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalProperties || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Total properties in database
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-ios">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.activeListings || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Approved properties
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-ios">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.pendingApprovals || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.pendingApprovals ? (
                        <Badge variant="destructive" className="text-xs">Needs attention</Badge>
                      ) : (
                        <span className="text-green-600">All clear</span>
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-ios">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Health</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.systemHealth || 0}%</div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.unresolvedErrors === 0 ? (
                        <span className="text-green-600">Excellent</span>
                      ) : (
                        <Badge variant="destructive" className="text-xs">{stats?.unresolvedErrors} errors</Badge>
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* System Status Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-ios">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database Connection</span>
                      <Badge variant="default" className="bg-green-500">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Authentication Service</span>
                      <Badge variant="default" className="bg-green-500">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">File Storage</span>
                      <Badge variant="default" className="bg-green-500">Available</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Background Jobs</span>
                      <Badge variant="default" className="bg-green-500">Running</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-ios">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {adminData.recentActivities.map((activity) => (
                        <div key={activity.id} className="flex justify-between items-center">
                          <span className="text-sm">{activity.action}</span>
                          <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="user-roles">
              <UserRolesManagement />
            </TabsContent>

            <TabsContent value="database">
              <DatabaseUserManagement />
            </TabsContent>

            <TabsContent value="database-tables">
              <DatabaseTableManagement />
            </TabsContent>

            <TabsContent value="error-reports">
              <ErrorReportingSystem />
            </TabsContent>

            <TabsContent value="vendors">
              <VendorManagement />
            </TabsContent>

            <TabsContent value="properties">
              <PropertyManagement />
            </TabsContent>

            <TabsContent value="system-monitor">
              <Card className="glass-ios">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Monitor
                  </CardTitle>
                  <CardDescription>
                    Real-time system performance and health monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">System monitoring dashboard coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="smtp">
              <SMTPSettings />
            </TabsContent>

            <TabsContent value="design">
              <WebsiteDesignSettings />
            </TabsContent>

            <TabsContent value="settings">
              <SystemSettings />
            </TabsContent>

            <TabsContent value="reports">
              <SystemReports />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
