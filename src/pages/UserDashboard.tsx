import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import AgentOverview from "@/components/agent/AgentOverview";
import CustomerServiceDashboard from "@/components/dashboard/CustomerServiceDashboard";
import ProfileUpgradeCard from "@/components/ProfileUpgradeCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useUserDashboardData } from "@/hooks/useUserDashboardData";
import { formatDistanceToNow } from "date-fns";
import { OrdersList } from "@/components/orders/OrdersList";
import { TicketsList } from "@/components/support/TicketsList";
import { AffiliatePanel } from "@/components/affiliate/AffiliatePanel";
import { 
  Home, 
  Search, 
  Heart, 
  MessageSquare,
  User,
  Bell,
  Settings,
  Calendar,
  Activity,
  ChevronRight,
  Package,
  HelpCircle,
  Share2
} from "lucide-react";

const UserDashboard = () => {
  const { isAuthenticated, loading, profile } = useAuth();
  const navigate = useNavigate();
  const { stats, savedProperties, recentActivity, isLoading } = useUserDashboardData();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/?auth=true');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-sm sm:text-lg font-semibold text-foreground">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Render Agent Dashboard for agent users
  if (profile?.role === 'agent') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-14 sm:pt-16 px-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-4 sm:py-8">
            <AgentOverview />
          </div>
        </div>
      </div>
    );
  }

  // Render Customer Service Dashboard for CS users
  if (profile?.role === 'customer_service') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-14 sm:pt-16 px-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-4 sm:py-8">
            <CustomerServiceDashboard />
          </div>
        </div>
      </div>
    );
  }

  // Default user dashboard
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-14 sm:pt-16 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-4 sm:py-8 space-y-4 sm:space-y-6">
          {/* Welcome Section - Mobile Optimized */}
          <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-4 sm:p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold truncate">
                  Welcome, {profile?.full_name || 'User'}!
                </h1>
                <p className="text-primary-foreground/80 text-xs sm:text-sm mt-1">
                  Manage your profile and properties
                </p>
                <Badge variant="secondary" className="mt-2 text-[10px] sm:text-xs">
                  {profile?.role?.replace('_', ' ')}
                </Badge>
              </div>
              <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 ml-3">
                <User className="h-5 w-5 sm:h-7 sm:w-7" />
              </div>
            </div>
          </div>

          {/* Stats Cards - Mobile Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">{stats.savedProperties}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Saved</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">{stats.messages}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Bookings</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">{recentActivity.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Activities</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold">{stats.notifications}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Alerts</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Upgrade Card for General Users */}
          {profile?.role === 'general_user' && (
            <ProfileUpgradeCard />
          )}

          {/* Dashboard Tabs - Mobile Optimized */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 h-9 sm:h-10">
              <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3">
                <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3">
                <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3">
                <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Support</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-1 sm:px-3">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Quick Actions - Mobile Optimized */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                <Card 
                  className="cursor-pointer hover:shadow-md active:scale-[0.98] transition-all" 
                  onClick={() => navigate('/dijual')}
                >
                  <CardHeader className="p-3 sm:p-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Search className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm sm:text-base">Browse Properties</CardTitle>
                        <CardDescription className="text-[10px] sm:text-xs">Find your dream home</CardDescription>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-md active:scale-[0.98] transition-all">
                  <CardHeader className="p-3 sm:p-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                      </div>
                      <div>
                        <CardTitle className="text-sm sm:text-base">Saved ({stats.savedProperties})</CardTitle>
                        <CardDescription className="text-[10px] sm:text-xs">View favorites</CardDescription>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-md active:scale-[0.98] transition-all">
                  <CardHeader className="p-3 sm:p-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-sm sm:text-base">Messages</CardTitle>
                        <CardDescription className="text-[10px] sm:text-xs">Chat with agents</CardDescription>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                </Card>
              </div>

              {/* Recent Activity - Mobile Optimized */}
              <Card>
                <CardHeader className="p-3 sm:p-4 pb-2">
                  <CardTitle className="text-sm sm:text-base">Recent Activity</CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">Your latest interactions</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  {isLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : recentActivity.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {recentActivity.slice(0, 5).map((activity) => (
                        <div 
                          key={activity.id} 
                          className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Activity className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium truncate">
                              {activity.activity_type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                              {activity.activity_description}
                            </p>
                          </div>
                          <span className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <Bell className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground/50" />
                      <p className="text-xs sm:text-sm text-muted-foreground">No recent activity</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        Start browsing properties to see activity here
                      </p>
                      <Button 
                        size="sm" 
                        className="mt-3 sm:mt-4 h-8 sm:h-9 text-xs sm:text-sm" 
                        onClick={() => navigate('/dijual')}
                      >
                        Browse Properties
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <OrdersList maxHeight="500px" />
            </TabsContent>

            {/* Support Tab */}
            <TabsContent value="support" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <TicketsList maxHeight="400px" />
                </div>
                <div>
                  <AffiliatePanel />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader className="p-3 sm:p-4 pb-2">
                  <CardTitle className="text-sm sm:text-base">Account Settings</CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-muted/50 rounded-lg">
                        <label className="text-[10px] sm:text-xs font-medium text-muted-foreground">Full Name</label>
                        <p className="text-xs sm:text-sm font-medium truncate">{profile?.full_name || 'Not set'}</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-muted/50 rounded-lg">
                        <label className="text-[10px] sm:text-xs font-medium text-muted-foreground">Email</label>
                        <p className="text-xs sm:text-sm font-medium truncate">{profile?.email || 'Not set'}</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-muted/50 rounded-lg">
                        <label className="text-[10px] sm:text-xs font-medium text-muted-foreground">Role</label>
                        <p className="text-xs sm:text-sm font-medium capitalize">{profile?.role?.replace('_', ' ') || 'Not set'}</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-muted/50 rounded-lg">
                        <label className="text-[10px] sm:text-xs font-medium text-muted-foreground">Verification</label>
                        <Badge 
                          variant={profile?.verification_status === 'verified' ? 'default' : 'secondary'}
                          className="text-[10px] sm:text-xs mt-0.5"
                        >
                          {profile?.verification_status || 'pending'}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate('/profile')} 
                      className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm"
                    >
                      Edit Profile
                    </Button>
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

export default UserDashboard;
