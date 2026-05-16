import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { FolderTree, List, Tag, Layers } from "lucide-react";
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-border">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <FolderTree className="h-4 w-4 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold">Vendor Category Management</h2>
            <Badge className="bg-primary/20 text-primary text-[9px] px-1.5 py-0 h-4">Hierarchy</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">Manage vendor service categories</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-border/50">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                <FolderTree className="h-3 w-3 text-primary" />
              </div>
              <div>
                <div className="text-sm font-bold text-primary">{stats?.serviceCategories || 0}</div>
                <div className="text-[9px] text-muted-foreground">Categories</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-chart-1/20 rounded flex items-center justify-center">
                <Tag className="h-3 w-3 text-chart-1" />
              </div>
              <div>
                <div className="text-sm font-bold text-chart-1">{stats?.serviceNames || 0}</div>
                <div className="text-[9px] text-muted-foreground">Services</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-chart-2/20 rounded flex items-center justify-center">
                <Layers className="h-3 w-3 text-chart-2" />
              </div>
              <div>
                <div className="text-sm font-bold text-chart-2">{stats?.subcategories || 0}</div>
                <div className="text-[9px] text-muted-foreground">Subcats</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList className="grid w-full grid-cols-4 h-8 p-0.5 bg-muted/50">
          <TabsTrigger value="tree-view" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <FolderTree className="h-3 w-3" />
            Tree
          </TabsTrigger>
          <TabsTrigger value="service-categories" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-chart-2/20 data-[state=active]:text-chart-2">
            <List className="h-3 w-3" />
            Main
          </TabsTrigger>
          <TabsTrigger value="subcategories" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-chart-4/20 data-[state=active]:text-chart-4">
            <Layers className="h-3 w-3" />
            Sub
          </TabsTrigger>
          <TabsTrigger value="service-names" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-chart-1/20 data-[state=active]:text-chart-1">
            <Tag className="h-3 w-3" />
            Names
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tree-view" className="mt-3">
          <VendorCategoryTree />
        </TabsContent>
        
        <TabsContent value="service-categories" className="mt-3">
          <VendorMainCategoryManagement />
        </TabsContent>
        
        <TabsContent value="subcategories" className="mt-3">
          <VendorSubcategoryManagement />
        </TabsContent>
        
        <TabsContent value="service-names" className="mt-3">
          <ApprovedServiceNamesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorCategoryManagement;
