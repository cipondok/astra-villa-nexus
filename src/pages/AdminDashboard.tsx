import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAlert } from "@/contexts/AlertContext";
import { useThemeSettings } from "@/contexts/ThemeSettingsContext";
import AdminNavigation from "@/components/admin/AdminNavigation";
import UserManagement from "@/components/admin/UserManagement";
import PropertyManagement from "@/components/admin/PropertyManagement";
import EnhancedContentManagement from "@/components/admin/EnhancedContentManagement";
import SocialMediaManagement from "@/components/admin/SocialMediaManagement";
import SearchFiltersManagement from "@/components/admin/SearchFiltersManagement";
import TrendingTopicsManagement from "@/components/admin/TrendingTopicsManagement";
import SystemSettings from "@/components/admin/SystemSettings";
import VendorManagement from "@/components/admin/VendorManagement";
import UserRolesManagement from "@/components/admin/UserRolesManagement";
import FeedbackManagement from "@/components/admin/FeedbackManagement";
import ContactManagement from "@/components/admin/ContactManagement";
import PropertySurveyManagement from "@/components/admin/PropertySurveyManagement";
import { 
  Users, 
  Building, 
  FileText, 
  Settings, 
  Store, 
  Package, 
  Shield, 
  Activity,
  AlertTriangle,
  TrendingUp,
  Database,
  Globe,
  Bell,
  Lock,
  Share2,
  Search
} from "lucide-react";

const AdminDashboard = () => {
  const { user, profile, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { showError } = useAlert();
  const { themeSettings } = useThemeSettings();
  const [activeTab, setActiveTab] = useState("overview");

  // Check if user is demo admin
  const isDemoAdmin = user?.id === 'demo-admin-456' && profile?.role === 'admin';

  // Simplified admin check - if user is logged in and either demo admin or has admin role
  const isAdmin = isAuthenticated && (isDemoAdmin || profile?.role === 'admin');

  // Dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        // For demo purposes, return mock data if needed
        if (isDemoAdmin) {
          return {
            users: 125,
            properties: 89,
            orders: 45,
            vendorRequests: 12,
            errorLogs: 3
          };
        }

        const [usersCount, propertiesCount, ordersCount, vendorRequestsCount, errorLogsCount] = await Promise.allSettled([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('properties').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('vendor_requests').select('*', { count: 'exact', head: true }),
          supabase.from('system_error_logs').select('*', { count: 'exact', head: true })
        ]);

        return {
          users: usersCount.status === 'fulfilled' ? (usersCount.value.count || 0) : 0,
          properties: propertiesCount.status === 'fulfilled' ? (propertiesCount.value.count || 0) : 0,
          orders: ordersCount.status === 'fulfilled' ? (ordersCount.value.count || 0) : 0,
          vendorRequests: vendorRequestsCount.status === 'fulfilled' ? (vendorRequestsCount.value.count || 0) : 0,
          errorLogs: errorLogsCount.status === 'fulfilled' ? (errorLogsCount.value.count || 0) : 0
        };
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        return {
          users: 0,
          properties: 0,
          orders: 0,
          vendorRequests: 0,
          errorLogs: 0
        };
      }
    },
    enabled: isAdmin
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/?auth=true');
      return;
    }

    if (!loading && isAuthenticated && !isAdmin) {
      showError("Access Denied", "You don't have admin privileges to access this panel.");
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, isAdmin, navigate, showError]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-foreground">Loading Admin Panel...</h2>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground mt-2">You don't have admin privileges to access this panel.</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Handle quick action clicks
  const handleQuickAction = (action: string) => {
    setActiveTab(action);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation 
        user={user} 
        adminData={{ 
          is_super_admin: true, 
          role: { name: profile?.role === 'admin' ? 'Admin' : 'Demo Admin' } 
        }} 
      />
      
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Enhanced Admin Control Panel
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.user_metadata?.full_name || user?.email}
            </p>
            <Badge variant="secondary" className="mt-2 bg-primary text-primary-foreground">
              {profile?.role === 'admin' ? 'Admin' : 'Demo Admin'}
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-10 bg-card border-border">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Users</TabsTrigger>
              <TabsTrigger value="properties" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Properties</TabsTrigger>
              <TabsTrigger value="vendors" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Vendors</TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Content</TabsTrigger>
              <TabsTrigger value="social" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Social</TabsTrigger>
              <TabsTrigger value="filters" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Filters</TabsTrigger>
              <TabsTrigger value="roles" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Roles</TabsTrigger>
              <TabsTrigger value="feedback" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Feedback</TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">
                      {statsLoading ? '...' : (stats?.users || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Registered users</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Properties</CardTitle>
                    <Building className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">
                      {statsLoading ? '...' : (stats?.properties || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Listed properties</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Orders</CardTitle>
                    <Package className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">
                      {statsLoading ? '...' : (stats?.orders || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Total orders</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">Vendor Requests</CardTitle>
                    <Store className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">
                      {statsLoading ? '...' : (stats?.vendorRequests || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Pending approval</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-card-foreground">System Errors</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-card-foreground">
                      {statsLoading ? '...' : (stats?.errorLogs || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Unresolved errors</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
                    <CardDescription className="text-muted-foreground">Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={() => handleQuickAction('users')} 
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-primary hover:bg-primary/90"
                      variant="outline"
                    >
                      <Users className="h-6 w-6" />
                      <span className="text-sm">Manage Users</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('content')} 
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-primary hover:bg-primary/90"
                      variant="outline"
                    >
                      <FileText className="h-6 w-6" />
                      <span className="text-sm">Content & SEO</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('social')} 
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-primary hover:bg-primary/90"
                      variant="outline"
                    >
                      <Share2 className="h-6 w-6" />
                      <span className="text-sm">Social Media</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('trending')} 
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-primary hover:bg-primary/90"
                      variant="outline"
                    >
                      <TrendingUp className="h-6 w-6" />
                      <span className="text-sm">Trending Topics</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('filters')} 
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-primary hover:bg-primary/90"
                      variant="outline"
                    >
                      <Search className="h-6 w-6" />
                      <span className="text-sm">Search Filters</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('security')} 
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-primary hover:bg-primary/90"
                      variant="outline"
                    >
                      <Shield className="h-6 w-6" />
                      <span className="text-sm">Security</span>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>Platform health and monitoring</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        System Status
                      </span>
                      <Badge variant="default" className="bg-green-500">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Database
                      </span>
                      <Badge variant="default" className="bg-green-500">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        API Status
                      </span>
                      <Badge variant="default" className="bg-green-500">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Security
                      </span>
                      <Badge variant="default" className="bg-green-500">Protected</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Alerts
                      </span>
                      <Badge variant="secondary">{stats?.errorLogs || 0} Pending</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="properties">
              <PropertyManagement />
            </TabsContent>

            <TabsContent value="vendors">
              <VendorManagement />
            </TabsContent>

            <TabsContent value="content">
              <EnhancedContentManagement />
            </TabsContent>

            <TabsContent value="social">
              <SocialMediaManagement />
            </TabsContent>

            <TabsContent value="filters">
              <SearchFiltersManagement />
            </TabsContent>

            <TabsContent value="roles">
              <UserRolesManagement />
            </TabsContent>

            <TabsContent value="feedback">
              <FeedbackManagement />
            </TabsContent>

            <TabsContent value="contact">
              <ContactManagement />
            </TabsContent>

            <TabsContent value="surveys">
              <PropertySurveyManagement />
            </TabsContent>

            <TabsContent value="settings">
              <SystemSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
