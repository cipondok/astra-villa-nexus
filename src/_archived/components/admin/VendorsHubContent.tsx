import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrencyFormatterShort } from '@/stores/currencyStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Store, Users, ShoppingBag, UserCheck, ClipboardList, TrendingUp,
  Shield, FolderTree, Settings, BarChart3, Sliders, FileCheck,
  Plus, Filter, Scan, AlertTriangle
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
import VendorUserRoleManagement from './VendorUserRoleManagement';

const VendorsHubContent = () => {
  const [activeTab, setActiveTab] = useState('vendors');

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

  const kpiItems = [
    { label: 'Total Vendors', value: vendorStats.totalVendors, icon: Store, color: 'text-foreground' },
    { label: 'Active', value: vendorStats.activeVendors, icon: UserCheck, color: 'text-chart-1' },
    { label: 'Pending', value: vendorStats.pendingApplications, icon: ClipboardList, color: 'text-chart-3' },
    { label: 'Flagged Risk', value: 0, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Revenue', value: getCurrencyFormatterShort()(vendorStats.monthlyRevenue), icon: TrendingUp, color: 'text-chart-2', isText: true },
  ];

  return (
    <div className="space-y-3">
      {/* Compact Page Header — 72px max */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground tracking-tight">Vendors Hub</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
            <Scan className="h-3.5 w-3.5" />
            AI Scan
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* KPI Strip — 64px max height, single row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {kpiItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border/40 bg-card">
            <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
            <div className="min-w-0">
              <div className={`text-lg font-bold tabular-nums leading-tight ${item.color}`}>
                {item.isText ? item.value : item.value}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight truncate">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation — minimal */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-9 bg-muted/40 border border-border/30 p-0.5 w-auto inline-flex">
          <TabsTrigger value="vendors" className="text-xs h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Vendors
          </TabsTrigger>
          <TabsTrigger value="applications" className="text-xs h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Applications
          </TabsTrigger>
          <TabsTrigger value="services" className="text-xs h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Services
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-xs h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Categories
          </TabsTrigger>
          <TabsTrigger value="kyc" className="text-xs h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            KYC
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="control" className="text-xs h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Control
          </TabsTrigger>
        </TabsList>

        {/* Main workspace — above the fold */}
        <TabsContent value="vendors" className="mt-3">
          <ComprehensiveVendorManagement />
        </TabsContent>

        <TabsContent value="applications" className="mt-3">
          <VendorApplicationManagement />
        </TabsContent>

        <TabsContent value="services" className="mt-3">
          <AdminVendorServiceManagement />
        </TabsContent>

        <TabsContent value="categories" className="mt-3">
          <VendorCategoryManagement />
        </TabsContent>

        <TabsContent value="kyc" className="mt-3">
          <div className="space-y-3">
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
