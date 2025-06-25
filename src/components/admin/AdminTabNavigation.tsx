
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Users, Settings, Activity, FileText, Globe, BarChart3, TrendingUp } from "lucide-react";

interface AdminTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminTabNavigation = ({ activeTab, onTabChange }: AdminTabNavigationProps) => {
  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: Home, 
      description: 'Dashboard overview and quick stats' 
    },
    { 
      id: 'performance-analytics', 
      label: 'Performance Analytics', 
      icon: TrendingUp,
      description: 'System performance metrics and trends'
    },
    { 
      id: 'web-traffic', 
      label: 'Web Traffic', 
      icon: Globe, 
      description: 'Website traffic and user behavior' 
    },
    { 
      id: 'vendor-performance', 
      label: 'Vendor Analytics', 
      icon: Users, 
      description: 'Vendor performance analytics' 
    },
    { 
      id: 'system-reports', 
      label: 'Reports', 
      icon: FileText, 
      description: 'Generate system reports' 
    },
  ];

  return (
    <div className="w-full">
      <TabsList className="grid w-full grid-cols-5 bg-muted rounded-lg p-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all
              data-[state=active]:bg-background data-[state=active]:text-foreground
              data-[state=active]:shadow-sm
            `}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};

export default AdminTabNavigation;
