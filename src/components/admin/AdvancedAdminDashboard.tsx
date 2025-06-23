
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  Building2, 
  Settings, 
  Shield, 
  MessageSquare, 
  TrendingUp,
  Database,
  FileText,
  Briefcase,
  UserCheck,
  Layers,
  Plus
} from "lucide-react";

// Import existing components
import UserManagement from "./UserManagement";
import PropertyCategoriesManagement from "./PropertyCategoriesManagement";
import RoleBasedPropertyManagement from "./RoleBasedPropertyManagement";
import AdminPropertyManagement from "./AdminPropertyManagement";
import AdminTopMenu from "./AdminTopMenu";

const AdvancedAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Handle search functionality here
    console.log("Searching for:", query);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Top Header Menu */}
        <AdminTopMenu 
          title="Advanced Admin Dashboard"
          subtitle="Comprehensive management system for users, properties, and platform administration"
          showSearch={true}
          onSearch={handleSearch}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-white/20 dark:border-slate-700/50 p-2">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 bg-transparent">
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger 
                value="properties" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
              >
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Properties</span>
              </TabsTrigger>
              <TabsTrigger 
                value="property-hub" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Property Hub</span>
              </TabsTrigger>
              <TabsTrigger 
                value="roles" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Roles & Access</span>
              </TabsTrigger>
              <TabsTrigger 
                value="content" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Content</span>
              </TabsTrigger>
              <TabsTrigger 
                value="system" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">System</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Users</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">1,234</p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Properties</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">567</p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                      <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Agents</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">89</p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                      <UserCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Departments</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">8</p>
                    </div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                      <Layers className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Card className="p-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors bg-slate-50/50 dark:bg-slate-700/50" onClick={() => setActiveTab("users")}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Manage Users</span>
                      </div>
                    </Card>
                    <Card className="p-4 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors bg-slate-50/50 dark:bg-slate-700/50" onClick={() => setActiveTab("property-hub")}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Property Management</span>
                      </div>
                    </Card>
                    <Card className="p-4 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors bg-slate-50/50 dark:bg-slate-700/50" onClick={() => setActiveTab("properties")}>
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Property Categories</span>
                      </div>
                    </Card>
                    <Card className="p-4 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors bg-slate-50/50 dark:bg-slate-700/50" onClick={() => setActiveTab("roles")}>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Role Management</span>
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">Recent Activity</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">Latest system activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">New user registration</span>
                      <Badge variant="outline" className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                        2 min ago
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">Property approved</span>
                      <Badge variant="outline" className="border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                        5 min ago
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">Department access updated</span>
                      <Badge variant="outline" className="border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
                        10 min ago
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">System backup completed</span>
                      <Badge variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                        1 hour ago
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <PropertyCategoriesManagement />
          </TabsContent>

          <TabsContent value="property-hub" className="space-y-6">
            <AdminPropertyManagement />
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <RoleBasedPropertyManagement />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <FileText className="h-5 w-5" />
                  Content Management
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Manage website content, blogs, and documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">Content management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Configure system settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">System configuration features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedAdminDashboard;
