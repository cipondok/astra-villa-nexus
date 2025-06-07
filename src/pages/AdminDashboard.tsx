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
      <div className="min-h-screen bg-background/60 backdrop-blur-xl flex items-center justify-center">
        <div className="text-center card-ios p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-foreground">Loading Control Panel...</h2>
          <p className="text-muted-foreground mt-2">Initializing admin systems</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background/60 backdrop-blur-xl flex items-center justify-center">
        <div className="text-center card-ios p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/25">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You don't have admin privileges to access this control panel.</p>
          <Button onClick={() => navigate('/dashboard')} variant="ios" className="px-6 py-3">
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
    <div className="min-h-screen bg-background/60 backdrop-blur-xl">
      <AdminNavigation 
        user={user} 
        adminData={{ 
          is_super_admin: true, 
          role: { name: profile?.role === 'admin' ? 'Admin' : 'Demo Admin' } 
        }} 
      />
      
      <div className="pt-20 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto py-6">
          {/* Compact Header Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">
                  Welcome back, {user?.user_metadata?.full_name || user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {profile?.role === 'admin' ? 'System Admin' : 'Demo Admin'}
              </Badge>
              <Badge variant="secondary" className="bg-ios-green/10 text-ios-green border-ios-green/20 px-3 py-1 text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Compact Tab Navigation */}
            <div className="glass-ios p-1.5 border border-border/30 shadow-lg">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-1 bg-transparent h-auto p-1">
                <TabsTrigger 
                  value="overview" 
                  className="relative px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg hover:bg-accent text-foreground border border-transparent data-[state=active]:border-primary/30"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="relative px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 data-[state=active]:bg-ios-green data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-accent text-foreground border border-transparent data-[state=active]:border-ios-green/30"
                >
                  <Users className="h-3 w-3 mr-1" />
                  Users
                </TabsTrigger>
                <TabsTrigger 
                  value="properties" 
                  className="relative px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 data-[state=active]:bg-ios-orange data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-accent text-foreground border border-transparent data-[state=active]:border-ios-orange/30"
                >
                  <Building className="h-3 w-3 mr-1" />
                  Properties
                </TabsTrigger>
                <TabsTrigger 
                  value="vendors" 
                  className="relative px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 data-[state=active]:bg-ios-purple data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-accent text-foreground border border-transparent data-[state=active]:border-ios-purple/30"
                >
                  <Store className="h-3 w-3 mr-1" />
                  Vendors
                </TabsTrigger>
                <TabsTrigger 
                  value="content" 
                  className="relative px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg hover:bg-accent text-foreground border border-transparent data-[state=active]:border-primary/30"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Content
                </TabsTrigger>
                <TabsTrigger 
                  value="social" 
                  className="relative px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 data-[state=active]:bg-ios-pink data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-accent text-foreground border border-transparent data-[state=active]:border-ios-pink/30"
                >
                  <Share2 className="h-3 w-3 mr-1" />
                  Social
                </TabsTrigger>
                <TabsTrigger 
                  value="filters" 
                  className="relative px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg hover:bg-accent text-foreground border border-transparent data-[state=active]:border-primary/30"
                >
                  <Search className="h-3 w-3 mr-1" />
                  Filters
                </TabsTrigger>
                <TabsTrigger 
                  value="roles" 
                  className="relative px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg hover:bg-accent text-foreground border border-transparent data-[state=active]:border-primary/30"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Roles
                </TabsTrigger>
                <TabsTrigger 
                  value="feedback" 
                  className="relative px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 data-[state=active]:bg-ios-yellow data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-accent text-foreground border border-transparent data-[state=active]:border-ios-yellow/30"
                >
                  <Bell className="h-3 w-3 mr-1" />
                  Feedback
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="relative px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 data-[state=active]:bg-ios-red data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-accent text-foreground border border-transparent data-[state=active]:border-ios-red/30"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              {/* Compact Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <Card className="card-ios hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Users</CardTitle>
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg shadow-primary/25">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {statsLoading ? '...' : (stats?.users || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Registered</p>
                  </CardContent>
                </Card>

                <Card className="card-ios hover:shadow-xl hover:shadow-ios-orange/10 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Properties</CardTitle>
                    <div className="w-8 h-8 bg-gradient-to-br from-ios-orange to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-ios-orange/25">
                      <Building className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {statsLoading ? '...' : (stats?.properties || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Listed</p>
                  </CardContent>
                </Card>

                <Card className="card-ios hover:shadow-xl hover:shadow-ios-green/10 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Orders</CardTitle>
                    <div className="w-8 h-8 bg-gradient-to-br from-ios-green to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-ios-green/25">
                      <Package className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {statsLoading ? '...' : (stats?.orders || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </CardContent>
                </Card>

                <Card className="card-ios hover:shadow-xl hover:shadow-ios-purple/10 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Vendors</CardTitle>
                    <div className="w-8 h-8 bg-gradient-to-br from-ios-purple to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-ios-purple/25">
                      <Store className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {statsLoading ? '...' : (stats?.vendorRequests || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </CardContent>
                </Card>

                <Card className="card-ios hover:shadow-xl hover:shadow-ios-red/10 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Alerts</CardTitle>
                    <div className="w-8 h-8 bg-gradient-to-br from-ios-red to-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-ios-red/25">
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {statsLoading ? '...' : (stats?.errorLogs || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Unresolved</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <Card className="card-ios">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => handleQuickAction('users')} 
                      variant="ios-green"
                      className="h-16 p-3 flex flex-col items-center space-y-1"
                    >
                      <Users className="h-5 w-5" />
                      <span className="text-xs font-medium">Users</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('content')} 
                      variant="ios"
                      className="h-16 p-3 flex flex-col items-center space-y-1"
                    >
                      <FileText className="h-5 w-5" />
                      <span className="text-xs font-medium">Content</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('social')} 
                      className="h-16 p-3 flex flex-col items-center space-y-1 bg-gradient-to-r from-ios-pink to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg shadow-ios-pink/25"
                    >
                      <Share2 className="h-5 w-5" />
                      <span className="text-xs font-medium">Social</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('filters')} 
                      className="h-16 p-3 flex flex-col items-center space-y-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg"
                    >
                      <Search className="h-5 w-5" />
                      <span className="text-xs font-medium">Filters</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('vendors')} 
                      className="h-16 p-3 flex flex-col items-center space-y-1 bg-gradient-to-r from-ios-purple to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-ios-purple/25"
                    >
                      <Store className="h-5 w-5" />
                      <span className="text-xs font-medium">Vendors</span>
                    </Button>
                    <Button 
                      onClick={() => handleQuickAction('settings')} 
                      variant="ios-red"
                      className="h-16 p-3 flex flex-col items-center space-y-1"
                    >
                      <Settings className="h-5 w-5" />
                      <span className="text-xs font-medium">Settings</span>
                    </Button>
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card className="card-ios">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Activity className="h-5 w-5 text-ios-green" />
                      System Status
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">Platform health monitoring</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-ios-green/10 rounded-xl border border-ios-green/20">
                      <span className="text-sm flex items-center gap-2 text-foreground font-medium">
                        <div className="w-2 h-2 bg-ios-green rounded-full animate-pulse"></div>
                        <Activity className="h-3 w-3" />
                        System Status
                      </span>
                      <Badge className="bg-ios-green text-white border-0 text-xs">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20">
                      <span className="text-sm flex items-center gap-2 text-foreground font-medium">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <Database className="h-3 w-3" />
                        Database
                      </span>
                      <Badge className="bg-primary text-primary-foreground border-0 text-xs">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-ios-green/10 rounded-xl border border-ios-green/20">
                      <span className="text-sm flex items-center gap-2 text-foreground font-medium">
                        <div className="w-2 h-2 bg-ios-green rounded-full"></div>
                        <Globe className="h-3 w-3" />
                        API Status
                      </span>
                      <Badge className="bg-ios-green text-white border-0 text-xs">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20">
                      <span className="text-sm flex items-center gap-2 text-foreground font-medium">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <Lock className="h-3 w-3" />
                        Security
                      </span>
                      <Badge className="bg-primary text-primary-foreground border-0 text-xs">Protected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-ios-yellow/10 rounded-xl border border-ios-yellow/20">
                      <span className="text-sm flex items-center gap-2 text-foreground font-medium">
                        <div className="w-2 h-2 bg-ios-yellow rounded-full"></div>
                        <Bell className="h-3 w-3" />
                        Alerts
                      </span>
                      <Badge className="bg-ios-yellow text-white border-0 text-xs">{stats?.errorLogs || 0} Pending</Badge>
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
