
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Plus, List, Settings, MapPin } from "lucide-react";
import PropertyListManagement from "./PropertyListManagement";
import EnhancedPropertyInsertForm from "./EnhancedPropertyInsertForm";
import PropertyCategoriesManagement from "./PropertyCategoriesManagement";
import LocationDatabaseManager from "./LocationDatabaseManager";

const AdminPropertyManagement = () => {
  const [activeTab, setActiveTab] = useState("properties");
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddProperty = () => {
    setActiveTab("add-property");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // You can pass this search query to child components if needed
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Property Management Hub</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Comprehensive property management for administrators
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-white/20 dark:border-slate-700/50 p-2">
          <TabsList className="grid w-full grid-cols-4 bg-transparent">
            <TabsTrigger 
              value="properties" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
            >
              <List className="h-4 w-4" />
              Property List
            </TabsTrigger>
            <TabsTrigger 
              value="add-property" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
              Add Property
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
            >
              <Settings className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger 
              value="locations" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
            >
              <MapPin className="h-4 w-4" />
              Locations
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="properties">
          <PropertyListManagement onAddProperty={handleAddProperty} />
        </TabsContent>

        <TabsContent value="add-property">
          <EnhancedPropertyInsertForm />
        </TabsContent>

        <TabsContent value="categories">
          <PropertyCategoriesManagement />
        </TabsContent>

        <TabsContent value="locations">
          <LocationDatabaseManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPropertyManagement;
