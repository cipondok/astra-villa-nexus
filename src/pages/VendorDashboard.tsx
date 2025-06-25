
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
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
  Sun,
  Moon
} from 'lucide-react';

// Import vendor components
import EnhancedVendorDashboard from '@/components/vendor/EnhancedVendorDashboard';
import VendorBusinessProfile from '@/components/vendor/VendorBusinessProfile';
import VendorServices from '@/components/vendor/VendorServices';
import VendorBookings from '@/components/vendor/VendorBookings';
import VendorAnalytics from '@/components/vendor/VendorAnalytics';
import VendorSettings from '@/components/vendor/VendorSettings';
import VendorSupport from '@/components/vendor/VendorSupport';
import VendorReviews from '@/components/vendor/VendorReviews';
import VendorProfileProgress from '@/components/vendor/VendorProfileProgress';
import VendorDashboardNavigation from '@/components/vendor/VendorDashboardNavigation';
import ThemeSwitcher from '@/components/ui/theme-switcher';

const VendorDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSection, setActiveSection] = useState('dashboard');

  // Check if user is a vendor
  const isVendor = profile?.role === 'vendor';

  const handleHomeClick = () => {
    navigate('/');
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
            Vendor access required to view this dashboard
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <EnhancedVendorDashboard />;
      case 'profile':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VendorBusinessProfile />
            <VendorProfileProgress />
          </div>
        );
      case 'services':
        return <VendorServices />;
      case 'bookings':
        return <VendorBookings />;
      case 'analytics':
        return <VendorAnalytics />;
      case 'reviews':
        return <VendorReviews />;
      case 'settings':
        return <VendorSettings />;
      case 'support':
        return <VendorSupport />;
      default:
        return <EnhancedVendorDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Home and Theme Toggle */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vendor Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage your business, services, and customer relationships
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleHomeClick}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                <span className="hidden md:block">Home</span>
              </Button>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
                  <p className="text-2xl font-bold">42</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month Revenue</p>
                  <p className="text-2xl font-bold">$2,340</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Services</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <Store className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">4.8</p>
                    <Badge className="bg-yellow-100 text-yellow-800">★★★★★</Badge>
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tools">All Tools</TabsTrigger>
                <TabsTrigger value="profile">Profile Progress</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="overview">
                {renderActiveSection()}
              </TabsContent>

              <TabsContent value="tools">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Vendor Dashboard Tools</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Access all vendor management tools and features
                    </p>
                  </div>
                  <VendorDashboardNavigation 
                    activeSection={activeSection}
                    onSectionChange={(section) => {
                      setActiveSection(section);
                      setActiveTab('overview');
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="profile">
                <VendorProfileProgress />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboard;
