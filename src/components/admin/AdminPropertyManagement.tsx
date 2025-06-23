
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Plus, List, Settings } from "lucide-react";
import PropertyListManagement from "./PropertyListManagement";
import PropertyInsertForm from "./PropertyInsertForm";
import PropertyCategoriesManagement from "./PropertyCategoriesManagement";

const AdminPropertyManagement = () => {
  const [activeTab, setActiveTab] = useState("properties");

  const handleAddProperty = () => {
    setActiveTab("add-property");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Property Management Hub
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive property management for administrators
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
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
        </TabsList>

        <TabsContent value="properties">
          <PropertyListManagement onAddProperty={handleAddProperty} />
        </TabsContent>

        <TabsContent value="add-property">
          <PropertyInsertForm />
        </TabsContent>

        <TabsContent value="categories">
          <PropertyCategoriesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPropertyManagement;
