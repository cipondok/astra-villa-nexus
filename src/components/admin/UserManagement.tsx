
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Database, UserPlus, Crown, Monitor } from "lucide-react";
import SimpleUserManagement from "./SimpleUserManagement";
import UserRolesManagement from "./UserRolesManagement";
import DatabaseUserManagement from "./DatabaseUserManagement";
import UserLevelManagement from "./UserLevelManagement";
import EnhancedUserManagement from "./EnhancedUserManagement";
import UserActivityMonitoring from "./UserActivityMonitoring";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("enhanced");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Advanced User Management System
          </CardTitle>
          <CardDescription>
            Comprehensive user management with roles, levels, security tracking, and suspension controls
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="enhanced" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Enhanced Management
          </TabsTrigger>
          <TabsTrigger value="levels" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            User Levels
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Activity Monitoring
          </TabsTrigger>
          <TabsTrigger value="simple" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Quick Management
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Access
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enhanced" className="space-y-6">
          <EnhancedUserManagement />
        </TabsContent>

        <TabsContent value="levels" className="space-y-6">
          <UserLevelManagement />
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <UserRolesManagement />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <UserActivityMonitoring />
        </TabsContent>

        <TabsContent value="simple" className="space-y-6">
          <SimpleUserManagement />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <DatabaseUserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
