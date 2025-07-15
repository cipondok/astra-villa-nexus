
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { formatIDR } from '@/utils/currency';
import { 
  Store, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Bell,
  Calendar,
  BarChart3,
  MessageSquare,
  FileText,
  AlertTriangle,
  Home,
  ArrowLeft,
  Sun,
  Moon,
  Plus,
  Building,
  Building2,
  LogOut
} from 'lucide-react';

// Import vendor components
import VendorServicesOnlyDashboard from '@/components/vendor/VendorServicesOnlyDashboard';
import VendorBusinessProfile from '@/components/vendor/VendorBusinessProfile';
import VendorServices from '@/components/vendor/VendorServices';
import VendorServiceManagement from '@/components/vendor/VendorServiceManagement';
import VendorBookings from '@/components/vendor/VendorBookings';
import VendorAnalytics from '@/components/vendor/VendorAnalytics';
import VendorSettings from '@/components/vendor/VendorSettings';
import VendorSupport from '@/components/vendor/VendorSupport';
import VendorReviews from '@/components/vendor/VendorReviews';
import VendorProfileProgress from '@/components/vendor/VendorProfileProgress';
import VendorDashboardNavigation from '@/components/vendor/VendorDashboardNavigation';
import CategoryDiscountSettings from '@/components/vendor/CategoryDiscountSettings';
import ThemeSwitcher from '@/components/ui/theme-switcher';

const VendorDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // Check if user is a vendor only (not admin)
  const isVendor = profile?.role === 'vendor';

  const handleHomeClick = () => {
    navigate('/', { replace: true });
  };

  const handleBackClick = () => {
    window.history.back();
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access the vendor dashboard
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isVendor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Vendor access required. Please apply for vendor status in your profile settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-foreground shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Vendor Dashboard</h1>
              <p className="text-white/80 mt-1">
                Manage your business, services, and customer relationships
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <Button
                variant="outline"
                onClick={handleBackClick}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                variant="outline"
                onClick={handleHomeClick}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 gap-1 bg-white/80 backdrop-blur-sm border shadow-sm rounded-lg p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 ease-in-out transform data-[state=active]:scale-105">Overview</TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 ease-in-out transform data-[state=active]:scale-105">Services</TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 ease-in-out transform data-[state=active]:scale-105">Profile</TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 ease-in-out transform data-[state=active]:scale-105">Bookings</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 ease-in-out transform data-[state=active]:scale-105">Analytics</TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 ease-in-out transform data-[state=active]:scale-105">Categories</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300 ease-in-out transform data-[state=active]:scale-105">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Enhanced Overview with Samsung Gradient */}
            <Card className="samsung-gradient border-0 shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Welcome Back!</h3>
                    <p className="text-white/80">Manage your services and grow your business</p>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                      onClick={() => navigate('/vendor-registration')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Services offered</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Pending confirmations</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Served customers</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatIDR(0)}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity to display
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Profile Completion</span>
                      <Badge variant="outline">0%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Service Approval</span>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Customer Rating</span>
                      <Badge variant="outline">N/A</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services">
            <VendorServiceManagement />
          </TabsContent>


          <TabsContent value="profile">
            <VendorBusinessProfile />
          </TabsContent>

          <TabsContent value="bookings">
            <VendorBookings />
          </TabsContent>

          <TabsContent value="analytics">
            <VendorAnalytics />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryDiscountSettings />
          </TabsContent>

          <TabsContent value="settings">
            <VendorSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorDashboard;
