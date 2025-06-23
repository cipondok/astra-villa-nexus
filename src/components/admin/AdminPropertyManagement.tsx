
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Plus, List, Settings, MapPin } from "lucide-react";
import PropertyListManagement from "./PropertyListManagement";
import EnhancedPropertyInsertForm from "./EnhancedPropertyInsertForm";
import PropertyCategoriesManagement from "./PropertyCategoriesManagement";
import LocationDatabaseManager from "./LocationDatabaseManager";
import AdminTopMenu from "./AdminTopMenu";

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
      <AdminTopMenu 
        title="Property Management Hub"
        subtitle="Comprehensive property management for administrators"
        showSearch={true}
        onSearch={handleSearch}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="properties" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Property List
          </TabsTrigger>
          <TabsTrigger value="add-property" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Property
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Locations
          </TabsTrigger>
        </TabsList>

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
