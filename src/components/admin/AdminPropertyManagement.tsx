
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Plus, List, Settings, MapPin, Activity, Sliders, Monitor, Eye, Blocks, Filter } from "lucide-react";
import SimplePropertyManagement from "./SimplePropertyManagement";
import EnhancedPropertyInsertForm from "./EnhancedPropertyInsertForm";
import PropertyCategoriesManagement from "./PropertyCategoriesManagement";
import LocationDatabaseManager from "./LocationDatabaseManager";
import DiagnosticDashboard from "./DiagnosticDashboard";
import SystemStatusChecker from "./SystemStatusChecker";
import PropertySlideSettings from "./PropertySlideSettings";
import PropertyDisplaySettings from "./PropertyDisplaySettings";
import Property3DViewSettings from "./Property3DViewSettings";
import PropertySmartPreview from "./PropertySmartPreview";
import PropertyTestPanel from "./PropertyTestPanel";
import AdminAccessChecker from "./AdminAccessChecker";
import PropertyFilterSettings from "./settings/PropertyFilterSettings";

const AdminPropertyManagement = () => {
  const [activeTab, setActiveTab] = useState("properties");
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddProperty = () => {
    console.log('🆕 Add Property button clicked - switching to add-property tab');
    setActiveTab("add-property");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Property Management Hub</h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive property management with advanced display and 3D view controls
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-card backdrop-blur-sm rounded-xl border border-border p-2 shadow-sm">
          <TabsList className="grid w-full grid-cols-10 bg-transparent gap-1">
            <TabsTrigger 
              value="diagnostic" 
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Diagnostic</span>
            </TabsTrigger>
            <TabsTrigger 
              value="properties" 
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Properties</span>
            </TabsTrigger>
            <TabsTrigger 
              value="add-property" 
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Property</span>
            </TabsTrigger>
            <TabsTrigger 
              value="slide-settings" 
              className="flex items-center gap-2"
            >
              <Sliders className="h-4 w-4" />
              <span className="hidden sm:inline">Slides</span>
            </TabsTrigger>
            <TabsTrigger 
              value="display-settings" 
              className="flex items-center gap-2"
            >
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger 
              value="3d-view-settings" 
              className="flex items-center gap-2"
            >
              <Blocks className="h-4 w-4" />
              <span className="hidden sm:inline">3D View</span>
            </TabsTrigger>
            <TabsTrigger 
              value="smart-preview" 
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger 
              value="locations" 
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Locations</span>
            </TabsTrigger>
            <TabsTrigger 
              value="filters" 
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="diagnostic">
          <div className="space-y-6">
            <AdminAccessChecker />
            <PropertyTestPanel />
            <DiagnosticDashboard />
          </div>
        </TabsContent>

        <TabsContent value="properties">
          <SimplePropertyManagement onAddProperty={handleAddProperty} />
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

        <TabsContent value="filters">
          <PropertyFilterSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPropertyManagement;
