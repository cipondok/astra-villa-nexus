import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  Users, 
  ShoppingBag,
  UserCheck,
  ClipboardList,
  TrendingUp,
  Shield
} from 'lucide-react';

// Import vendor management components
import VendorManagement from './VendorManagement';
import VendorCategoryManagement from './VendorCategoryManagement';
import AdminVendorServiceManagement from './AdminVendorServiceManagement';
import VendorApplicationManagement from './VendorApplicationManagement';
import VendorCategoryController from './VendorCategoryController';
import VendorPerformanceAnalytics from './VendorPerformanceAnalytics';
import VendorKYCManagement from './VendorKYCManagement';
import VendorVerificationPanel from './VendorVerificationPanel';
import ComprehensiveVendorManagement from './ComprehensiveVendorManagement';
import VendorControlPanel from './VendorControlPanel';
import UserDirectoryWithCategories from './UserDirectoryWithCategories';

const VendorsHubContent = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const vendorStats = {
    totalVendors: 245,
    activeVendors: 189,
    pendingApplications: 23,
    totalServices: 1047,
    approvedServices: 892,
    monthlyRevenue: 15750000
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Vendors Hub</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive vendor management and analytics platform
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="user-directory">User Directory</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="category-control">Category Control</TabsTrigger>
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
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Use the tabs above to navigate to different vendor management sections.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-directory">
          <UserDirectoryFixed />
        </TabsContent>

        <TabsContent value="vendors">
          <ComprehensiveVendorManagement />
        </TabsContent>

        <TabsContent value="applications">
          <VendorApplicationManagement />
        </TabsContent>

        <TabsContent value="category-control">
          <VendorCategoryController />
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
  );
};

export default VendorsHubContent;