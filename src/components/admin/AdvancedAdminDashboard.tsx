
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Activity, Globe, Users, FileText, TrendingUp, Home, Settings, Building, Store } from "lucide-react";
import AdminOverview from './AdminOverview';
import WebTrafficAnalytics from './WebTrafficAnalytics';
import VendorPerformanceAnalytics from './VendorPerformanceAnalytics';
import SystemReports from './SystemReports';
import PerformanceAnalyticsDashboard from './PerformanceAnalyticsDashboard';
import UserManagement from './UserManagement';
import PropertyManagement from './PropertyManagement';
import VendorManagementHub from './VendorManagementHub';
import SystemSettings from './SystemSettings';

const AdvancedAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  console.log('AdvancedAdminDashboard - Current active tab:', activeTab);

  const handleTabChange = (tab: string) => {
    console.log('AdvancedAdminDashboard - Tab changed to:', tab);
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    console.log('AdvancedAdminDashboard - Rendering content for tab:', activeTab);
    
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <UserManagement />;
      case 'properties':
        return <PropertyManagement />;
      case 'vendors':
        return <VendorManagementHub />;
      case 'system-settings':
        return <SystemSettings />;
      case 'performance-analytics':
        return <PerformanceAnalyticsDashboard />;
      case 'web-traffic':
        return <WebTrafficAnalytics />;
      case 'vendor-performance':
        return <VendorPerformanceAnalytics />;
      case 'system-reports':
        return <SystemReports />;
      default:
        console.log('AdvancedAdminDashboard - Unknown tab, showing overview');
        return <AdminOverview />;
    }
  };

  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: Home, 
      description: 'Dashboard overview and quick stats' 
    },
    { 
      id: 'users', 
      label: 'Users', 
      icon: Users,
      description: 'User management and permissions'
    },
    { 
      id: 'properties', 
      label: 'Properties', 
      icon: Building,
      description: 'Property listings and management'
    },
    { 
      id: 'vendors', 
      label: 'Vendors', 
      icon: Store,
      description: 'Vendor management and services'
    },
    { 
      id: 'system-settings', 
      label: 'System Settings', 
      icon: Settings,
      description: 'System configuration and settings'
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive system management and analytics
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 bg-muted rounded-lg p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
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
        
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </Tabs>
    </div>
  );
};

export default AdvancedAdminDashboard;
