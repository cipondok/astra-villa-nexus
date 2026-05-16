
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Shield } from "lucide-react";
import UserDepartmentsManagement from "./UserDepartmentsManagement";
import PropertyCategoryAccessManagement from "./PropertyCategoryAccessManagement";

const RoleBasedPropertyManagement = () => {
  const [activeTab, setActiveTab] = useState("departments");

  // Fetch summary statistics
  const { data: stats } = useQuery({
    queryKey: ['role-based-stats'],
    queryFn: async () => {
      const [departmentsRes, categoriesRes, usersRes, accessRes, rolesRes] = await Promise.all([
        supabase.from('user_departments').select('id').eq('is_active', true),
        supabase.from('property_categories').select('id').eq('is_active', true),
        supabase.from('profiles').select('id'),
        supabase.from('property_category_access').select('id'),
        supabase.from('user_roles').select('role').eq('is_active', true),
      ]);

      return {
        departments: departmentsRes.data?.length || 0,
        categories: categoriesRes.data?.length || 0,
        users: usersRes.data?.length || 0,
        accessRules: accessRes.data?.length || 0,
        usersByRole: rolesRes.data?.reduce((acc: any, r: any) => {
          acc[r.role] = (acc[r.role] || 0) + 1;
          return acc;
        }, {}) || {}
      };
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role-Based Property Category Management
          </CardTitle>
          <CardDescription>
            Comprehensive system for managing user departments, roles, and property category access control
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{stats?.departments || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Property Categories</p>
                <p className="text-2xl font-bold">{stats?.categories || 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats?.users || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Access Rules</p>
                <p className="text-2xl font-bold">{stats?.accessRules || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Role Distribution */}
      {stats?.usersByRole && Object.keys(stats.usersByRole).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>User Distribution by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.usersByRole).map(([role, count]) => (
                <Badge key={role} variant="outline" className="px-3 py-1">
                  {role.replace('_', ' ').toUpperCase()}: {count as number}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Departments & Roles
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Category Access Control
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-6">
          <UserDepartmentsManagement />
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <PropertyCategoryAccessManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleBasedPropertyManagement;
