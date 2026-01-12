
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, List, Settings, MapPin, Activity, Sliders, Monitor, Eye, Blocks, Filter, Globe } from "lucide-react";
import SimplePropertyManagement from "./SimplePropertyManagement";
import EnhancedPropertyInsertForm from "./EnhancedPropertyInsertForm";
import PropertyCategoriesManagement from "./PropertyCategoriesManagement";
import DiagnosticDashboard from "./DiagnosticDashboard";
import PropertySlideSettings from "./PropertySlideSettings";
import PropertyDisplaySettings from "./PropertyDisplaySettings";
import Property3DViewSettings from "./Property3DViewSettings";
import PropertySmartPreview from "./PropertySmartPreview";
import PropertyTestPanel from "./PropertyTestPanel";
import AdminAccessChecker from "./AdminAccessChecker";
import PropertyFilterSettings from "./settings/PropertyFilterSettings";
import IndonesianLocationManager from "./property/IndonesianLocationManager";
import CentralLocationSettings from "./location/CentralLocationSettings";

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Property Management Hub</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Comprehensive property management with advanced display and 3D view controls
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <div className="bg-card backdrop-blur-sm rounded-lg border border-border p-1 shadow-sm">
          <TabsList className="grid w-full grid-cols-11 bg-transparent gap-0.5 h-8">
            <TabsTrigger 
              value="diagnostic" 
              className="flex items-center gap-1 text-xs px-2 h-7"
            >
              <Activity className="h-3 w-3" />
              <span className="hidden sm:inline">Diagnostic</span>
            </TabsTrigger>
            <TabsTrigger 
              value="properties" 
              className="flex items-center gap-1 text-xs px-2 h-7"
            >
              <List className="h-3 w-3" />
              <span className="hidden sm:inline">Properties</span>
            </TabsTrigger>
            <TabsTrigger 
              value="add-property" 
              className="flex items-center gap-1 text-xs px-2 h-7"
            >
              <Plus className="h-3 w-3" />
              <span className="hidden sm:inline">Add Property</span>
            </TabsTrigger>
            <TabsTrigger 
              value="slide-settings" 
              className="flex items-center gap-1 text-xs px-2 h-7"
            >
              <Sliders className="h-3 w-3" />
              <span className="hidden sm:inline">Slides</span>
            </TabsTrigger>
            <TabsTrigger 
              value="display-settings" 
              className="flex items-center gap-1 text-xs px-2 h-7"
            >
              <Monitor className="h-3 w-3" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger 
              value="3d-view-settings" 
              className="flex items-center gap-1 text-xs px-2 h-7"
            >
              <Blocks className="h-3 w-3" />
              <span className="hidden sm:inline">3D View</span>
            </TabsTrigger>
            <TabsTrigger 
              value="smart-preview" 
              className="flex items-center gap-1 text-xs px-2 h-7"
            >
              <Eye className="h-3 w-3" />
              <span className="hidden sm:inline">Preview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="flex items-center gap-1 text-xs px-2 h-7"
            >
              <Settings className="h-3 w-3" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger 
              value="locations" 
              className="flex items-center gap-1 text-xs px-2 h-7"
            >
              <MapPin className="h-3 w-3" />
              <span className="hidden sm:inline">Locations</span>
            </TabsTrigger>
            <TabsTrigger 
              value="filters" 
              className="flex items-center gap-1 text-xs px-2 h-7"
            >
              <Filter className="h-3 w-3" />
              <span className="hidden sm:inline">Filters</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="diagnostic" className="mt-3">
          <div className="space-y-3">
            <AdminAccessChecker />
            <PropertyTestPanel />
            <DiagnosticDashboard />
          </div>
        </TabsContent>

        <TabsContent value="properties" className="mt-3">
          <SimplePropertyManagement onAddProperty={handleAddProperty} />
        </TabsContent>

        <TabsContent value="add-property" className="mt-3">
          <EnhancedPropertyInsertForm />
        </TabsContent>

        <TabsContent value="slide-settings" className="mt-3">
          <PropertySlideSettings />
        </TabsContent>

        <TabsContent value="display-settings" className="mt-3">
          <PropertyDisplaySettings />
        </TabsContent>

        <TabsContent value="3d-view-settings" className="mt-3">
          <Property3DViewSettings />
        </TabsContent>

        <TabsContent value="smart-preview" className="mt-3">
          <PropertySmartPreview />
        </TabsContent>

        <TabsContent value="categories" className="mt-3">
          <PropertyCategoriesManagement />
        </TabsContent>

        <TabsContent value="locations" className="mt-3">
          <div className="space-y-4">
            <CentralLocationSettings />
            <IndonesianLocationManager />
          </div>
        </TabsContent>

        <TabsContent value="filters" className="mt-3">
          <PropertyFilterSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPropertyManagement;
