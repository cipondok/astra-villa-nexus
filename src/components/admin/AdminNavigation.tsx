
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    return <p>Please log in to view this page.</p>;
  }

  if (!isSuperAdmin) {
    return <p>You do not have permission to view this page.</p>;
  }

  const navigationItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
    { id: 'simple-users', label: 'Simple User Management', icon: Users },
    { id: 'user-roles', label: 'Advanced User Roles', icon: Shield },
    { id: 'database-users', label: 'Database Management', icon: Database },
    { id: 'properties', label: 'Property Management', icon: Home },
    { id: 'content', label: 'Content Management', icon: FileText },
    { id: 'vendors', label: 'Vendor Management', icon: Store },
    { id: 'feedback', label: 'Feedback & Reports', icon: MessageSquare },
    { id: 'system-monitor', label: 'System Monitor', icon: Activity },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <Link to="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-blue-600" />
          Admin Control Panel
          {isSuperAdmin && <Crown className="h-4 w-4 text-red-600" />}
        </CardTitle>
        <CardDescription>
          {isSuperAdmin ? 'Super Admin Access - Full System Control' : 'Administrator Dashboard'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-none hover:bg-gray-50 transition-colors ${
                  activeSection === item.id 
                    ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-900' 
                    : 'text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
};

export default AdminNavigation;
