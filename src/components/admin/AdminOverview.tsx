
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
        <Card className="card-ios border-border/20 bg-gradient-to-br from-background to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">1,234</p>
              </div>
              <div className="p-2 rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-ios border-border/20 bg-gradient-to-br from-background to-accent/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Properties</p>
                <p className="text-2xl font-bold text-foreground">567</p>
              </div>
              <div className="p-2 rounded-xl bg-accent/20">
                <Activity className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-ios border-border/20 bg-gradient-to-br from-background to-secondary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Traffic</p>
                <p className="text-2xl font-bold text-foreground">89K</p>
              </div>
              <div className="p-2 rounded-xl bg-secondary/20">
                <Globe className="h-6 w-6 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-ios border-border/20 bg-gradient-to-br from-background to-muted/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold text-foreground">98%</p>
              </div>
              <div className="p-2 rounded-xl bg-muted/30">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="card-ios border-border/20 bg-gradient-to-br from-background to-primary/5 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              Analytics Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View detailed analytics and performance metrics
            </p>
            <Button 
              variant="outline" 
              className="w-full btn-secondary-ios" 
              onClick={() => handleQuickAction('analytics')}
            >
              View Analytics
            </Button>
          </CardContent>
        </Card>

        <Card className="card-ios border-border/20 bg-gradient-to-br from-background to-accent/5 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <div className="p-1.5 rounded-lg bg-accent/20">
                <Users className="h-5 w-5 text-accent-foreground" />
              </div>
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage user accounts and permissions
            </p>
            <Button 
              variant="outline" 
              className="w-full btn-secondary-ios"
              onClick={() => handleQuickAction('user-management')}
            >
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card className="card-ios border-border/20 bg-gradient-to-br from-background to-secondary/5 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <div className="p-1.5 rounded-lg bg-secondary/20">
                <FileText className="h-5 w-5 text-secondary-foreground" />
              </div>
              System Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Generate and view system reports
            </p>
            <Button 
              variant="outline" 
              className="w-full btn-secondary-ios"
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
