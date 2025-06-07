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
import AdminNavigation from "@/components/admin/AdminNavigation";
import UserManagement from "@/components/admin/UserManagement";
import PropertyManagement from "@/components/admin/PropertyManagement";
import EnhancedContentManagement from "@/components/admin/EnhancedContentManagement";
import SocialMediaManagement from "@/components/admin/SocialMediaManagement";
import SearchFiltersManagement from "@/components/admin/SearchFiltersManagement";
import TrendingTopicsManagement from "@/components/admin/TrendingTopicsManagement";
import { 
  Users, 
  Building, 
  FileText, 
  Settings, 
  Store, 
  CreditCard, 
  Package, 
  Shield, 
  Bot,
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Loading Admin Panel...</h2>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">You don't have admin privileges to access this panel.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <AdminNavigation 
        user={user} 
        adminData={{ 
          is_super_admin: true, 
          role: { name: isDemoAdmin ? 'Demo Admin' : 'Admin' } 
        }} 
      />
      
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              Enhanced Admin Control Panel
            </h1>
            <p className="text-gray-300 mt-2">
              Welcome back, {user?.user_metadata?.full_name || user?.email}
            </p>
            <Badge variant="secondary" className="mt-2 bg-blue-600 text-white">
              {isDemoAdmin ? 'Demo Admin' : 'Admin'}
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-8 bg-white/10 backdrop-blur-md">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-blue-600">Overview</TabsTrigger>
              <TabsTrigger value="users" className="text-white data-[state=active]:bg-blue-600">Users</TabsTrigger>
              <TabsTrigger value="properties" className="text-white data-[state=active]:bg-blue-600">Properties</TabsTrigger>
              <TabsTrigger value="content" className="text-white data-[state=active]:bg-blue-600">Content</TabsTrigger>
              <TabsTrigger value="social" className="text-white data-[state=active]:bg-blue-600">Social</TabsTrigger>
              <TabsTrigger value="filters" className="text-white data-[state=active]:bg-blue-600">Filters</TabsTrigger>
              <TabsTrigger value="trending" className="text-white data-[state=active]:bg-blue-600">Trending</TabsTrigger>
              <TabsTrigger value="settings" className="text-white data-[state=active]:bg-blue-600">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {statsLoading ? '...' : (stats?.users || 0)}
                    </div>
                    <p className="text-xs text-gray-300">Registered users</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Properties</CardTitle>
                    <Building className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {statsLoading ? '...' : (stats?.properties || 0)}
                    </div>
                    <p className="text-xs text-gray-300">Listed properties</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Orders</CardTitle>
                    <Package className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {statsLoading ? '...' : (stats?.orders || 0)}
                    </div>
                    <p className="text-xs text-gray-300">Total orders</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Vendor Requests</CardTitle>
                    <Store className="h-4 w-4 text-orange-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {statsLoading ? '...' : (stats?.vendorRequests || 0)}
                    </div>
                    <p className="text-xs text-gray-300">Pending approval</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">System Errors</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {statsLoading ? '...' : (stats?.errorLogs || 0)}
                    </div>
                    <p className="text-xs text-gray-300">Unresolved errors</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                    <CardDescription className="text-gray-300">Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={() => handleQuickAction('users')} 
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-blue-600 hover:bg-blue-700"
                      variant="outline"
                    >
                      <Users className="h-6 w-6" />
                      <span className="text-sm">Manage Users</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('content')} 
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-green-600 hover:bg-green-700"
                      variant="outline"
                    >
                      <FileText className="h-6 w-6" />
                      <span className="text-sm">Content & SEO</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('social')} 
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-purple-600 hover:bg-purple-700"
                      variant="outline"
                    >
                      <Share2 className="h-6 w-6" />
                      <span className="text-sm">Social Media</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('trending')} 
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-orange-600 hover:bg-orange-700"
                      variant="outline"
                    >
                      <TrendingUp className="h-6 w-6" />
                      <span className="text-sm">Trending Topics</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('filters')} 
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-pink-600 hover:bg-pink-700"
                      variant="outline"
                    >
                      <Search className="h-6 w-6" />
                      <span className="text-sm">Search Filters</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('security')} 
                      className="h-auto p-4 flex flex-col items-center space-y-2 bg-red-600 hover:bg-red-700"
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

            <TabsContent value="content">
              <EnhancedContentManagement />
            </TabsContent>

            <TabsContent value="social">
              <SocialMediaManagement />
            </TabsContent>

            <TabsContent value="filters">
              <SearchFiltersManagement />
            </TabsContent>

            <TabsContent value="trending">
              <TrendingTopicsManagement />
            </TabsContent>

            <TabsContent value="settings">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">System Settings</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage system configuration and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300">System settings panel coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
