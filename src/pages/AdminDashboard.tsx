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

  // Dashboard statistics with error handling for admin_users recursion
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

        // Use Promise.allSettled to handle potential RLS issues gracefully
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
        // Return default values if there's an error
        return {
          users: 0,
          properties: 0,
          orders: 0,
          vendorRequests: 0,
          errorLogs: 0
        };
      }
    },
    enabled: isAdmin,
    retry: 1, // Reduce retries to avoid infinite recursion loops
    retryDelay: 2000
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
            <div className="bg-card rounded-lg p-3 shadow-sm border border-border">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2 bg-transparent h-auto p-1">
                <TabsTrigger 
                  value="overview" 
                  className="whitespace-nowrap text-xs md:text-sm px-3 py-2.5 rounded-md transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-background border border-border"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="whitespace-nowrap text-xs md:text-sm px-3 py-2.5 rounded-md transition-all duration-200 data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-green-50 dark:hover:bg-green-900/20 bg-background border border-border"
                >
                  Users
                </TabsTrigger>
                <TabsTrigger 
                  value="properties" 
                  className="whitespace-nowrap text-xs md:text-sm px-3 py-2.5 rounded-md transition-all duration-200 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-orange-50 dark:hover:bg-orange-900/20 bg-background border border-border"
                >
                  Properties
                </TabsTrigger>
                <TabsTrigger 
                  value="vendors" 
                  className="whitespace-nowrap text-xs md:text-sm px-3 py-2.5 rounded-md transition-all duration-200 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-purple-50 dark:hover:bg-purple-900/20 bg-background border border-border"
                >
                  Vendors
                </TabsTrigger>
                <TabsTrigger 
                  value="content" 
                  className="whitespace-nowrap text-xs md:text-sm px-3 py-2.5 rounded-md transition-all duration-200 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 bg-background border border-border"
                >
                  Content
                </TabsTrigger>
                <TabsTrigger 
                  value="social" 
                  className="whitespace-nowrap text-xs md:text-sm px-3 py-2.5 rounded-md transition-all duration-200 data-[state=active]:bg-pink-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-pink-50 dark:hover:bg-pink-900/20 bg-background border border-border"
                >
                  Social
                </TabsTrigger>
                <TabsTrigger 
                  value="filters" 
                  className="whitespace-nowrap text-xs md:text-sm px-3 py-2.5 rounded-md transition-all duration-200 data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-teal-50 dark:hover:bg-teal-900/20 bg-background border border-border"
                >
                  Filters
                </TabsTrigger>
                <TabsTrigger 
                  value="roles" 
                  className="whitespace-nowrap text-xs md:text-sm px-3 py-2.5 rounded-md transition-all duration-200 data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-cyan-50 dark:hover:bg-cyan-900/20 bg-background border border-border"
                >
                  Roles
                </TabsTrigger>
                <TabsTrigger 
                  value="feedback" 
                  className="whitespace-nowrap text-xs md:text-sm px-3 py-2.5 rounded-md transition-all duration-200 data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-amber-50 dark:hover:bg-amber-900/20 bg-background border border-border"
                >
                  Feedback
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="whitespace-nowrap text-xs md:text-sm px-3 py-2.5 rounded-md transition-all duration-200 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 bg-background border border-border"
                >
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="bg-card border-border hover:shadow-md transition-shadow">
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

                <Card className="bg-card border-border hover:shadow-md transition-shadow">
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

                <Card className="bg-card border-border hover:shadow-md transition-shadow">
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

                <Card className="bg-card border-border hover:shadow-md transition-shadow">
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

                <Card className="bg-card border-border hover:shadow-md transition-shadow">
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
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-green-600 hover:bg-green-700 text-white"
                      variant="default"
                    >
                      <Users className="h-6 w-6" />
                      <span className="text-sm">Manage Users</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('content')} 
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                      variant="default"
                    >
                      <FileText className="h-6 w-6" />
                      <span className="text-sm">Content & SEO</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('social')} 
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-pink-600 hover:bg-pink-700 text-white"
                      variant="default"
                    >
                      <Share2 className="h-6 w-6" />
                      <span className="text-sm">Social Media</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('filters')} 
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-teal-600 hover:bg-teal-700 text-white"
                      variant="default"
                    >
                      <Search className="h-6 w-6" />
                      <span className="text-sm">Search Filters</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('vendors')} 
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-purple-600 hover:bg-purple-700 text-white"
                      variant="default"
                    >
                      <Store className="h-6 w-6" />
                      <span className="text-sm">Vendors</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('settings')} 
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-red-600 hover:bg-red-700 text-white"
                      variant="default"
                    >
                      <Settings className="h-6 w-6" />
                      <span className="text-sm">Settings</span>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">System Status</CardTitle>
                    <CardDescription className="text-muted-foreground">Platform health and monitoring</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2 text-card-foreground">
                        <Activity className="h-4 w-4" />
                        System Status
                      </span>
                      <Badge variant="default" className="bg-green-500 text-white">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2 text-card-foreground">
                        <Database className="h-4 w-4" />
                        Database
                      </span>
                      <Badge variant="default" className="bg-green-500 text-white">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2 text-card-foreground">
                        <Globe className="h-4 w-4" />
                        API Status
                      </span>
                      <Badge variant="default" className="bg-green-500 text-white">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2 text-card-foreground">
                        <Lock className="h-4 w-4" />
                        Security
                      </span>
                      <Badge variant="default" className="bg-green-500 text-white">Protected</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2 text-card-foreground">
                        <Bell className="h-4 w-4" />
                        Alerts
                      </span>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">{stats?.errorLogs || 0} Pending</Badge>
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
