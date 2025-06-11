
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Shield, Database, Home, FileText, Store, MessageSquare, Activity, Settings, Crown, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AdminNavigation = ({ activeSection, onSectionChange }: AdminNavigationProps) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.email === 'mycode103@gmail.com';

  if (!user) {
    return (
      <Card className="card-ios">
        <CardContent className="p-6">
          <p className="text-muted-foreground">Please log in to view this page.</p>
        </CardContent>
      </Card>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Card className="card-ios">
        <CardContent className="p-6">
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
        </CardContent>
      </Card>
    );
  }

  const navigationItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: BarChart3, color: 'text-ios-blue' },
    { id: 'simple-users', label: 'User Management', icon: Users, color: 'text-ios-green' },
    { id: 'user-roles', label: 'Advanced Roles', icon: Shield, color: 'text-ios-purple' },
    { id: 'database-users', label: 'Database Users', icon: Database, color: 'text-ios-orange' },
    { id: 'properties', label: 'Property Management', icon: Home, color: 'text-ios-blue' },
    { id: 'content', label: 'Content Management', icon: FileText, color: 'text-ios-pink' },
    { id: 'vendors', label: 'Vendor Management', icon: Store, color: 'text-ios-green' },
    { id: 'feedback', label: 'Feedback & Reports', icon: MessageSquare, color: 'text-ios-yellow' },
    { id: 'system-monitor', label: 'System Monitor', icon: Activity, color: 'text-ios-red' },
    { id: 'settings', label: 'System Settings', icon: Settings, color: 'text-muted-foreground' },
  ];

  return (
    <Card className="card-ios sticky top-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="btn-ios flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back</span>
            </Button>
          </Link>
        </div>
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <Shield className="h-5 w-5 text-primary" />
          Admin Control Panel
          {isSuperAdmin && (
            <Badge variant="destructive" className="text-xs">
              <Crown className="h-3 w-3 mr-1" />
              Super Admin
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {isSuperAdmin ? 'Full System Control Access' : 'Administrator Dashboard'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left rounded-none 
                  transition-all duration-200 ease-out group
                  ${isActive 
                    ? 'bg-primary/10 border-r-2 border-primary text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }
                `}
              >
                <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-primary' : item.color}`} />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Active
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
};

export default AdminNavigation;
