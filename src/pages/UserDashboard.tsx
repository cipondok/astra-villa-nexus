
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import AgentOverview from "@/components/agent/AgentOverview";
import CustomerServiceDashboard from "@/components/dashboard/CustomerServiceDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Home, 
  Search, 
  Heart, 
  MessageSquare,
  User,
  Bell,
  Settings
} from "lucide-react";

const UserDashboard = () => {
  const { isAuthenticated, loading, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/?auth=true');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-foreground">Loading...</h2>
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
        <div className="pt-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-8">
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
        <div className="pt-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-8">
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
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          {/* Welcome Section */}
          <div className="samsung-gradient text-white p-6 rounded-lg mb-6 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Welcome, {profile?.full_name || 'User'}!</h1>
                <p className="text-white/80 mt-2">Manage your profile and properties</p>
              </div>
              <User className="h-8 w-8" />
            </div>
          </div>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/dijual')}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Browse Properties
                    </CardTitle>
                    <CardDescription>Find your perfect home</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Saved Properties
                    </CardTitle>
                    <CardDescription>View your favorites</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Messages
                    </CardTitle>
                    <CardDescription>Chat with agents</CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No recent activity</p>
                    <p className="text-sm">Start browsing properties to see your activity here</p>
                    <Button className="mt-4" onClick={() => navigate('/dijual')}>
                      Browse Properties
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Full Name</label>
                        <p className="text-sm text-muted-foreground">{profile?.full_name || 'Not set'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <p className="text-sm text-muted-foreground">{profile?.email || 'Not set'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Role</label>
                        <p className="text-sm text-muted-foreground capitalize">{profile?.role || 'Not set'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Verification Status</label>
                        <p className="text-sm text-muted-foreground capitalize">{profile?.verification_status || 'Not set'}</p>
                      </div>
                    </div>
                    <Button onClick={() => navigate('/profile')}>
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
