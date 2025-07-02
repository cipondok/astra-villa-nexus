
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Users, Package, FolderTree, BarChart3 } from "lucide-react";
import VendorCategoryManagement from "./VendorCategoryManagement";
import VendorInventoryManagement from "./VendorInventoryManagement";
import AdminVendorServiceManagement from "./AdminVendorServiceManagement";
import VendorServicesCategoryShowcase from "./VendorServicesCategoryShowcase";

const VendorManagementHub = () => {
  const [activeTab, setActiveTab] = useState("overview");

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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="showcase">Showcase</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Vendors</p>
                    <p className="text-2xl font-bold">127</p>
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

        <TabsContent value="categories">
          <VendorCategoryManagement />
        </TabsContent>

        <TabsContent value="services">
          <AdminVendorServiceManagement />
        </TabsContent>

        <TabsContent value="inventory">
          <VendorInventoryManagement />
        </TabsContent>

        <TabsContent value="showcase">
          <VendorServicesCategoryShowcase />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorManagementHub;
