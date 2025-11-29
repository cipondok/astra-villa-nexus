import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerServiceDashboard from '@/components/dashboard/CustomerServiceDashboard';
import ProfileUpgradeCard from '@/components/ProfileUpgradeCard';
import ApplicationStatusBar from '@/components/dashboard/ApplicationStatusBar';
import { useUserDashboardData } from '@/hooks/useUserDashboardData';
import { useUserRoles } from '@/hooks/useUserRoles';
import { formatDistanceToNow } from 'date-fns';
import { 
  User, 
  Home, 
  Settings, 
  Bell, 
  Activity,
  Heart,
  Calendar,
  MessageSquare,
  Coins,
  Search,
  ChevronRight,
  UserPlus
} from 'lucide-react';

const UserDashboardPage = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { stats, savedProperties, recentActivity, isLoading } = useUserDashboardData();
  const { data: userRoles = [], isLoading: rolesLoading } = useUserRoles();

  // Get the primary display role from user_roles table
  const primaryRole = userRoles.find(role => role !== 'general_user') || userRoles[0] || 'general_user';
  const hasUpgradedRole = userRoles.some(role => 
    ['property_owner', 'agent', 'vendor'].includes(role)
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate('/?auth=true');
    }
  }, [user, loading, navigate]);

  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-sm sm:text-lg font-semibold text-foreground">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Render Customer Service Dashboard for CS users
  if (userRoles.includes('customer_service')) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pt-16 sm:pt-20">
        <CustomerServiceDashboard />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4 pt-2 sm:pt-4 space-y-3 sm:space-y-4">
      {/* Welcome Header - Slim Mobile Optimized */}
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-md">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-lg md:text-xl font-bold truncate">
                Welcome, {profile?.full_name || user.email?.split('@')[0] || 'User'}!
              </h1>
              <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1.5 py-0.5">
                {primaryRole?.replace('_', ' ') || 'User'}
              </Badge>
            </div>
            <p className="text-primary-foreground/80 text-[10px] sm:text-xs">
              Manage your profile and properties
            </p>
          </div>
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </div>

      {/* Stats Grid - Mobile 2x2 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
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
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
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
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
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
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
              <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold">0</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">ASTRA</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Application Status - Show for all users with pending applications */}
      <ApplicationStatusBar />

      {/* Upgrade Card for General Users Only */}
      {!hasUpgradedRole && (
        <ProfileUpgradeCard />
      )}

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
          <TabsTrigger value="overview" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1.5 sm:gap-2 active:scale-95" 
              onClick={() => navigate('/dijual')}
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="text-[10px] sm:text-xs">Browse</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1.5 sm:gap-2 active:scale-95"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              <span className="text-[10px] sm:text-xs">Saved ({stats.savedProperties})</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1.5 sm:gap-2 text-yellow-600 border-yellow-200 active:scale-95" 
              onClick={() => navigate('/astra-tokens')}
            >
              <Coins className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-[10px] sm:text-xs">ASTRA</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-3 sm:p-4 flex flex-col items-center gap-1.5 sm:gap-2 active:scale-95" 
              onClick={() => navigate('/contact')}
            >
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              <span className="text-[10px] sm:text-xs">Support</span>
            </Button>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                Recent Activity
              </CardTitle>
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
                    Start browsing to see activity here
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

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader className="p-3 sm:p-4 pb-2">
              <CardTitle className="text-sm sm:text-base">Account Settings</CardTitle>
              <CardDescription className="text-[10px] sm:text-xs">Manage your preferences</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-muted/50 rounded-lg">
                  <label className="text-[10px] sm:text-xs font-medium text-muted-foreground">Full Name</label>
                  <p className="text-xs sm:text-sm font-medium truncate">{profile?.full_name || 'Not set'}</p>
                </div>
                <div className="p-2 sm:p-3 bg-muted/50 rounded-lg">
                  <label className="text-[10px] sm:text-xs font-medium text-muted-foreground">Email</label>
                  <p className="text-xs sm:text-sm font-medium truncate">{user.email || 'Not set'}</p>
                </div>
                <div className="p-2 sm:p-3 bg-muted/50 rounded-lg">
                  <label className="text-[10px] sm:text-xs font-medium text-muted-foreground">Role</label>
                  <p className="text-xs sm:text-sm font-medium capitalize">{primaryRole?.replace('_', ' ') || 'User'}</p>
                </div>
                <div className="p-2 sm:p-3 bg-muted/50 rounded-lg">
                  <label className="text-[10px] sm:text-xs font-medium text-muted-foreground">Account Status</label>
                  <Badge 
                    variant={hasUpgradedRole ? 'default' : 'secondary'}
                    className={`text-[10px] sm:text-xs mt-0.5 ${hasUpgradedRole ? 'bg-green-600' : ''}`}
                  >
                    {hasUpgradedRole ? 'Active' : 'Basic'}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={() => navigate('/profile/edit')} 
                  className="h-8 sm:h-9 text-xs sm:text-sm flex-1"
                >
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  Edit Profile
                </Button>
                {hasUpgradedRole && (
                  <Button 
                    variant="default"
                    onClick={() => {
                      if (userRoles.includes('property_owner')) navigate('/dashboard/property-owner');
                      else if (userRoles.includes('agent')) navigate('/dashboard/agent');
                      else if (userRoles.includes('vendor')) navigate('/dashboard/vendor');
                    }} 
                    className="h-8 sm:h-9 text-xs sm:text-sm flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <ChevronRight className="h-3.5 w-3.5 mr-1.5" />
                    Go to {primaryRole?.replace('_', ' ')} Dashboard
                  </Button>
                )}
                {!hasUpgradedRole && (
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/dashboard/user')} 
                    className="h-8 sm:h-9 text-xs sm:text-sm flex-1"
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                    Upgrade Account
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboardPage;
