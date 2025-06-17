
import { useState, Suspense, lazy, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings, Users, Home, Plus, Gift, Calendar, Database, Shield, FileText, Store, MessageSquare, Activity, BarChart3, Loader2, Wifi, Mail, Building2, LifeBuoy, ChevronDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import AdminDashboardStats from "@/components/admin/AdminDashboardStats";
import AdminQuickActions from "@/components/admin/AdminQuickActions";

// Lazy load heavy components
const SystemMonitor = lazy(() => import("@/components/admin/SystemMonitor"));
const SystemSettings = lazy(() => import("@/components/admin/SystemSettings"));
const WebTrafficAnalytics = lazy(() => import("@/components/admin/WebTrafficAnalytics"));
const SimpleUserManagement = lazy(() => import("@/components/admin/SimpleUserManagement"));
const PropertyManagement = lazy(() => import("@/components/admin/PropertyManagement"));
const ContentManagement = lazy(() => import("@/components/admin/ContentManagement"));
const FeedbackManagement = lazy(() => import("@/components/admin/FeedbackManagement"));
const ContactManagement = lazy(() => import("@/components/admin/ContactManagement"));
const AstraTokenSettings = lazy(() => import("@/components/admin/AstraTokenSettings"));
const LiveAgentStatusDashboard = lazy(() => import("@/components/admin/LiveAgentStatusDashboard"));
const OfficeManagement = lazy(() => import("@/components/admin/OfficeManagement"));
const CustomerServiceTicketManagement = lazy(() => import("@/components/admin/CustomerServiceTicketManagement"));
const VendorManagementHub = lazy(() => import("@/components/admin/VendorManagementHub"));
const CommunicationHub = lazy(() => import("@/components/admin/CommunicationHub"));
const EnhancedVendorDirectory = lazy(() => import("@/components/admin/EnhancedVendorDirectory"));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
    <span className="ml-2">Loading...</span>
  </div>
);

const AdminDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.defaultTab || "overview");
  const [systemSettingsOpen, setSystemSettingsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';
  const isSupportStaff = profile?.role === 'agent' || profile?.role === 'customer_service';
  const canAccess = isAdmin || isSupportStaff;

  useEffect(() => {
    if (isSupportStaff && !isAdmin) {
      if (activeTab === 'system' || activeTab === 'overview') {
        setActiveTab("support");
      }
    }
  }, [profile, isSupportStaff, isAdmin, activeTab]);

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

  const tabCategories = {
    core: {
      label: "Core",
      items: [
        { value: "overview", icon: Activity, label: "Overview", component: null, adminOnly: true },
        { value: "analytics", icon: BarChart3, label: "Analytics", component: WebTrafficAnalytics, adminOnly: true },
        { value: "system", icon: Database, label: "System", component: SystemMonitor, adminOnly: true },
      ]
    },
    management: {
      label: "Management",
      items: [
        { value: "users", icon: Users, label: "Users", component: SimpleUserManagement, adminOnly: true },
        { value: "properties", icon: Home, label: "Properties", component: PropertyManagement, adminOnly: true },
        { value: "offices", icon: Building2, label: "Offices", component: OfficeManagement, adminOnly: true },
        { value: "content", icon: FileText, label: "Content", component: ContentManagement, adminOnly: true },
      ]
    },
    communication: {
      label: "Communication",
      items: [
        { value: "communication", icon: MessageSquare, label: "Communication", component: CommunicationHub, adminOnly: false },
        { value: "vendor-directory", icon: Store, label: "Vendor Directory", component: EnhancedVendorDirectory, adminOnly: false },
        { value: "contact", icon: Mail, label: "Contacts", component: ContactManagement, adminOnly: false },
        { value: "live-status", icon: Wifi, label: "Live Status", component: LiveAgentStatusDashboard, adminOnly: false },
      ]
    },
    support: {
      label: "Support",
      items: [
        { value: "support", icon: LifeBuoy, label: "Support", component: CustomerServiceTicketManagement, adminOnly: false },
        { value: "feedback", icon: MessageSquare, label: "Feedback", component: FeedbackManagement, adminOnly: false },
        { value: "vendors", icon: Store, label: "Vendors", component: VendorManagementHub, adminOnly: true },
      ]
    }
  };

  const getVisibleTabs = () => {
    const allTabs = Object.values(tabCategories).flatMap(category => category.items);
    return isAdmin ? allTabs : allTabs.filter(tab => !tab.adminOnly);
  };

  const visibleTabs = getVisibleTabs();

  const DashboardOverview = () => (
    <div className="space-y-6">
      <AdminDashboardStats />
      <AdminQuickActions onTabChange={setActiveTab} />
    </div>
  );

  const handleDropdownToggle = (categoryKey: string) => {
    setOpenDropdown(openDropdown === categoryKey ? null : categoryKey);
  };

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
          {/* Enhanced Navigation Menu */}
          <div className="bg-card border rounded-xl shadow-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Admin Dashboard</h3>
              <div className="text-sm text-muted-foreground">
                {Object.values(tabCategories).flatMap(cat => cat.items).find(tab => tab.value === activeTab)?.label}
              </div>
            </div>
            
            <div className="p-2">
              <nav className="flex flex-wrap items-center gap-1">
                {Object.entries(tabCategories).map(([categoryKey, category]) => {
                  const categoryTabs = category.items.filter(tab => !tab.adminOnly || isAdmin);
                  if (categoryTabs.length === 0) return null;
                  
                  // Check if any tab in this category is active
                  const hasActiveTab = categoryTabs.some(tab => tab.value === activeTab);
                  
                  return (
                    <div key={categoryKey} className="relative">
                      {categoryTabs.length === 1 ? (
                        // Single item - direct tab
                        <TooltipProvider key={categoryTabs[0].value}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <TabsTrigger 
                                value={categoryTabs[0].value}
                                className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground ${
                                  activeTab === categoryTabs[0].value 
                                    ? 'bg-primary text-primary-foreground shadow-sm' 
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                                onClick={() => setActiveTab(categoryTabs[0].value)}
                              >
                                <categoryTabs[0].icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                <span className="hidden sm:block">{categoryTabs[0].label}</span>
                              </TabsTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p className="text-sm">{categoryTabs[0].label}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        // Multiple items - dropdown
                        <DropdownMenu 
                          open={openDropdown === categoryKey} 
                          onOpenChange={(open) => setOpenDropdown(open ? categoryKey : null)}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className={`group flex items-center gap-2 px-4 py-2 h-auto rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground ${
                                hasActiveTab 
                                  ? 'bg-primary text-primary-foreground shadow-sm' 
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <span className="hidden sm:block">{category.label}</span>
                              <span className="sm:hidden">{category.label.slice(0, 1)}</span>
                              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${
                                openDropdown === categoryKey ? 'rotate-180' : ''
                              }`} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="start" 
                            className="w-56 bg-popover/95 backdrop-blur-sm border shadow-lg"
                          >
                            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              {category.label}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {categoryTabs.map(tab => (
                              <DropdownMenuItem 
                                key={tab.value}
                                className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                                  activeTab === tab.value ? 'bg-accent text-accent-foreground' : ''
                                }`}
                                onClick={() => {
                                  setActiveTab(tab.value);
                                  setOpenDropdown(null);
                                }}
                              >
                                <tab.icon className="h-4 w-4" />
                                <span className="font-medium">{tab.label}</span>
                                {activeTab === tab.value && (
                                  <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                                )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <TabsContent value="overview" className="space-y-0">
            <DashboardOverview />
          </TabsContent>

          {visibleTabs.filter(tab => tab.component).map(tab => (
             <TabsContent key={tab.value} value={tab.value} className="space-y-0">
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
