
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Database, UserPlus, Crown, Monitor, Store, Building, Home, Headphones } from "lucide-react";
import SimpleUserManagement from "./SimpleUserManagement";
import UserRolesManagement from "./UserRolesManagement";
import DatabaseUserManagement from "./DatabaseUserManagement";
import UserLevelManagement from "./UserLevelManagement";
import EnhancedUserManagement from "./EnhancedUserManagement";
import UserActivityMonitoring from "./UserActivityMonitoring";
import VendorUserManagement from "./VendorUserManagement";
import AgentUserManagement from "./AgentUserManagement";
import PropertyOwnerUserManagement from "./PropertyOwnerUserManagement";
import CustomerServiceUserManagement from "./CustomerServiceUserManagement";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("enhanced");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Complete User Management System
          </CardTitle>
          <CardDescription>
            Comprehensive user management with all user-related settings, roles, levels, security tracking, and specialized management for different user types
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="enhanced" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Enhanced</span>
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Vendors</span>
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Agents</span>
          </TabsTrigger>
          <TabsTrigger value="owners" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Owners</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            <span className="hidden sm:inline">Support</span>
          </TabsTrigger>
          <TabsTrigger value="levels" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            <span className="hidden sm:inline">Levels</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Roles</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Monitor</span>
          </TabsTrigger>
          <TabsTrigger value="simple" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Quick</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Database</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enhanced" className="space-y-6">
          <EnhancedUserManagement />
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <VendorUserManagement />
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <AgentUserManagement />
        </TabsContent>

        <TabsContent value="owners" className="space-y-6">
          <PropertyOwnerUserManagement />
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <CustomerServiceUserManagement />
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
