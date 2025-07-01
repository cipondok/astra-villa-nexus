
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Plus, List, Settings, MapPin, Activity, Sliders, Monitor, Eye, Blocks } from "lucide-react";
import PropertyListManagement from "./PropertyListManagement";
import EnhancedPropertyInsertForm from "./EnhancedPropertyInsertForm";
import PropertyCategoriesManagement from "./PropertyCategoriesManagement";
import LocationDatabaseManager from "./LocationDatabaseManager";
import DiagnosticDashboard from "./DiagnosticDashboard";
import SystemStatusChecker from "./SystemStatusChecker";
import PropertySlideSettings from "./PropertySlideSettings";
import PropertyDisplaySettings from "./PropertyDisplaySettings";
import Property3DViewSettings from "./Property3DViewSettings";
import PropertySmartPreview from "./PropertySmartPreview";

const AdminPropertyManagement = () => {
  const [activeTab, setActiveTab] = useState("diagnostic");
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddProperty = () => {
    setActiveTab("add-property");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Property Management Hub</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Comprehensive property management with advanced display and 3D view controls
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-white/20 dark:border-slate-700/50 p-2">
          <TabsList className="grid w-full grid-cols-9 bg-transparent gap-1">
            <TabsTrigger 
              value="diagnostic" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Diagnostic</span>
            </TabsTrigger>
            <TabsTrigger 
              value="properties" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Properties</span>
            </TabsTrigger>
            <TabsTrigger 
              value="add-property" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Property</span>
            </TabsTrigger>
            <TabsTrigger 
              value="slide-settings" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
            >
              <Sliders className="h-4 w-4" />
              <span className="hidden sm:inline">Slides</span>
            </TabsTrigger>
            <TabsTrigger 
              value="display-settings" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
            >
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger 
              value="3d-view-settings" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
            >
              <Blocks className="h-4 w-4" />
              <span className="hidden sm:inline">3D View</span>
            </TabsTrigger>
            <TabsTrigger 
              value="smart-preview" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger 
              value="locations" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Locations</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="diagnostic">
          <DiagnosticDashboard />
        </TabsContent>

        <TabsContent value="properties">
          <PropertyListManagement onAddProperty={handleAddProperty} />
        </TabsContent>

        <TabsContent value="add-property">
          <EnhancedPropertyInsertForm />
        </TabsContent>

        <TabsContent value="slide-settings">
          <PropertySlideSettings />
        </TabsContent>

        <TabsContent value="display-settings">
          <PropertyDisplaySettings />
        </TabsContent>

        <TabsContent value="3d-view-settings">
          <Property3DViewSettings />
        </TabsContent>

        <TabsContent value="smart-preview">
          <PropertySmartPreview />
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
