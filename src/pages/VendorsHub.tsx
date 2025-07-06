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
  Settings, 
  BarChart3,
  FileText,
  AlertTriangle,
  Home,
  ArrowLeft,
  ShoppingBag,
  Tags,
  UserCheck,
  ClipboardList,
  TrendingUp,
  Shield
} from 'lucide-react';

// Import vendor management components
import VendorManagement from '@/components/admin/VendorManagement';
import VendorCategoryManagement from '@/components/admin/VendorCategoryManagement';
import VendorServiceManagement from '@/components/vendor/VendorServiceManagement';
import AdminVendorServiceManagement from '@/components/admin/AdminVendorServiceManagement';
import VendorApplicationManagement from '@/components/admin/VendorApplicationManagement';
import VendorPerformanceAnalytics from '@/components/admin/VendorPerformanceAnalytics';
import VendorKYCManagement from '@/components/admin/VendorKYCManagement';
import VendorVerificationPanel from '@/components/admin/VendorVerificationPanel';
import ComprehensiveVendorManagement from '@/components/admin/ComprehensiveVendorManagement';
import VendorControlPanel from '@/components/admin/VendorControlPanel';
import ThemeSwitcher from '@/components/ui/theme-switcher';

const VendorsHub = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Check if user is admin
  const isAdmin = profile?.role === 'admin' || profile?.is_admin;

  const handleHomeClick = () => {
    navigate('/', { replace: true });
  };

  const handleBackClick = () => {
    window.history.back();
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access the vendors hub
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Admin access required to manage vendors hub.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const vendorStats = {
    totalVendors: 245,
    activeVendors: 189,
    pendingApplications: 23,
    totalServices: 1047,
    approvedServices: 892,
    monthlyRevenue: 15750000
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-foreground shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Vendors Hub</h1>
              <p className="text-white/80 mt-1">
                Comprehensive vendor management and analytics platform
              </p>
            </div>
            <div className="flex items-center gap-3">
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendorStats.totalVendors}</div>
              <p className="text-xs text-muted-foreground">Registered vendors</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{vendorStats.activeVendors}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Apps</CardTitle>
              <ClipboardList className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{vendorStats.pendingApplications}</div>
              <p className="text-xs text-muted-foreground">Need review</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendorStats.totalServices}</div>
              <p className="text-xs text-muted-foreground">Services listed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{vendorStats.approvedServices}</div>
              <p className="text-xs text-muted-foreground">Services approved</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Rp {vendorStats.monthlyRevenue.toLocaleString('id-ID')}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="kyc">KYC/Verification</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="control">Control Panel</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recent Vendor Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">New vendor registrations</span>
                      <Badge variant="outline">+12 today</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Service submissions</span>
                      <Badge variant="outline">+8 pending</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">KYC verifications</span>
                      <Badge variant="outline">5 pending</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" onClick={() => setActiveTab('applications')}>
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Review Pending Applications
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('kyc')}>
                    <Shield className="h-4 w-4 mr-2" />
                    Manage KYC Verifications
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('services')}>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Approve Services
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vendors">
            <ComprehensiveVendorManagement />
          </TabsContent>

          <TabsContent value="applications">
            <VendorApplicationManagement />
          </TabsContent>

          <TabsContent value="services">
            <AdminVendorServiceManagement />
          </TabsContent>

          <TabsContent value="categories">
            <VendorCategoryManagement />
          </TabsContent>

          <TabsContent value="kyc">
            <div className="space-y-6">
              <VendorKYCManagement />
              <VendorVerificationPanel />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <VendorPerformanceAnalytics />
          </TabsContent>

          <TabsContent value="control">
            <VendorControlPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorsHub;