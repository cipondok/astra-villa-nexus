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
  Search,
  BarChart3,
  Zap
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

  // Dashboard statistics with improved error handling to prevent infinite recursion
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
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

        // Use individual queries with better error handling
        const statsPromises = [
          supabase.from('profiles').select('*', { count: 'exact', head: true }).then(res => res.count || 0),
          supabase.from('properties').select('*', { count: 'exact', head: true }).then(res => res.count || 0),
          supabase.from('orders').select('*', { count: 'exact', head: true }).then(res => res.count || 0),
          supabase.from('vendor_requests').select('*', { count: 'exact', head: true }).then(res => res.count || 0),
          supabase.from('system_error_logs').select('*', { count: 'exact', head: true }).then(res => res.count || 0)
        ];

        const [users, properties, orders, vendorRequests, errorLogs] = await Promise.allSettled(statsPromises);

        return {
          users: users.status === 'fulfilled' ? users.value : 0,
          properties: properties.status === 'fulfilled' ? properties.value : 0,
          orders: orders.status === 'fulfilled' ? orders.value : 0,
          vendorRequests: vendorRequests.status === 'fulfilled' ? vendorRequests.value : 0,
          errorLogs: errorLogs.status === 'fulfilled' ? errorLogs.value : 0
        };
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
        // Return default values instead of throwing
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
    retry: 1,
    retryDelay: 3000,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-400 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-white">Loading Control Panel...</h2>
          <p className="text-blue-200 mt-2">Initializing admin systems</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/20">
          <Shield className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-blue-200 mb-6">You don't have admin privileges to access this control panel.</p>
          <Button onClick={() => navigate('/dashboard')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
            Return to Dashboard
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <AdminNavigation 
        user={user} 
        adminData={{ 
          is_super_admin: true, 
          role: { name: profile?.role === 'admin' ? 'Admin' : 'Demo Admin' } 
        }} 
      />
      
      <div className="pt-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Control Panel
                </h1>
                <p className="text-blue-200 text-lg">
                  Welcome back, {user?.user_metadata?.full_name || user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30 px-4 py-2 text-sm">
                <Zap className="h-4 w-4 mr-2" />
                {profile?.role === 'admin' ? 'System Administrator' : 'Demo Administrator'}
              </Badge>
              <Badge className="bg-green-600/20 text-green-300 border-green-500/30 px-4 py-2 text-sm">
                <Activity className="h-4 w-4 mr-2" />
                Online
              </Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            {/* Modern Tab Navigation */}
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-2 border border-blue-500/20 shadow-2xl">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2 bg-transparent h-auto p-2">
                <TabsTrigger 
                  value="overview" 
                  className="relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-blue-600/10 text-blue-200 border border-transparent data-[state=active]:border-blue-400/30"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-emerald-600/10 text-blue-200 border border-transparent data-[state=active]:border-emerald-400/30"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger 
                  value="properties" 
                  className="relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-orange-700 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-orange-600/10 text-blue-200 border border-transparent data-[state=active]:border-orange-400/30"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Properties
                </TabsTrigger>
                <TabsTrigger 
                  value="vendors" 
                  className="relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-violet-700 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-violet-600/10 text-blue-200 border border-transparent data-[state=active]:border-violet-400/30"
                >
                  <Store className="h-4 w-4 mr-2" />
                  Vendors
                </TabsTrigger>
                <TabsTrigger 
                  value="content" 
                  className="relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-indigo-600/10 text-blue-200 border border-transparent data-[state=active]:border-indigo-400/30"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger 
                  value="social" 
                  className="relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-pink-700 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-pink-600/10 text-blue-200 border border-transparent data-[state=active]:border-pink-400/30"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Social
                </TabsTrigger>
                <TabsTrigger 
                  value="filters" 
                  className="relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-teal-700 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-teal-600/10 text-blue-200 border border-transparent data-[state=active]:border-teal-400/30"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Filters
                </TabsTrigger>
                <TabsTrigger 
                  value="roles" 
                  className="relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-cyan-700 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-cyan-600/10 text-blue-200 border border-transparent data-[state=active]:border-cyan-400/30"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Roles
                </TabsTrigger>
                <TabsTrigger 
                  value="feedback" 
                  className="relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-700 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-amber-600/10 text-blue-200 border border-transparent data-[state=active]:border-amber-400/30"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Feedback
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-red-600/10 text-blue-200 border border-transparent data-[state=active]:border-red-400/30"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card className="bg-slate-800/40 backdrop-blur-xl border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-blue-200">Total Users</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white mb-1">
                      {statsLoading ? '...' : (stats?.users || 0)}
                    </div>
                    <p className="text-xs text-blue-300">Registered users</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/40 backdrop-blur-xl border-orange-500/20 hover:border-orange-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-blue-200">Properties</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Building className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white mb-1">
                      {statsLoading ? '...' : (stats?.properties || 0)}
                    </div>
                    <p className="text-xs text-blue-300">Listed properties</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/40 backdrop-blur-xl border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-blue-200">Orders</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white mb-1">
                      {statsLoading ? '...' : (stats?.orders || 0)}
                    </div>
                    <p className="text-xs text-blue-300">Total orders</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/40 backdrop-blur-xl border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-blue-200">Vendor Requests</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Store className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white mb-1">
                      {statsLoading ? '...' : (stats?.vendorRequests || 0)}
                    </div>
                    <p className="text-xs text-blue-300">Pending approval</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/40 backdrop-blur-xl border-red-500/20 hover:border-red-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-blue-200">System Alerts</CardTitle>
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white mb-1">
                      {statsLoading ? '...' : (stats?.errorLogs || 0)}
                    </div>
                    <p className="text-xs text-blue-300">Unresolved errors</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <Card className="bg-slate-800/40 backdrop-blur-xl border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-3">
                      <Zap className="h-6 w-6 text-blue-400" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription className="text-blue-300">Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={() => handleQuickAction('users')} 
                      className="h-20 p-4 flex flex-col items-center space-y-2 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Users className="h-6 w-6" />
                      <span className="text-sm font-medium">Manage Users</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('content')} 
                      className="h-20 p-4 flex flex-col items-center space-y-2 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <FileText className="h-6 w-6" />
                      <span className="text-sm font-medium">Content & SEO</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('social')} 
                      className="h-20 p-4 flex flex-col items-center space-y-2 bg-gradient-to-br from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Share2 className="h-6 w-6" />
                      <span className="text-sm font-medium">Social Media</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('filters')} 
                      className="h-20 p-4 flex flex-col items-center space-y-2 bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Search className="h-6 w-6" />
                      <span className="text-sm font-medium">Search Filters</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('vendors')} 
                      className="h-20 p-4 flex flex-col items-center space-y-2 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Store className="h-6 w-6" />
                      <span className="text-sm font-medium">Vendors</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('settings')} 
                      className="h-20 p-4 flex flex-col items-center space-y-2 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Settings className="h-6 w-6" />
                      <span className="text-sm font-medium">Settings</span>
                    </Button>
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card className="bg-slate-800/40 backdrop-blur-xl border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-white flex items-center gap-3">
                      <Activity className="h-6 w-6 text-green-400" />
                      System Status
                    </CardTitle>
                    <CardDescription className="text-blue-300">Platform health and monitoring</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                      <span className="text-sm flex items-center gap-3 text-white font-medium">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <Activity className="h-4 w-4" />
                        System Status
                      </span>
                      <Badge className="bg-green-500 text-white border-0">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <span className="text-sm flex items-center gap-3 text-white font-medium">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <Database className="h-4 w-4" />
                        Database
                      </span>
                      <Badge className="bg-blue-500 text-white border-0">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                      <span className="text-sm flex items-center gap-3 text-white font-medium">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <Globe className="h-4 w-4" />
                        API Status
                      </span>
                      <Badge className="bg-green-500 text-white border-0">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <span className="text-sm flex items-center gap-3 text-white font-medium">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <Lock className="h-4 w-4" />
                        Security
                      </span>
                      <Badge className="bg-blue-500 text-white border-0">Protected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      <span className="text-sm flex items-center gap-3 text-white font-medium">
                        <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                        <Bell className="h-4 w-4" />
                        Alerts
                      </span>
                      <Badge className="bg-amber-500 text-white border-0">{stats?.errorLogs || 0} Pending</Badge>
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
