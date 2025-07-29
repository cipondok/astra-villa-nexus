
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Database, UserPlus, Crown, Monitor, Store, Building, Home, Headphones } from "lucide-react";
import SimpleUserManagement from "./SimpleUserManagement";
import UserRolesManagement from "./UserRolesManagement";
import DatabaseUserManagement from "./DatabaseUserManagement";
import UserLevelManagement from "./UserLevelManagement";
import EnhancedUserManagement from "./EnhancedUserManagement";
import RealTimeSecurityMonitoring from "./RealTimeSecurityMonitoring";
import VendorUserManagement from "./VendorUserManagement";
import AgentUserManagement from "./AgentUserManagement";
import PropertyOwnerUserManagement from "./PropertyOwnerUserManagement";
import CustomerServiceUserManagement from "./CustomerServiceUserManagement";
import DatabaseUserSettings from "./DatabaseUserSettings";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("roles");

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Advanced User Management System
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Comprehensive user management with roles, levels, security tracking, and role-specific management
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
          <TabsTrigger 
            value="roles" 
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">User Roles</span>
          </TabsTrigger>
          <TabsTrigger 
            value="enhanced" 
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Enhanced</span>
          </TabsTrigger>
          <TabsTrigger 
            value="vendors" 
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Vendors</span>
          </TabsTrigger>
          <TabsTrigger 
            value="agents" 
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Agents</span>
          </TabsTrigger>
          <TabsTrigger 
            value="owners" 
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Owners</span>
          </TabsTrigger>
          <TabsTrigger 
            value="support" 
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Headphones className="h-4 w-4" />
            <span className="hidden sm:inline">Support</span>
          </TabsTrigger>
          <TabsTrigger 
            value="levels" 
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Crown className="h-4 w-4" />
            <span className="hidden sm:inline">Levels</span>
          </TabsTrigger>
          <TabsTrigger 
            value="monitoring" 
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Monitor</span>
          </TabsTrigger>
          <TabsTrigger 
            value="simple" 
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Quick</span>
          </TabsTrigger>
          <TabsTrigger 
            value="database" 
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Database</span>
          </TabsTrigger>
        </TabsList>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <TabsContent value="roles" className="space-y-6 mt-0">
            <UserRolesManagement />
          </TabsContent>

          <TabsContent value="enhanced" className="space-y-6 mt-0">
            <EnhancedUserManagement />
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6 mt-0">
            <VendorUserManagement />
          </TabsContent>

          <TabsContent value="agents" className="space-y-6 mt-0">
            <AgentUserManagement />
          </TabsContent>

          <TabsContent value="owners" className="space-y-6 mt-0">
            <PropertyOwnerUserManagement />
          </TabsContent>

          <TabsContent value="support" className="space-y-6 mt-0">
            <CustomerServiceUserManagement />
          </TabsContent>

          <TabsContent value="levels" className="space-y-6 mt-0">
            <UserLevelManagement />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6 mt-0">
            <RealTimeSecurityMonitoring />
          </TabsContent>

          <TabsContent value="simple" className="space-y-6 mt-0">
            <SimpleUserManagement />
          </TabsContent>

          <TabsContent value="database" className="space-y-6 mt-0">
            <DatabaseUserSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default UserManagement;
