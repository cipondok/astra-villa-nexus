
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { FolderTree, List } from "lucide-react";
import VendorMainCategoryManagement from "./VendorMainCategoryManagement";
import VendorSubcategoryManagement from "./VendorSubcategoryManagement";
import ApprovedServiceNamesManagement from "./ApprovedServiceNamesManagement";
import VendorCategoryTree from "./VendorCategoryTree";

const VendorCategoryManagement = () => {
  const [activeTab, setActiveTab] = useState("tree-view");

  // Fetch category stats
  const { data: stats } = useQuery({
    queryKey: ['vendor-category-stats'],
    queryFn: async () => {
      const [mainCats, serviceNames, serviceCategories] = await Promise.all([
        supabase.from('vendor_service_categories').select('*', { count: 'exact' }),
        supabase.from('approved_service_names').select('*', { count: 'exact' }),
        supabase.from('vendor_sub_categories').select('*', { count: 'exact' })
      ]);
      
      return {
        serviceCategories: mainCats.count || 0,
        serviceNames: serviceNames.count || 0,
        subcategories: serviceCategories.count || 0
      };
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendor Category Management</h1>
          <p className="text-muted-foreground">
            Manage vendor service categories with hierarchical structure
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Service Categories</p>
                <p className="text-2xl font-bold">{stats?.serviceCategories || 0}</p>
              </div>
              <FolderTree className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved Service Names</p>
                <p className="text-2xl font-bold">{stats?.serviceNames || 0}</p>
              </div>
              <List className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Subcategories</p>
                <p className="text-2xl font-bold">{stats?.subcategories || 0}</p>
              </div>
              <List className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tree-view">Tree View</TabsTrigger>
          <TabsTrigger value="service-categories">Main Categories</TabsTrigger>
          <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
          <TabsTrigger value="service-names">Service Names</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tree-view">
          <VendorCategoryTree />
        </TabsContent>
        
        <TabsContent value="service-categories">
          <VendorMainCategoryManagement />
        </TabsContent>
        
        <TabsContent value="subcategories">
          <VendorSubcategoryManagement />
        </TabsContent>
        
        <TabsContent value="service-names">
          <ApprovedServiceNamesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorCategoryManagement;
