
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Activity, Globe, Users, FileText, TrendingUp } from "lucide-react";
import AdminOverview from './AdminOverview';
import WebTrafficAnalytics from './WebTrafficAnalytics';
import VendorPerformanceAnalytics from './VendorPerformanceAnalytics';
import SystemReports from './SystemReports';
import AdminTabNavigation from './AdminTabNavigation';
import PerformanceAnalyticsDashboard from './PerformanceAnalyticsDashboard';

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
      
      <AdminTabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdvancedAdminDashboard;
