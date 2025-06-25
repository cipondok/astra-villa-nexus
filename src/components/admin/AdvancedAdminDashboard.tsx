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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'web-traffic':
        return <WebTrafficAnalytics />;
      case 'vendor-performance':
        return <VendorPerformanceAnalytics />;
      case 'system-reports':
        return <SystemReports />;
      case 'performance-analytics':
        return <PerformanceAnalyticsDashboard />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="space-y-6">
      <AdminTabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      {renderTabContent()}
    </div>
  );
};

export default AdvancedAdminDashboard;
