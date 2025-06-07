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
import ContentManagement from "@/components/admin/ContentManagement";
import SystemSettings from "@/components/admin/SystemSettings";
import VendorManagement from "@/components/admin/VendorManagement";
import BillingManagement from "@/components/admin/BillingManagement";
import OrderTracking from "@/components/admin/OrderTracking";
import SecurityMonitoring from "@/components/admin/SecurityMonitoring";
import AIBotManagement from "@/components/admin/AIBotManagement";
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
  TrendingUp
} from "lucide-react";

type AdminPermission = "user_management" | "property_management" | "content_management" | "system_settings" | "billing_management" | "vendor_authorization" | "security_monitoring" | "order_tracking" | "ai_bot_management";

const AdminDashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();
  const [activeTab, setActiveTab] = useState("overview");

  // Check if user is admin with better error handling
  const { data: adminData, isLoading: adminLoading, error: adminError } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID found');
        return null;
      }
      
      console.log('Checking admin status for user:', user.id);
      
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select(`
            *,
            role:admin_roles(name, permissions)
          `)
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.log('Admin check error:', error);
          if (error.code === 'PGRST116') {
            // No admin record found
            return null;
          }
          throw error;
        }
        
        console.log('Admin data found:', data);
        return data;
      } catch (err) {
        console.error('Error checking admin status:', err);
        throw err;
      }
    },
    enabled: !!user?.id && isAuthenticated,
    retry: 2,
    refetchOnWindowFocus: false
  });

  // Dashboard statistics with error handling
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        const [usersCount, propertiesCount, ordersCount, vendorRequestsCount] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('properties').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('vendor_requests').select('*', { count: 'exact', head: true })
        ]);

        return {
          users: usersCount.count || 0,
          properties: propertiesCount.count || 0,
          orders: ordersCount.count || 0,
          vendorRequests: vendorRequestsCount.count || 0
        };
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        return {
          users: 0,
          properties: 0,
          orders: 0,
          vendorRequests: 0
        };
      }
    },
    enabled: !!adminData
  });

  useEffect(() => {
    console.log('AdminDashboard useEffect - auth state:', { loading, isAuthenticated, user: !!user });
    
    if (!loading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/?auth=true');
      return;
    }

    if (!adminLoading && !loading && isAuthenticated && adminData === null && !adminError) {
      console.log('User authenticated but no admin privileges found');
      showError("Access Denied", "You don't have admin privileges to access this panel.");
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, adminData, adminLoading, adminError, navigate, showError]);

  // Show loading state
  if (loading || adminLoading) {
    console.log('Showing loading state - loading:', loading, 'adminLoading:', adminLoading);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Loading Admin Panel...</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Please wait while we verify your permissions</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (adminError) {
    console.log('Admin error occurred:', adminError);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Error Loading Admin Panel</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Please try refreshing the page</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Show access denied if no admin data
  if (!adminData) {
    console.log('No admin data, showing access denied');
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

  const hasPermission = (permission: AdminPermission): boolean => {
    return adminData?.is_super_admin || adminData?.role?.permissions?.includes(permission);
  };

  console.log('Rendering admin dashboard for user:', user?.email);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNavigation user={user} adminData={adminData} />
      
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Control Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Welcome back, {user?.user_metadata?.full_name || user?.email}
            </p>
            <Badge variant="secondary" className="mt-2">
              {adminData.is_super_admin ? 'Super Admin' : adminData.role?.name || 'Admin'}
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {hasPermission('user_management') && (
                <TabsTrigger value="users">Users</TabsTrigger>
              )}
              {hasPermission('property_management') && (
                <TabsTrigger value="properties">Properties</TabsTrigger>
              )}
              {hasPermission('content_management') && (
                <TabsTrigger value="content">Content</TabsTrigger>
              )}
              {hasPermission('system_settings') && (
                <TabsTrigger value="settings">Settings</TabsTrigger>
              )}
              {hasPermission('vendor_authorization') && (
                <TabsTrigger value="vendors">Vendors</TabsTrigger>
              )}
              {hasPermission('billing_management') && (
                <TabsTrigger value="billing">Billing</TabsTrigger>
              )}
              {hasPermission('order_tracking') && (
                <TabsTrigger value="orders">Orders</TabsTrigger>
              )}
              {hasPermission('security_monitoring') && (
                <TabsTrigger value="security">Security</TabsTrigger>
              )}
              {hasPermission('ai_bot_management') && (
                <TabsTrigger value="ai">AI Bots</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsLoading ? '...' : (stats?.users || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Registered users</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Properties</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsLoading ? '...' : (stats?.properties || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Listed properties</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Orders</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsLoading ? '...' : (stats?.orders || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Total orders</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vendor Requests</CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsLoading ? '...' : (stats?.vendorRequests || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Pending approval</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={() => setActiveTab('users')} 
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Manage Users
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('vendors')} 
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Store className="mr-2 h-4 w-4" />
                      Review Vendor Requests
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('security')} 
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Security Monitoring
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>Platform health and alerts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">System Status</span>
                      <Badge variant="default" className="bg-green-500">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database</span>
                      <Badge variant="default" className="bg-green-500">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Status</span>
                      <Badge variant="default" className="bg-green-500">Operational</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {hasPermission('user_management') && (
              <TabsContent value="users">
                <UserManagement />
              </TabsContent>
            )}

            {hasPermission('property_management') && (
              <TabsContent value="properties">
                <PropertyManagement />
              </TabsContent>
            )}

            {hasPermission('content_management') && (
              <TabsContent value="content">
                <ContentManagement />
              </TabsContent>
            )}

            {hasPermission('system_settings') && (
              <TabsContent value="settings">
                <SystemSettings />
              </TabsContent>
            )}

            {hasPermission('vendor_authorization') && (
              <TabsContent value="vendors">
                <VendorManagement />
              </TabsContent>
            )}

            {hasPermission('billing_management') && (
              <TabsContent value="billing">
                <BillingManagement />
              </TabsContent>
            )}

            {hasPermission('order_tracking') && (
              <TabsContent value="orders">
                <OrderTracking />
              </TabsContent>
            )}

            {hasPermission('security_monitoring') && (
              <TabsContent value="security">
                <SecurityMonitoring />
              </TabsContent>
            )}

            {hasPermission('ai_bot_management') && (
              <TabsContent value="ai">
                <AIBotManagement />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
