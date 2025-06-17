
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Database, UserPlus } from "lucide-react";
import SimpleUserManagement from "./SimpleUserManagement";
import UserRolesManagement from "./UserRolesManagement";
import DatabaseUserManagement from "./DatabaseUserManagement";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("simple");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management System
          </CardTitle>
          <CardDescription>
            Comprehensive user management with role assignments, verification, and database access
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="simple" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Quick Management
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Access
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simple" className="space-y-6">
          <SimpleUserManagement />
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <UserRolesManagement />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <DatabaseUserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
