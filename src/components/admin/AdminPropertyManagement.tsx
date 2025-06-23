
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Plus, List, Settings } from "lucide-react";
import PropertyListManagement from "./PropertyListManagement";
import RoleBasedPropertyForm from "@/components/property/RoleBasedPropertyForm";
import PropertyCategoriesManagement from "./PropertyCategoriesManagement";

const AdminPropertyManagement = () => {
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

      <Tabs defaultValue="properties" className="space-y-6">
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
          <PropertyListManagement />
        </TabsContent>

        <TabsContent value="add-property">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Property
              </CardTitle>
              <CardDescription>
                Add a new property listing with full administrative privileges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleBasedPropertyForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <PropertyCategoriesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPropertyManagement;
