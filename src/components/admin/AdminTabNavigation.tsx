import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Users, Settings, Activity, FileText, Globe, BarChart3, TrendingUp } from "lucide-react";

interface AdminTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminTabNavigation = ({ activeTab, onTabChange }: AdminTabNavigationProps) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home, description: 'Dashboard overview and quick stats' },
    { id: 'users', label: 'User Management', icon: Users, description: 'Manage user accounts and roles' },
    { id: 'settings', label: 'System Settings', icon: Settings, description: 'Configure system-wide settings' },
    { 
      id: 'performance-analytics', 
      label: 'Performance Analytics', 
      icon: TrendingUp,
      description: 'System performance metrics and trends'
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'System usage and performance analytics' },
    { id: 'web-traffic', label: 'Web Traffic', icon: Globe, description: 'Website traffic and user behavior' },
    { id: 'reports', label: 'Reports', icon: FileText, description: 'Generate system reports' },
  ];

  return (
    <Tabs defaultValue={activeTab} className="w-full">
      <TabsList className="bg-secondary rounded-md p-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md`}
          >
            <div className="flex items-center space-x-2">
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default AdminTabNavigation;
