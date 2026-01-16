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
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-cyan-500/10 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
          <FolderTree className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold">Vendor Category Management</h2>
            <Badge className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-[9px] px-1.5 py-0 h-4">Hierarchy</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">Manage vendor service categories</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-blue-200/50 dark:border-blue-800/30">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                <FolderTree className="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-blue-600">{stats?.serviceCategories || 0}</div>
                <div className="text-[9px] text-muted-foreground">Categories</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200/50 dark:border-green-800/30">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center">
                <Tag className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-green-600">{stats?.serviceNames || 0}</div>
                <div className="text-[9px] text-muted-foreground">Services</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200/50 dark:border-purple-800/30">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                <Layers className="h-3 w-3 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-purple-600">{stats?.subcategories || 0}</div>
                <div className="text-[9px] text-muted-foreground">Subcats</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList className="grid w-full grid-cols-4 h-8 p-0.5 bg-muted/50">
          <TabsTrigger value="tree-view" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400">
            <FolderTree className="h-3 w-3" />
            Tree
          </TabsTrigger>
          <TabsTrigger value="service-categories" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400">
            <List className="h-3 w-3" />
            Main
          </TabsTrigger>
          <TabsTrigger value="subcategories" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400">
            <Layers className="h-3 w-3" />
            Sub
          </TabsTrigger>
          <TabsTrigger value="service-names" className="flex items-center gap-1 text-[10px] h-7 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-400">
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
