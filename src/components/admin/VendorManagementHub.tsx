
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Users, Package, FolderTree, BarChart3, Activity, TrendingUp } from "lucide-react";
import VendorCategoryManagement from "./VendorCategoryManagement";
import VendorInventoryManagement from "./VendorInventoryManagement";
import IndonesianVendorManagement from "./IndonesianVendorManagement";
import VendorServicesCategoryShowcase from "./VendorServicesCategoryShowcase";
import VendorProgressReports from "./VendorProgressReports";
import VendorDiagnostics from "./VendorDiagnostics";
import DiagnosticAnalyticsOverview from "./DiagnosticAnalyticsOverview";
import HierarchicalCategoryManagement from "./HierarchicalCategoryManagement";
import VendorIssuesOverview from "./VendorIssuesOverview";
import VendorFunctionGenerator from "./VendorFunctionGenerator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const VendorManagementHub = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: activeVendors = 0 } = useQuery({
    queryKey: ['vendor-hub-active-vendors'],
    queryFn: async () => {
      // Get vendor user IDs from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'vendor')
        .eq('is_active', true);

      if (roleError) throw roleError;
      
      const userIds = roleData?.map(r => r.user_id) || [];
      if (userIds.length === 0) return 0;

      // Count non-suspended profiles
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('id', userIds)
        .eq('is_suspended', false);
      return count || 0;
    },
    refetchInterval: 60000,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            Vendor Management Hub
          </h1>
          <p className="text-muted-foreground">
            Complete vendor, category, and inventory management system
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="functions">Functions</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="showcase">Showcase</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Vendors</p>
                    <p className="text-2xl font-bold">{activeVendors}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold">15</p>
                  </div>
                  <FolderTree className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Services</p>
                    <p className="text-2xl font-bold">456</p>
                  </div>
                  <ShoppingBag className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Products in Stock</p>
                    <p className="text-2xl font-bold">1,234</p>
                  </div>
                  <Package className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common vendor management tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div 
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors border-orange-200 bg-orange-50/50"
                  onClick={() => setActiveTab("issues")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-orange-800">Resolve Issues</h4>
                      <p className="text-sm text-orange-600">KYC & Payment integration issues</p>
                    </div>
                    <Badge variant="destructive">1 Active</Badge>
                  </div>
                </div>

                <div 
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors border-blue-200 bg-blue-50/50"
                  onClick={() => setActiveTab("functions")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-800">Generate Functions</h4>
                      <p className="text-sm text-blue-600">Create new vendor system capabilities</p>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">12 Templates</Badge>
                  </div>
                </div>

                <div 
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setActiveTab("categories")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Manage Categories</h4>
                      <p className="text-sm text-muted-foreground">Add or edit vendor categories</p>
                    </div>
                    <FolderTree className="h-5 w-5" />
                  </div>
                </div>

                <div 
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setActiveTab("services")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Review Services</h4>
                      <p className="text-sm text-muted-foreground">Approve and manage services</p>
                    </div>
                    <Badge variant="outline">3 Pending</Badge>
                  </div>
                </div>

                <div 
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setActiveTab("inventory")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Track Inventory</h4>
                      <p className="text-sm text-muted-foreground">Monitor stock levels</p>
                    </div>
                    <Badge variant="secondary">12 Low Stock</Badge>
                  </div>
                </div>

                <div 
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setActiveTab("progress")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Progress Reports</h4>
                      <p className="text-sm text-muted-foreground">Track vendor progress</p>
                    </div>
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>

                <div 
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setActiveTab("diagnostics")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">System Diagnostics</h4>
                      <p className="text-sm text-muted-foreground">Real-time monitoring</p>
                    </div>
                    <Activity className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest vendor-related activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New vendor registered</p>
                    <p className="text-xs text-muted-foreground">Electronics repair service</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2m ago</span>
                </div>

                <div className="flex items-center gap-3 p-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Service approved</p>
                    <p className="text-xs text-muted-foreground">AC Repair & Maintenance</p>
                  </div>
                  <span className="text-xs text-muted-foreground">5m ago</span>
                </div>

                <div className="flex items-center gap-3 p-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Low stock alert</p>
                    <p className="text-xs text-muted-foreground">Samsung TV 55" - 2 units left</p>
                  </div>
                  <span className="text-xs text-muted-foreground">10m ago</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <VendorIssuesOverview />
        </TabsContent>

        <TabsContent value="functions" className="space-y-6">
          <VendorFunctionGenerator />
        </TabsContent>

        <TabsContent value="categories">
          <VendorCategoryManagement />
        </TabsContent>

        <TabsContent value="services">
          <div className="space-y-6">
            <HierarchicalCategoryManagement />
            <IndonesianVendorManagement />
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <VendorInventoryManagement />
        </TabsContent>

        <TabsContent value="progress">
          <VendorProgressReports />
        </TabsContent>

        <TabsContent value="diagnostics">
          <VendorDiagnostics />
        </TabsContent>

        <TabsContent value="analytics">
          <DiagnosticAnalyticsOverview />
        </TabsContent>

        <TabsContent value="showcase">
          <VendorServicesCategoryShowcase />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorManagementHub;
