
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-3 p-1 md:p-0">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-500/20 dark:via-teal-500/20 dark:to-cyan-500/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50 p-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
            <List className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">Property Management Hub</h2>
              <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 text-[9px] px-1.5 py-0 h-4">
                <Activity className="h-2.5 w-2.5 mr-0.5" />
                Active
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">Comprehensive property management with advanced display and 3D view controls</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <div className="bg-card backdrop-blur-sm rounded-lg border border-emerald-200/50 dark:border-emerald-800/50 p-1 shadow-sm">
          <TabsList className="grid w-full grid-cols-11 bg-emerald-100/50 dark:bg-emerald-900/20 gap-0.5 h-7 p-0.5">
            <TabsTrigger 
              value="diagnostic" 
              className="flex items-center gap-0.5 text-[9px] px-1 h-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <Activity className="h-3 w-3" />
              <span className="hidden sm:inline">Diagnostic</span>
            </TabsTrigger>
            <TabsTrigger 
              value="properties" 
              className="flex items-center gap-0.5 text-[9px] px-1 h-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <List className="h-3 w-3" />
              <span className="hidden sm:inline">Properties</span>
            </TabsTrigger>
            <TabsTrigger 
              value="add-property" 
              className="flex items-center gap-0.5 text-[9px] px-1 h-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <Plus className="h-3 w-3" />
              <span className="hidden sm:inline">Add</span>
            </TabsTrigger>
            <TabsTrigger 
              value="slide-settings" 
              className="flex items-center gap-0.5 text-[9px] px-1 h-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <Sliders className="h-3 w-3" />
              <span className="hidden sm:inline">Slides</span>
            </TabsTrigger>
            <TabsTrigger 
              value="display-settings" 
              className="flex items-center gap-0.5 text-[9px] px-1 h-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <Monitor className="h-3 w-3" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger 
              value="3d-view-settings" 
              className="flex items-center gap-0.5 text-[9px] px-1 h-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <Blocks className="h-3 w-3" />
              <span className="hidden sm:inline">3D</span>
            </TabsTrigger>
            <TabsTrigger 
              value="smart-preview" 
              className="flex items-center gap-0.5 text-[9px] px-1 h-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <Eye className="h-3 w-3" />
              <span className="hidden sm:inline">Preview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="categories" 
              className="flex items-center gap-0.5 text-[9px] px-1 h-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <Settings className="h-3 w-3" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger 
              value="locations" 
              className="flex items-center gap-0.5 text-[9px] px-1 h-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <MapPin className="h-3 w-3" />
              <span className="hidden sm:inline">Locations</span>
            </TabsTrigger>
            <TabsTrigger 
              value="filters" 
              className="flex items-center gap-0.5 text-[9px] px-1 h-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <Filter className="h-3 w-3" />
              <span className="hidden sm:inline">Filters</span>
            </TabsTrigger>
            <TabsTrigger 
              value="global" 
              className="flex items-center gap-0.5 text-[9px] px-1 h-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <Globe className="h-3 w-3" />
              <span className="hidden sm:inline">Global</span>
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
