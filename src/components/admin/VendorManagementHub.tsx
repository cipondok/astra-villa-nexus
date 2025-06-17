
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Store, 
  Settings, 
  List, 
  BarChart3, 
  Users, 
  Shield, 
  Award, 
  FileText,
  Activity,
  Database,
  MessageSquare
} from "lucide-react";

// Import existing vendor components
import VendorManagement from "./VendorManagement";
import EnhancedVendorServiceManagement from "./EnhancedVendorServiceManagement";
import VendorServiceCategoryManagement from "./VendorServiceCategoryManagement";
import AdminKYCManagement from "./AdminKYCManagement";
import AdminMembershipManagement from "./AdminMembershipManagement";
import VendorPerformanceAnalytics from "./VendorPerformanceAnalytics";

const VendorManagementHub = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const vendorTabs = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
      description: "Vendor system dashboard and quick actions",
      badge: null
    },
    {
      id: "vendor-requests",
      label: "Vendor Requests",
      icon: Users,
      description: "Approve/reject vendor applications",
      badge: null
    },
    {
      id: "vendor-services",
      label: "Services Management",
      icon: Settings,
      description: "Manage all vendor services",
      badge: "Enhanced"
    },
    {
      id: "service-categories",
      label: "Service Categories",
      icon: List,
      description: "Manage service categories and organization",
      badge: null
    },
    {
      id: "kyc-verification",
      label: "KYC Verification",
      icon: Shield,
      description: "Identity verification management",
      badge: null
    },
    {
      id: "membership-levels",
      label: "Membership Levels",
      icon: Award,
      description: "Vendor membership tiers and benefits",
      badge: null
    },
    {
      id: "performance-analytics",
      label: "Performance Analytics",
      icon: Activity,
      description: "Vendor performance monitoring and AI insights",
      badge: "AI"
    }
  ];

  const VendorOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
                <p className="text-2xl font-bold">124</p>
              </div>
              <Store className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold text-orange-600">8</p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Services</p>
                <p className="text-2xl font-bold text-green-600">342</p>
              </div>
              <Settings className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold text-purple-600">15</p>
              </div>
              <List className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common vendor management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab("vendor-requests")}
            >
              <Users className="h-4 w-4 mr-2" />
              Review Pending Vendor Requests
              <Badge variant="secondary" className="ml-auto">8</Badge>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab("vendor-services")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Vendor Services
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab("kyc-verification")}
            >
              <Shield className="h-4 w-4 mr-2" />
              KYC Verification Queue
              <Badge variant="secondary" className="ml-auto">3</Badge>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab("performance-analytics")}
            >
              <Activity className="h-4 w-4 mr-2" />
              View Performance Analytics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Vendor system health overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Vendor Registration System</span>
              <Badge variant="default" className="bg-green-500">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">KYC Verification API</span>
              <Badge variant="default" className="bg-green-500">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Payment Processing</span>
              <Badge variant="default" className="bg-green-500">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">AI Performance Analytics</span>
              <Badge variant="default" className="bg-green-500">Online</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendor Management Hub</h1>
          <p className="text-muted-foreground">Comprehensive vendor system management and monitoring</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Database className="h-3 w-3 mr-1" />
            All Systems Online
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
          {vendorTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge && (
                <Badge variant="secondary" className="text-xs ml-1">
                  {tab.badge}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <VendorOverview />
        </TabsContent>

        <TabsContent value="vendor-requests">
          <VendorManagement />
        </TabsContent>

        <TabsContent value="vendor-services">
          <EnhancedVendorServiceManagement />
        </TabsContent>

        <TabsContent value="service-categories">
          <VendorServiceCategoryManagement />
        </TabsContent>

        <TabsContent value="kyc-verification">
          <AdminKYCManagement />
        </TabsContent>

        <TabsContent value="membership-levels">
          <AdminMembershipManagement />
        </TabsContent>

        <TabsContent value="performance-analytics">
          <VendorPerformanceAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorManagementHub;
