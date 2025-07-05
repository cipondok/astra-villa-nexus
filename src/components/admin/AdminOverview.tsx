
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Activity, Globe, Users, FileText, TrendingUp } from "lucide-react";
import AdminQuickActions from "./AdminQuickActions";

interface AdminOverviewProps {
  onSectionChange?: (section: string) => void;
}

const AdminOverview = ({ onSectionChange }: AdminOverviewProps) => {
  
  const handleQuickAction = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };
  return (
    <div className="space-y-6">
      {/* Quick Actions Component */}
      <AdminQuickActions onTabChange={handleQuickAction} />
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Overview</h2>
          <p className="text-muted-foreground">
            Welcome to the admin dashboard. Monitor and manage your system from here.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Properties</p>
                <p className="text-2xl font-bold">567</p>
              </div>
              <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Traffic</p>
                <p className="text-2xl font-bold">89K</p>
              </div>
              <Globe className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold">98%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View detailed analytics and performance metrics
            </p>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => handleQuickAction('analytics')}
            >
              View Analytics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage user accounts and permissions
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleQuickAction('user-management')}
            >
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              System Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Generate and view system reports
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleQuickAction('system-reports')}
            >
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
