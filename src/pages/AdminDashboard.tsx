
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AdminNavigation from "@/components/admin/AdminNavigation";
import UserManagement from "@/components/admin/UserManagement";
import PropertyManagement from "@/components/admin/PropertyManagement";
import SystemSettings from "@/components/admin/SystemSettings";
import SystemReports from "@/components/admin/SystemReports";
import WebsiteDesignSettings from "@/components/admin/WebsiteDesignSettings";
import { 
  Users, 
  Building, 
  Settings, 
  BarChart3, 
  Shield, 
  Bell, 
  DollarSign, 
  TrendingUp,
  Palette,
  Layout
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Sample data - in real app, this would come from your backend
  const stats = {
    totalUsers: 1234,
    totalProperties: 567,
    totalRevenue: 89012,
    activeListings: 234,
    pendingApprovals: 12,
    systemHealth: 98.5
  };

  const quickActions = [
    { label: "Add Property", action: () => console.log("Add property"), icon: Building, variant: "ios" as const },
    { label: "Manage Users", action: () => setActiveTab("users"), icon: Users, variant: "ios-green" as const },
    { label: "System Reports", action: () => setActiveTab("reports"), icon: BarChart3, variant: "ios-orange" as const },
    { label: "Website Design", action: () => setActiveTab("design"), icon: Palette, variant: "ios-red" as const }
  ];

  return (
    <div className="min-h-screen bg-background/60 backdrop-blur-xl">
      <AdminNavigation />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 glass-ios">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="properties" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Properties
              </TabsTrigger>
              <TabsTrigger value="design" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Design
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Actions */}
              <Card className="glass-ios">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant}
                        onClick={action.action}
                        className="h-16 flex flex-col items-center justify-center gap-2 glass-ios"
                      >
                        <action.icon className="h-5 w-5" />
                        <span className="text-xs">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="glass-ios">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+12%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-ios">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalProperties.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+8%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-ios">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Rp {stats.totalRevenue.toLocaleString()}M</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+15%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-ios">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeListings}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-blue-600">Live properties</span>
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-ios">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
                    <p className="text-xs text-muted-foreground">
                      <Badge variant="destructive" className="text-xs">Needs attention</Badge>
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-ios">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Health</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.systemHealth}%</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">Excellent</span> performance
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="properties">
              <PropertyManagement />
            </TabsContent>

            <TabsContent value="design">
              <WebsiteDesignSettings />
            </TabsContent>

            <TabsContent value="settings">
              <SystemSettings />
            </TabsContent>

            <TabsContent value="reports">
              <SystemReports />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
