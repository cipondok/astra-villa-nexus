import { useState, Suspense, lazy, useEffect } from "react";
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
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("system");
  const [systemSettingsOpen, setSystemSettingsOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';
  const isSupportStaff = profile?.role === 'agent' || profile?.role === 'customer_service';
  const canAccess = isAdmin || isSupportStaff;

  useEffect(() => {
    if (isSupportStaff && !isAdmin) {
      setActiveTab("live-status");
    }
  }, [profile]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin (simplified check for better performance)
  if (!canAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">You don't have permission to access this dashboard.</p>
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

  const allTabs = [
    { value: "system", icon: Activity, label: "System", component: SystemMonitor, adminOnly: true },
    { value: "analytics", icon: BarChart3, label: "Analytics", component: WebTrafficAnalytics, adminOnly: true },
    { value: "users", icon: Users, label: "Users", component: SimpleUserManagement, adminOnly: true },
    { value: "properties", icon: Home, label: "Properties", component: PropertyManagement, adminOnly: true },
    { value: "vendors", icon: Store, label: "Vendors", component: VendorManagement, adminOnly: true },
    { value: "vendor-services", icon: Settings, label: "Services", component: AdminVendorServiceManagement, adminOnly: true },
    { value: "service-categories", icon: List, label: "Categories", component: VendorServiceCategoryManagement, adminOnly: true },
    { value: "content", icon: FileText, label: "Content", component: ContentManagement, adminOnly: true },
    { value: "feedback", icon: MessageSquare, label: "Feedback", component: FeedbackManagement, adminOnly: true },
    { value: "live-status", icon: Wifi, label: "Live Status", component: LiveAgentStatusDashboard, adminOnly: false },
  ];

  const visibleTabs = isAdmin ? allTabs : allTabs.filter(tab => !tab.adminOnly);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">{isAdmin ? 'Admin Dashboard' : 'Agent Dashboard'}</h1>
                <p className="text-sm text-muted-foreground">{isAdmin ? 'System Administration Panel' : 'Agent & Support Panel'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isAdmin && (
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
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} alt={profile?.full_name || user?.user_metadata?.full_name} />
                      <AvatarFallback>
                        {profile?.full_name?.charAt(0) || user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
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
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5 md:grid-cols-10' : 'grid-cols-1'}`}>
            {visibleTabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {visibleTabs.map(tab => (
             <TabsContent key={tab.value} value={tab.value}>
                <Suspense fallback={<LoadingSpinner />}>
                  <tab.component />
                </Suspense>
             </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
