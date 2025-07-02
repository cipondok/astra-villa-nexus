
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import VendorServicesCategoryShowcase from "./VendorServicesCategoryShowcase";
import VendorCategoryBlogView from "./VendorCategoryBlogView";
import VendorCategoryManagement from "./VendorCategoryManagement";
import { 
  LayoutGrid, 
  BookOpen, 
  Settings, 
  TrendingUp 
} from "lucide-react";

const VendorCategoryDashboard = () => {
  const [activeTab, setActiveTab] = useState("showcase");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Vendor Categories Hub
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Complete management and showcase of vendor service categories - from technical management to customer-facing content
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="showcase" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden md:inline">Service Showcase</span>
            <span className="md:hidden">Showcase</span>
          </TabsTrigger>
          <TabsTrigger value="blog" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden md:inline">Blog View</span>
            <span className="md:hidden">Blog</span>
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Management</span>
            <span className="md:hidden">Admin</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden md:inline">Analytics</span>
            <span className="md:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="showcase" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                Service Categories Showcase
              </CardTitle>
              <CardDescription>
                Customer-facing view of all vendor service categories with live services and pricing
              </CardDescription>
            </CardHeader>
          </Card>
          <VendorServicesCategoryShowcase />
        </TabsContent>

        <TabsContent value="blog" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Category Blog Content
              </CardTitle>
              <CardDescription>
                Blog-style content generated from your vendor categories and services
              </CardDescription>
            </CardHeader>
          </Card>
          <VendorCategoryBlogView />
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Category Management
              </CardTitle>
              <CardDescription>
                Administrative interface for managing categories, subcategories, and service organization
              </CardDescription>
            </CardHeader>
          </Card>
          <VendorCategoryManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Category Analytics
              </CardTitle>
              <CardDescription>
                Performance metrics and insights for vendor categories and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                <p>Detailed analytics and performance metrics for vendor categories will be available here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorCategoryDashboard;
