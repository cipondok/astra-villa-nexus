
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
import PropertyServiceManagement from '@/components/vendor/PropertyServiceManagement';
import CategoryRequiredMessage from '@/components/vendor/CategoryRequiredMessage';
import ThemeSwitcher from '@/components/ui/theme-switcher';
import { useVendorCategoryStatus } from '@/hooks/useVendorCategoryStatus';

const VendorDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { hasMainCategory, isLoading: categoryLoading } = useVendorCategoryStatus();
  const [activeTab, setActiveTab] = useState('overview');

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

  const handleNavigateToProfile = () => {
    setActiveTab('profile');
  };

  const renderTabContent = (tabValue: string, content: React.ReactNode, requireCategory = true) => {
    if (requireCategory && !hasMainCategory && !categoryLoading) {
      return (
        <CategoryRequiredMessage
          title="Kategori Bisnis Diperlukan"
          description={`Untuk mengakses ${tabValue}, Anda harus memilih kategori bisnis utama terlebih dahulu.`}
          onNavigateToProfile={handleNavigateToProfile}
        />
      );
    }
    return content;
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
      {/* iPhone-Style Header */}
      <div className="header-ios">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="animate-in fade-in slide-in-from-left duration-500">
              <h1 className="text-3xl font-bold text-white tracking-tight">Vendor Dashboard</h1>
              <p className="text-white/80 mt-1 font-medium">
                Manage your business and grow your services
              </p>
            </div>
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right duration-500">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="header-button-ios"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <Button
                variant="ghost"
                onClick={handleBackClick}
                className="header-button-ios"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                variant="ghost"
                onClick={handleHomeClick}
                className="header-button-ios"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <div className="ml-2">
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="tab-list-ios grid w-full grid-cols-7 gap-1.5">
            <TabsTrigger value="overview" className="tab-trigger-ios">
              Overview
            </TabsTrigger>
            <TabsTrigger value="services" className="tab-trigger-ios">
              Services
            </TabsTrigger>
            <TabsTrigger value="profile" className="tab-trigger-ios">
              Profile
            </TabsTrigger>
            <TabsTrigger value="bookings" className="tab-trigger-ios">
              Bookings
            </TabsTrigger>
            <TabsTrigger value="property-services" className="tab-trigger-ios">
              Property Services
            </TabsTrigger>
            <TabsTrigger value="analytics" className="tab-trigger-ios">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="categories" className="tab-trigger-ios">
              Categories
            </TabsTrigger>
            <TabsTrigger value="settings" className="tab-trigger-ios">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="tab-content-wrapper">
            {/* Enhanced Overview with Samsung Gradient */}
            <Card className="samsung-gradient border-0 shadow-xl mb-8 card-smooth">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="animate-in fade-in slide-in-from-left duration-700">
                    <h3 className="text-2xl font-bold text-white">Welcome Back!</h3>
                    <p className="text-white/80 mt-1 text-lg">Manage your services and grow your business</p>
                  </div>
                  <div className="flex gap-3 animate-in fade-in slide-in-from-right duration-700">
                    <Button 
                      variant="outline" 
                      className="bg-white/15 border-white/30 text-white hover:bg-white/25 hover:scale-105 transition-all duration-300"
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
              <Card className="card-smooth hover:shadow-2xl transition-all duration-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Services offered</p>
                </CardContent>
              </Card>
              
              <Card className="card-smooth hover:shadow-2xl transition-all duration-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Pending confirmations</p>
                </CardContent>
              </Card>
              
              <Card className="card-smooth hover:shadow-2xl transition-all duration-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Served customers</p>
                </CardContent>
              </Card>
              
              <Card className="card-smooth hover:shadow-2xl transition-all duration-500">
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

          <TabsContent value="services" className="tab-content-wrapper">
            {renderTabContent('layanan', <VendorServiceManagement />)}
          </TabsContent>

          <TabsContent value="profile" className="tab-content-wrapper">
            {renderTabContent('profil', <VendorBusinessProfile />, false)}
          </TabsContent>

          <TabsContent value="bookings" className="tab-content-wrapper">
            {renderTabContent('pemesanan', <VendorBookings />)}
          </TabsContent>

          <TabsContent value="property-services" className="tab-content-wrapper">
            {renderTabContent('layanan properti', <PropertyServiceManagement />)}
          </TabsContent>

          <TabsContent value="analytics" className="tab-content-wrapper">
            {renderTabContent('analitik', <VendorAnalytics />)}
          </TabsContent>

          <TabsContent value="categories" className="tab-content-wrapper">
            {renderTabContent('kategori', <CategoryDiscountSettings />)}
          </TabsContent>

          <TabsContent value="settings" className="tab-content-wrapper">
            {renderTabContent('pengaturan', <VendorSettings />, false)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorDashboard;
