
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
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  Building, 
  Settings, 
  BarChart3, 
  Shield, 
  Bell, 
  DollarSign, 
  TrendingUp,
  Palette,
  Store,
  Database
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, profile } = useAuth();

  // Check if current user is super admin
  const { data: isSuperAdmin } = useQuery({
    queryKey: ['is-super-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('is_super_admin')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error checking super admin status:', error);
        return false;
      }
      
      return data?.is_super_admin || false;
    },
    enabled: !!user?.id,
  });

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

      console.log('Admin stats fetched:', {
        userCount,
        propertyCount,
        activeListings,
        pendingApprovals,
        vendorRequests
      });

      return {
        totalUsers: userCount || 0,
        totalProperties: propertyCount || 0,
        totalRevenue: 0, // You can calculate this from orders table
        activeListings: activeListings || 0,
        pendingApprovals: (pendingApprovals || 0) + (vendorRequests || 0),
        systemHealth: 98.5
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
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
    { label: "Add Property", action: () => console.log("Add property"), icon: Building, variant: "ios" as const },
    { label: "Manage Users", action: () => setActiveTab("users"), icon: Users, variant: "ios-green" as const },
    { label: "Database Users", action: () => setActiveTab("database"), icon: Database, variant: "default" as const },
    { label: "Manage Vendors", action: () => setActiveTab("vendors"), icon: Store, variant: "ios-purple" as const },
    { label: "System Reports", action: () => setActiveTab("reports"), icon: BarChart3, variant: "ios-orange" as const }
  ];

  return (
    <div className="min-h-screen bg-background/60 backdrop-blur-xl">
      <AdminNavigation user={user} adminData={adminData} />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          
          {/* Super Admin Status Indicator */}
          {isSuperAdmin && (
            <Card className="glass-ios border-red-500/20 bg-red-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-900">Super Administrator Access</h3>
                    <p className="text-sm text-red-700">
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
            <TabsList className="grid w-full grid-cols-8 glass-ios">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database
              </TabsTrigger>
              <TabsTrigger value="vendors" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Vendors
              </TabsTrigger>
              <TabsTrigger value="properties" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Properties
              </TabsTrigger>
              <TabsTrigger value="design" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Design
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports
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

              {/* Real Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <Card className="glass-ios">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">{stats?.totalUsers || 0}</div>
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
                    <div className="text-xl font-bold">{stats?.totalProperties || 0}</div>
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
                    <div className="text-xl font-bold">{stats?.activeListings || 0}</div>
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
                    <div className="text-xl font-bold">{stats?.pendingApprovals || 0}</div>
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
                    <div className="text-xl font-bold">{stats?.systemHealth || 0}%</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">Excellent</span> performance
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="database">
              <DatabaseUserManagement />
            </TabsContent>

            <TabsContent value="vendors">
              <VendorManagement />
            </TabsContent>

            <TabsContent value="properties">
              <PropertyManagement />
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
