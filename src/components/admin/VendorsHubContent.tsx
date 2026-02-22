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
  Shield,
  FolderTree,
  Settings,
  BarChart3,
  Sliders,
  FileCheck
} from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
import UserDirectoryFixed from './UserDirectoryFixed';
import VendorUserRoleManagement from './VendorUserRoleManagement';

const VendorsHubContent = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: vendorStats = {
    totalVendors: 0,
    activeVendors: 0,
    pendingApplications: 0,
    totalServices: 0,
    approvedServices: 0,
    monthlyRevenue: 0
  }, isLoading: vendorStatsLoading } = useQuery({
    queryKey: ['vendors-hub-stats'],
    queryFn: async () => {
      const [vendorProfilesResult, activeVendorProfilesResult, vendorBizProfilesResult] = await Promise.all([
        supabase.from('vendor_business_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('vendor_business_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('vendor_services').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('admin_approval_status', 'approved')
      ]);

      const totalVendors = Math.max(
        typeof vendorProfilesResult.count === 'number' ? vendorProfilesResult.count : 0,
        typeof vendorBizProfilesResult.count === 'number' ? vendorBizProfilesResult.count : 0
      );

      const activeVendors = typeof activeVendorProfilesResult?.count === 'number' ? activeVendorProfilesResult.count : 0;
      const approvedServices = typeof vendorBizProfilesResult?.count === 'number' ? vendorBizProfilesResult.count : 0;

      return {
        totalVendors,
        activeVendors,
        pendingApplications: 0,
        totalServices: approvedServices,
        approvedServices,
        monthlyRevenue: 0
      };
    },
    refetchInterval: 60000,
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 via-accent/5 to-chart-3/10 rounded-lg border border-border/50">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <Store className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold">Vendor Management Hub</h2>
            <Badge className="bg-chart-3/20 text-chart-3 text-[9px] px-1.5 py-0 h-4">Enterprise</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">Complete vendor lifecycle management</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        <Card className="border-border/50">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
                <Store className="h-3 w-3 text-primary" />
              </div>
              <div>
                <div className="text-sm font-bold">{vendorStats.totalVendors}</div>
                <div className="text-[9px] text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-chart-1/10 rounded flex items-center justify-center">
                <UserCheck className="h-3 w-3 text-chart-1" />
              </div>
              <div>
                <div className="text-sm font-bold text-chart-1">{vendorStats.activeVendors}</div>
                <div className="text-[9px] text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-chart-3/10 rounded flex items-center justify-center">
                <ClipboardList className="h-3 w-3 text-chart-3" />
              </div>
              <div>
                <div className="text-sm font-bold text-chart-3">{vendorStats.pendingApplications}</div>
                <div className="text-[9px] text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-chart-2/10 rounded flex items-center justify-center">
                <ShoppingBag className="h-3 w-3 text-chart-2" />
              </div>
              <div>
                <div className="text-sm font-bold text-chart-2">{vendorStats.totalServices}</div>
                <div className="text-[9px] text-muted-foreground">Services</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-chart-1/10 rounded flex items-center justify-center">
                <Shield className="h-3 w-3 text-chart-1" />
              </div>
              <div>
                <div className="text-sm font-bold text-chart-1">{vendorStats.approvedServices}</div>
                <div className="text-[9px] text-muted-foreground">Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-chart-5/10 rounded flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-chart-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-chart-5">Rp {(vendorStats.monthlyRevenue / 1000000).toFixed(1)}M</div>
                <div className="text-[9px] text-muted-foreground">Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList className="grid w-full grid-cols-11 h-8 p-0.5 bg-muted/50">
          <TabsTrigger value="overview" className="text-[9px] h-7 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Overview
          </TabsTrigger>
          <TabsTrigger value="user-directory" className="text-[9px] h-7 data-[state=active]:bg-chart-2/20 data-[state=active]:text-chart-2">
            Directory
          </TabsTrigger>
          <TabsTrigger value="vendors" className="text-[9px] h-7 data-[state=active]:bg-chart-1/20 data-[state=active]:text-chart-1">
            Vendors
          </TabsTrigger>
          <TabsTrigger value="user-roles" className="text-[9px] h-7 data-[state=active]:bg-chart-5/20 data-[state=active]:text-chart-5">
            Roles
          </TabsTrigger>
          <TabsTrigger value="applications" className="text-[9px] h-7 data-[state=active]:bg-chart-3/20 data-[state=active]:text-chart-3">
            Apps
          </TabsTrigger>
          <TabsTrigger value="services" className="text-[9px] h-7 data-[state=active]:bg-chart-2/20 data-[state=active]:text-chart-2">
            Services
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-[9px] h-7 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Categories
          </TabsTrigger>
          <TabsTrigger value="category-control" className="text-[9px] h-7 data-[state=active]:bg-chart-4/20 data-[state=active]:text-chart-4">
            Control
          </TabsTrigger>
          <TabsTrigger value="kyc" className="text-[9px] h-7 data-[state=active]:bg-chart-1/20 data-[state=active]:text-chart-1">
            KYC
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-[9px] h-7 data-[state=active]:bg-chart-2/20 data-[state=active]:text-chart-2">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="control" className="text-[9px] h-7 data-[state=active]:bg-muted data-[state=active]:text-foreground">
            Panel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Card className="border-border/50">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-chart-2/10 rounded flex items-center justify-center">
                    <Users className="h-3 w-3 text-chart-2" />
                  </div>
                  <CardTitle className="text-xs">Recent Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <span className="text-[10px]">New registrations</span>
                    <Badge variant="outline" className="text-[9px] h-4 px-1.5">+12 today</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <span className="text-[10px]">Service submissions</span>
                    <Badge variant="outline" className="text-[9px] h-4 px-1.5">+8 pending</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <span className="text-[10px]">KYC verifications</span>
                    <Badge variant="outline" className="text-[9px] h-4 px-1.5">5 pending</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border/50">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-chart-1/10 rounded flex items-center justify-center">
                    <Settings className="h-3 w-3 text-chart-1" />
                  </div>
                  <CardTitle className="text-xs">Quick Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-[10px] text-muted-foreground p-2 bg-muted/30 rounded-lg">
                  Use the tabs above to navigate to different vendor management sections.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-directory" className="mt-3">
          <UserDirectoryFixed />
        </TabsContent>

        <TabsContent value="vendors" className="mt-3">
          <ComprehensiveVendorManagement />
        </TabsContent>

        <TabsContent value="user-roles" className="mt-3">
          <VendorUserRoleManagement />
        </TabsContent>

        <TabsContent value="applications" className="mt-3">
          <VendorApplicationManagement />
        </TabsContent>

        <TabsContent value="category-control" className="mt-3">
          <VendorCategoryController />
        </TabsContent>

        <TabsContent value="services" className="mt-3">
          <AdminVendorServiceManagement />
        </TabsContent>

        <TabsContent value="categories" className="mt-3">
          <VendorCategoryManagement />
        </TabsContent>

        <TabsContent value="kyc" className="mt-3">
          <div className="space-y-4">
            <VendorKYCManagement />
            <VendorVerificationPanel />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-3">
          <VendorPerformanceAnalytics />
        </TabsContent>

        <TabsContent value="control" className="mt-3">
          <VendorControlPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorsHubContent;
