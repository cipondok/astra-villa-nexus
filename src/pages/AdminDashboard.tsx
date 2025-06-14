import { useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings, Users, Home, List, Plus, Gift, Calendar, Database, Shield, FileText, Store, MessageSquare, Activity, BarChart3, Loader2, Wifi } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";

// Lazy load heavy components
const SystemMonitor = lazy(() => import("@/components/admin/SystemMonitor"));
const SystemSettings = lazy(() => import("@/components/admin/SystemSettings"));
const WebTrafficAnalytics = lazy(() => import("@/components/admin/WebTrafficAnalytics"));
const SimpleUserManagement = lazy(() => import("@/components/admin/SimpleUserManagement"));
const PropertyManagement = lazy(() => import("@/components/admin/PropertyManagement"));
const ContentManagement = lazy(() => import("@/components/admin/ContentManagement"));
const VendorManagement = lazy(() => import("@/components/admin/VendorManagement"));
const AdminVendorServiceManagement = lazy(() => import("@/components/admin/AdminVendorServiceManagement"));
const VendorServiceCategoryManagement = lazy(() => import("@/components/admin/VendorServiceCategoryManagement"));
const FeedbackManagement = lazy(() => import("@/components/admin/FeedbackManagement"));
const AstraTokenSettings = lazy(() => import("@/components/admin/AstraTokenSettings"));
const LiveAgentStatusDashboard = lazy(() => import("@/components/admin/LiveAgentStatusDashboard"));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
    <span className="ml-2">Loading...</span>
  </div>
);

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("system");
  const [systemSettingsOpen, setSystemSettingsOpen] = useState(false);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin (simplified check for better performance)
  const isAdmin = user?.email === 'mycode103@gmail.com';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">You don't have permission to access the admin dashboard.</p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/')} className="w-full">Return to Home</Button>
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">System Administration Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Dialog open={systemSettingsOpen} onOpenChange={setSystemSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>System Settings</DialogTitle>
                  </DialogHeader>
                  <Suspense fallback={<LoadingSpinner />}>
                    <SystemSettings />
                  </Suspense>
                </DialogContent>
              </Dialog>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                      <AvatarFallback>
                        {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/')}>Back to Home</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 md:grid-cols-10">
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Properties</span>
            </TabsTrigger>
            <TabsTrigger value="vendors" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Vendors</span>
            </TabsTrigger>
            <TabsTrigger value="vendor-services" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="service-categories" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Feedback</span>
            </TabsTrigger>
            <TabsTrigger value="live-status" className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span className="hidden sm:inline">Live Status</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system">
            <div className="w-full">
              <Suspense fallback={<LoadingSpinner />}>
                <SystemMonitor />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Suspense fallback={<LoadingSpinner />}>
              <WebTrafficAnalytics />
            </Suspense>
          </TabsContent>

          <TabsContent value="users">
            <Suspense fallback={<LoadingSpinner />}>
              <SimpleUserManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="properties">
            <Suspense fallback={<LoadingSpinner />}>
              <PropertyManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="vendors">
            <Suspense fallback={<LoadingSpinner />}>
              <VendorManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="vendor-services">
            <Suspense fallback={<LoadingSpinner />}>
              <AdminVendorServiceManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="service-categories">
            <Suspense fallback={<LoadingSpinner />}>
              <VendorServiceCategoryManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="content">
            <Suspense fallback={<LoadingSpinner />}>
              <ContentManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="feedback">
            <Suspense fallback={<LoadingSpinner />}>
              <FeedbackManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="live-status">
            <Suspense fallback={<LoadingSpinner />}>
              <LiveAgentStatusDashboard />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
