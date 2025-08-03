import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import ASTRATokenDisplay from "@/components/ASTRATokenDisplay";
import ProfileUpgradeCard from "@/components/ProfileUpgradeCard";
import { 
  Home, 
  Building, 
  Users, 
  Settings, 
  PlusCircle, 
  BarChart3, 
  FileText, 
  Wrench,
  UserCheck,
  Crown,
  RefreshCw,
  LifeBuoy,
  MessageSquare,
  AlertTriangle,
  User,
  Coins,
  Clock
} from "lucide-react";

const UserDashboard = () => {
  const { profile, user, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log('UserDashboard - User:', user);
  console.log('UserDashboard - Profile:', profile);
  console.log('UserDashboard - Loading:', loading);

  const handleRefreshProfile = async () => {
    setIsRefreshing(true);
    console.log('Manual profile refresh requested');
    await refreshProfile();
    setIsRefreshing(false);
  };

  // Show loading skeleton while data is being fetched
  if (loading || (!user && !profile)) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no user data
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load user data. Please try refreshing the page or logging in again.
          </AlertDescription>
        </Alert>
        <div className="mt-4 space-x-2">
          <Button onClick={handleRefreshProfile} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Profile
          </Button>
          <Button 
            onClick={() => navigate('/?auth=true', { replace: true })}
            variant="outline"
          >
            Re-login
          </Button>
        </div>
      </div>
    );
  }

  const userRole = profile?.role || 'general_user';
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User';
  const displayEmail = profile?.email || user?.email || '';

  const getRoleConfig = () => {
    switch (userRole) {
      case 'property_owner':
        return {
          title: "Property Owner Dashboard",
          description: "Manage your properties and listings",
          actions: [
            { label: "Add New Property", icon: PlusCircle, path: "/properties/new" },
            { label: "My Properties", icon: Building, path: "/dijual" },
            { label: "View Analytics", icon: BarChart3, path: "/analytics" },
            { label: "Manage Listings", icon: FileText, path: "/listings" }
          ]
        };
      case 'agent':
        return {
          title: "Agent Dashboard", 
          description: "Manage clients and property listings",
          actions: [
            { label: "Create Listing", icon: PlusCircle, path: "/listings/new" },
            { label: "My Listings", icon: Building, path: "/listings" },
            { label: "Client Management", icon: Users, path: "/clients" },
            { label: "Sales Report", icon: BarChart3, path: "/reports" }
          ]
        };
      case 'vendor':
        return {
          title: "Vendor Dashboard",
          description: "Manage your services and bookings", 
          actions: [
            { label: "Add Service", icon: PlusCircle, path: "/services/new" },
            { label: "My Services", icon: Wrench, path: "/services" },
            { label: "Bookings", icon: FileText, path: "/bookings" },
            { label: "Service Analytics", icon: BarChart3, path: "/analytics" }
          ]
        };
      case 'admin':
        return {
          title: "Admin Dashboard",
          description: "Full system administration",
          actions: [
            { label: "User Management", icon: Users, path: "/admin", tab: "users" },
            { label: "System Analytics", icon: BarChart3, path: "/admin", tab: "analytics" },
            { label: "Verification Requests", icon: UserCheck, path: "/admin" },
            { label: "Admin Panel", icon: Crown, path: "/admin" }
          ]
        };
      case 'customer_service':
        return {
          title: "Customer Service Dashboard",
          description: "Manage support tickets and customer inquiries",
          actions: [
            { label: "Dashboard", icon: BarChart3, path: "/dashboard" },
            { label: "My Tickets", icon: LifeBuoy, path: "/dashboard" },
            { label: "Customer Inquiries", icon: MessageSquare, path: "/dashboard" },
            { label: "Available Tickets", icon: Clock, path: "/dashboard" }
          ]
        };
      case 'general_user':
      default:
        return {
          title: "User Dashboard",
          description: "Browse and search properties",
          actions: [
            { label: "Search Properties", icon: Home, path: "/properties" },
            { label: "Saved Properties", icon: Building, path: "/saved" },
            { label: "Account Settings", icon: Settings, path: "/settings" }
          ]
        };
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'property_owner': return Building;
      case 'agent': return Users;
      case 'vendor': return Wrench;
      case 'admin': return Crown;
      case 'customer_service': return LifeBuoy;
      case 'general_user':
      default: return User;
    }
  };

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case 'customer_service': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100';
      case 'agent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'property_owner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'vendor': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
      case 'general_user':
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const roleConfig = getRoleConfig();
  const RoleIcon = getRoleIcon();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Debug Info for Super Admin */}
      {user?.email === 'mycode103@gmail.com' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1 text-sm">
              <div><strong>Debug Info:</strong></div>
              <div>User ID: {user?.id}</div>
              <div>Email: {user?.email}</div>
              <div>Profile Role: {profile?.role || 'Not loaded'}</div>
              <div>Verification Status: {profile?.verification_status || 'Not loaded'}</div>
              <div>Profile Updated: {profile?.updated_at || 'Not loaded'}</div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {displayName}!
            </h1>
            <p className="text-blue-100 text-lg">{roleConfig.description}</p>
            <div className="mt-2 text-sm text-blue-200">
              User ID: {user.id}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <RoleIcon className="h-12 w-12" />
            <Badge className={`${getRoleBadgeColor()} border-0 text-sm px-3 py-1`}>
              {userRole.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="astra-token">
            <Coins className="h-4 w-4 mr-2" />
            ASTRA Token
          </TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Profile Upgrade Card for General Users */}
          {userRole === 'general_user' && (
            <ProfileUpgradeCard />
          )}
          
          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PlusCircle className="h-5 w-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                  <CardDescription>
                    Access your most important features quickly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {roleConfig.actions.map((action, index) => {
                      const IconComponent = action.icon;
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 dark:hover:bg-blue-950"
                          onClick={() => {
                            if ('path' in action && action.path) {
                              const navState = ('tab' in action && action.tab) 
                                ? { state: { defaultTab: action.tab } } 
                                : {};
                              navigate(action.path, navState);
                            } else {
                              console.log(`Navigate to ${action.label}`);
                            }
                          }}
                        >
                          <IconComponent className="h-8 w-8 text-blue-600" />
                          <span className="text-sm font-medium text-center">{action.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Profile</CardTitle>
                    <Button 
                      onClick={handleRefreshProfile}
                      disabled={isRefreshing}
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <RoleIcon className="h-10 w-10 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-lg">{displayName}</h3>
                      <p className="text-sm text-muted-foreground">{roleConfig.title}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{displayEmail}</span>
                    </div>
                    {profile?.phone && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{profile.phone}</span>
                      </div>
                    )}
                    {profile?.company_name && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Company:</span>
                        <span className="font-medium">{profile.company_name}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={profile?.verification_status === 'approved' ? 'default' : 'secondary'}>
                        {profile?.verification_status || 'pending'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Role:</span>
                      <Badge className={getRoleBadgeColor()}>
                        {userRole.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Account Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User ID:</span>
                      <span className="font-mono text-xs">{user.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Login:</span>
                      <span>{new Date(user.last_sign_in_at || user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="astra-token" className="space-y-6">
          <ASTRATokenDisplay />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your account information and preferences</CardDescription>
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
                <div className="pt-4">
                  <Button variant="outline">
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
